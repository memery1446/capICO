// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ICOToken.sol";  // Make sure ICOToken.sol is in the same directory

contract CapICO is Ownable, ReentrancyGuard {
    ICOToken public token;
    
    uint256 public startTime;
    uint256 public endTime;
    uint256 public tokenPrice;
    uint256 public hardCap;
    uint256 public totalRaised;
    
    mapping(address => bool) public whitelist;
    
    event TokensPurchased(address buyer, uint256 amount);
    event WhitelistUpdated(address user, bool status);
    
    modifier icoActive() {
        require(block.timestamp >= startTime, "ICO not started");
        require(block.timestamp <= endTime, "ICO ended");
        require(totalRaised < hardCap, "Hard cap reached");
        _;
    }
    
    constructor(
        address _token,
        uint256 _tokenPrice,
        uint256 _hardCap,
        uint256 _startTime,
        uint256 _endTime
    ) {
        require(_token != address(0), "Invalid token");
        require(_tokenPrice > 0, "Invalid price");
        require(_hardCap > 0, "Invalid cap");
        require(_startTime > block.timestamp, "Invalid start");
        require(_endTime > _startTime, "Invalid end");
        
        token = ICOToken(_token);
        tokenPrice = _tokenPrice;
        hardCap = _hardCap;
        startTime = _startTime;
        endTime = _endTime;
        
        // Whitelist deployer
        whitelist[msg.sender] = true;
        emit WhitelistUpdated(msg.sender, true);
    }
    
    function buyTokens() external payable nonReentrant icoActive {
        require(whitelist[msg.sender], "Not whitelisted");
        require(msg.value > 0, "Invalid amount");
        require(totalRaised + msg.value <= hardCap, "Exceeds hard cap");
        
        uint256 tokenAmount = (msg.value * 10 ** token.decimals()) / tokenPrice;
        totalRaised += msg.value;
        
        require(token.transfer(msg.sender, tokenAmount), "Transfer failed");
        emit TokensPurchased(msg.sender, tokenAmount);
    }
    
    function updateWhitelist(address[] calldata users, bool status) 
        external 
        onlyOwner 
    {
        for (uint256 i = 0; i < users.length; i++) {
            whitelist[users[i]] = status;
            emit WhitelistUpdated(users[i], status);
        }
    }
    
    function withdraw() external onlyOwner {
        require(block.timestamp > endTime, "ICO not ended");
        uint256 balance = address(this).balance;
        (bool sent,) = msg.sender.call{value: balance}("");
        require(sent, "Failed to send ETH");
    }

    function updateTimes(uint256 _startTime, uint256 _endTime) external onlyOwner {
        require(_startTime > block.timestamp, "Invalid start");
        require(_endTime > _startTime, "Invalid end");
        startTime = _startTime;
        endTime = _endTime;
    }
}

