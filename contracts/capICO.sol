// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Token.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CapICO is ReentrancyGuard, Pausable, Ownable {
    Token public immutable token;
    
    struct Distribution {
        uint256 amount;
        uint256 releaseTime;
        bool claimed;
    }
    
    uint256 public startTime;
    uint256 public endTime;
    uint256 public immutable tokenPrice;
    uint256 public immutable softCap;
    uint256 public immutable hardCap;
    uint256 public immutable minInvestment;
    uint256 public immutable maxInvestment;
    uint256 public totalTokensSold;
    uint256 public totalRaised;
    bool public isFinalized;
    bool public isDemoMode = true;
    
    mapping(address => bool) public whitelist;
    mapping(address => uint256) public investments;
    mapping(address => Distribution[]) public distributions;
    
    event Buy(address indexed buyer, uint256 amount);
    event WhitelistUpdated(address indexed user, bool status);
    event TokensClaimed(address indexed user, uint256 amount);
    event Refunded(address indexed user, uint256 amount);
    event DistributionScheduled(address indexed user, uint256 amount, uint256 releaseTime);
    event Finalize(uint256 tokensSold, uint256 ethRaised);
    event DemoModeToggled(bool isDemoMode);
    event ICOTimesUpdated(uint256 newStartTime, uint256 newEndTime);
    
    constructor(
        Token _token,
        uint256 _tokenPrice,
        uint256 _softCap,
        uint256 _hardCap,
        uint256 _minInvestment,
        uint256 _maxInvestment,
        uint256 _startTime,
        uint256 _endTime
    ) {
        require(address(_token) != address(0), "Invalid token");
        require(_tokenPrice > 0, "Invalid token price");
        require(_softCap > 0 && _softCap < _hardCap, "Invalid caps");
        require(_minInvestment > 0 && _minInvestment <= _maxInvestment, "Invalid investment limits");
        require(_startTime > block.timestamp, "Invalid start time");
        require(_endTime > _startTime, "Invalid end time");
        
        token = _token;
        tokenPrice = _tokenPrice;
        softCap = _softCap;
        hardCap = _hardCap;
        minInvestment = _minInvestment;
        maxInvestment = _maxInvestment;
        startTime = _startTime;
        endTime = _endTime;

        whitelist[msg.sender] = true;
        emit WhitelistUpdated(msg.sender, true);
    }
    
    function updateWhitelist(address[] calldata users, bool status) external onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            whitelist[users[i]] = status;
            emit WhitelistUpdated(users[i], status);
        }
    }
    
    function buyTokens(uint256 _amount) public payable nonReentrant whenNotPaused {
        require(whitelist[msg.sender], "Not whitelisted");
        require(block.timestamp >= startTime && block.timestamp <= endTime, "ICO not active");
        require(!isFinalized, "ICO finalized");
        
        uint256 cost = (_amount * tokenPrice) / 1e18;
        require(msg.value == cost, "Incorrect payment");
        require(msg.value >= minInvestment, "Below min investment");
        require(investments[msg.sender] + msg.value <= maxInvestment, "Exceeds max investment");
        require(totalRaised + msg.value <= hardCap, "Hard cap reached");
        
        investments[msg.sender] += msg.value;
        totalTokensSold += _amount;
        totalRaised += msg.value;
        
        uint256 immediate = _amount / 2;
        require(token.transfer(msg.sender, immediate), "Transfer failed");
        
        uint256 delayed = _amount / 4;
        uint256 firstReleaseTime = isDemoMode ? block.timestamp + 2 minutes : block.timestamp + 30 days;
        uint256 secondReleaseTime = isDemoMode ? block.timestamp + 4 minutes : block.timestamp + 60 days;

        distributions[msg.sender].push(Distribution({
            amount: delayed,
            releaseTime: firstReleaseTime,
            claimed: false
        }));
        
        distributions[msg.sender].push(Distribution({
            amount: delayed,
            releaseTime: secondReleaseTime,
            claimed: false
        }));
        
        emit Buy(msg.sender, _amount);
        emit DistributionScheduled(msg.sender, delayed, firstReleaseTime);
        emit DistributionScheduled(msg.sender, delayed, secondReleaseTime);
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
        require(block.timestamp > endTime, "ICO not ended");
        require(!isFinalized, "ICO finalized");
        require(totalRaised < softCap, "Soft cap reached");
        
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
        require(block.timestamp > endTime, "ICO not ended");
        require(!isFinalized, "Already finalized");
        require(totalRaised >= softCap, "Soft cap not reached");
        
        isFinalized = true;
        
        uint256 remainingTokens = token.balanceOf(address(this));
        if (remainingTokens > 0) {
            require(token.transfer(owner(), remainingTokens), "Token transfer failed");
        }
        
        uint256 value = address(this).balance;
        (bool sent, ) = owner().call{value: value}("");
        require(sent, "Failed to send ETH");
        
        emit Finalize(totalTokensSold, value);
    }
    
    function toggleDemoMode() external onlyOwner {
        isDemoMode = !isDemoMode;
        emit DemoModeToggled(isDemoMode);
    }

    function updateICOTimes(uint256 _startTime, uint256 _endTime) external onlyOwner {
        require(_startTime < _endTime, "Invalid time range");
        startTime = _startTime;
        endTime = _endTime;
        emit ICOTimesUpdated(_startTime, _endTime);
    }
    
    receive() external payable {
        uint256 amount = (msg.value * 1e18) / tokenPrice;
        buyTokens(amount);
    }
}

