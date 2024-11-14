//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Token.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CapICO is ReentrancyGuard, Pausable, Ownable {
    Token public immutable token;
    
    struct Tier {
        uint256 price;          // Price per token in wei
        uint256 maxTokens;      // Maximum tokens available in this tier
        uint256 tokensSold;     // Tokens sold in this tier
        uint256 startTime;      // When this tier starts
        uint256 endTime;        // When this tier ends
    }
    
    struct Distribution {
        uint256 amount;         // Amount to distribute
        uint256 releaseTime;    // When tokens can be claimed
        bool claimed;           // Whether tokens have been claimed
    }
    
    Tier[] public tiers;
    uint256 public currentTier;
    
    uint256 public softCap;
    uint256 public minInvestment;
    uint256 public maxInvestment;
    uint256 public totalTokensSold;
    bool public isFinalized;
    
    mapping(address => bool) public whitelist;
    mapping(address => uint256) public investments;
    mapping(address => Distribution[]) public distributions;
    
    event Buy(address indexed buyer, uint256 amount, uint256 tier);
    event TierAdvanced(uint256 newTier);
    event WhitelistUpdated(address indexed user, bool status);
    event TokensClaimed(address indexed user, uint256 amount);
    event Refunded(address indexed user, uint256 amount);
    event DistributionScheduled(address indexed user, uint256 amount, uint256 releaseTime);
    event Finalize(uint256 tokensSold, uint256 ethRaised);
    
    constructor(
        Token _token,
        uint256 _softCap,
        uint256 _minInvestment,
        uint256 _maxInvestment
    ) {
        require(address(_token) != address(0), "Invalid token");
        require(_softCap > 0, "Invalid soft cap");
        require(_minInvestment > 0 && _minInvestment <= _maxInvestment, "Invalid investment limits");
        
        token = _token;
        softCap = _softCap;
        minInvestment = _minInvestment;
        maxInvestment = _maxInvestment;
    }
    
    function addTier(
        uint256 _price,
        uint256 _maxTokens,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyOwner {
        require(_startTime > block.timestamp, "Invalid start time");
        require(_endTime > _startTime, "Invalid end time");
        require(_price > 0, "Invalid price");
        require(_maxTokens > 0, "Invalid max tokens");
        
        if (tiers.length > 0) {
            require(_startTime > tiers[tiers.length - 1].endTime, "Overlapping tiers");
        }
        
        tiers.push(Tier({
            price: _price,
            maxTokens: _maxTokens,
            tokensSold: 0,
            startTime: _startTime,
            endTime: _endTime
        }));
    }
    
    function getCurrentTier() public view returns (Tier memory) {
        require(tiers.length > 0, "No tiers configured");
        require(currentTier < tiers.length, "All tiers completed");
        return tiers[currentTier];
    }
    
    function advanceTier() external onlyOwner {
        require(currentTier < tiers.length - 1, "No more tiers");
        require(block.timestamp >= tiers[currentTier].endTime, "Current tier not ended");
        currentTier++;
        emit TierAdvanced(currentTier);
    }
    
    function updateWhitelist(address[] calldata users, bool status) external onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            whitelist[users[i]] = status;
            emit WhitelistUpdated(users[i], status);
        }
    }
    
    function buyTokens(uint256 _amount) public payable nonReentrant whenNotPaused {
        require(whitelist[msg.sender], "Not whitelisted");
        
        Tier storage tier = tiers[currentTier];
        require(block.timestamp >= tier.startTime && block.timestamp <= tier.endTime, "Tier not active");
        require(tier.tokensSold + _amount <= tier.maxTokens, "Exceeds tier capacity");
        
        uint256 cost = (_amount * tier.price) / 1e18;
        require(msg.value == cost, "Incorrect payment");
        require(msg.value >= minInvestment, "Below min investment");
        require(investments[msg.sender] + msg.value <= maxInvestment, "Exceeds max investment");
        
        investments[msg.sender] += msg.value;
        tier.tokensSold += _amount;
        totalTokensSold += _amount;
        
        uint256 purchaseTime = block.timestamp;
        
        uint256 immediate = _amount / 2;
        require(token.transfer(msg.sender, immediate), "Transfer failed");
        
        uint256 delayed = _amount / 4;
        distributions[msg.sender].push(Distribution({
            amount: delayed,
            releaseTime: purchaseTime + 30 days,
            claimed: false
        }));
        
        distributions[msg.sender].push(Distribution({
            amount: delayed,
            releaseTime: purchaseTime + 60 days,
            claimed: false
        }));
        
        emit Buy(msg.sender, _amount, currentTier);
        emit DistributionScheduled(msg.sender, delayed, purchaseTime + 30 days);
        emit DistributionScheduled(msg.sender, delayed, purchaseTime + 60 days);
    }
    
    function claimDistribution(uint256 index) external nonReentrant {
        Distribution storage dist = distributions[msg.sender][index];
        require(!dist.claimed, "Already claimed");
        require(block.timestamp >= dist.releaseTime, "Too early");
        
        dist.claimed = true;
        require(token.transfer(msg.sender, dist.amount), "Transfer failed");
        
        emit TokensClaimed(msg.sender, dist.amount);
    }
    
    function claimRefund() external nonReentrant {
        require(block.timestamp > tiers[tiers.length - 1].endTime, "ICO not ended");
        require(!isFinalized, "ICO finalized");
        require(address(this).balance < softCap, "Soft cap reached");
        
        uint256 investment = investments[msg.sender];
        require(investment > 0, "No investment");
        
        investments[msg.sender] = 0;
        payable(msg.sender).transfer(investment);
        
        emit Refunded(msg.sender, investment);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function finalize() external onlyOwner {
        require(block.timestamp > tiers[tiers.length - 1].endTime, "ICO not ended");
        require(!isFinalized, "Already finalized");
        require(address(this).balance >= softCap, "Soft cap not reached");
        
        isFinalized = true;
        
        uint256 remainingTokens = token.balanceOf(address(this));
        if (remainingTokens > 0) {
            uint256 contractBalance = token.balanceOf(address(this));
            uint256 transferAmount = remainingTokens > contractBalance ? contractBalance : remainingTokens;
            require(token.transfer(owner(), transferAmount), "Token transfer failed");
        }
        
        uint256 value = address(this).balance;
        (bool sent, ) = owner().call{value: value}("");
        require(sent, "Failed to send ETH");
        
        emit Finalize(totalTokensSold, value);
    }
    
    receive() external payable {
        Tier storage tier = tiers[currentTier];
        uint256 amount = (msg.value * 1e18) / tier.price;
        buyTokens(amount);
    }
}
