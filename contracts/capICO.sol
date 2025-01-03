// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CapICO is Ownable {
    IERC20 public token;
    uint256 public tokenPrice;
    uint256 public hardCap;
    uint256 public totalRaised;
    mapping(address => bool) public whitelist;
    bool public isActive = true;
    uint256 public timeRemaining;
    bool public useTimeRemaining = false;

    event TokensPurchased(address buyer, uint256 amount);
    event WhitelistUpdated(address user, bool status);
    event ICOStatusUpdated(bool isActive);
    event TimeRemainingUpdated(uint256 timeRemaining);
    event UseTimeRemainingUpdated(bool useTimeRemaining);

    constructor(
        address _token,
        uint256 _tokenPrice,
        uint256 _hardCap
    ) {
        token = IERC20(_token);
        tokenPrice = _tokenPrice;
        hardCap = _hardCap;
        whitelist[msg.sender] = true; // Whitelist deployer
    }

    function toggleActive() external onlyOwner {
        isActive = !isActive;
        emit ICOStatusUpdated(isActive);
    }

    function setTimeRemaining(uint256 _timeRemaining) external onlyOwner {
        timeRemaining = _timeRemaining;
        emit TimeRemainingUpdated(timeRemaining);
    }

    function toggleUseTimeRemaining() external onlyOwner {
        useTimeRemaining = !useTimeRemaining;
        emit UseTimeRemainingUpdated(useTimeRemaining);
    }

    function buyTokens() external payable {
        require(isActive, "ICO not active");
        require(whitelist[msg.sender], "Not whitelisted");
        require(msg.value > 0, "Invalid amount");
        require(totalRaised + msg.value <= hardCap, "Hard cap reached");

        uint256 tokenAmount = (msg.value * 10**18) / tokenPrice;
        totalRaised += msg.value;

        require(token.transfer(msg.sender, tokenAmount), "Transfer failed");
        emit TokensPurchased(msg.sender, tokenAmount);
    }

    function updateWhitelist(address[] calldata users, bool status) external onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            whitelist[users[i]] = status;
            emit WhitelistUpdated(users[i], status);
        }
    }

    function getTimeRemaining() public view returns (uint256) {
        if (!useTimeRemaining) {
            return 0;
        }
        return timeRemaining > 0 ? timeRemaining : 0;
    }

    function decreaseTimeRemaining() external {
        require(useTimeRemaining, "Time remaining is not in use");
        if (timeRemaining > 0) {
            timeRemaining--;
            emit TimeRemainingUpdated(timeRemaining);
        }
    }
}

