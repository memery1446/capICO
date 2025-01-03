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
    bool public cooldownEnabled = false;
    mapping(address => uint256) public lastPurchaseTime;
    uint256 public constant COOLDOWN_DURATION = 1 hours;

    event TokensPurchased(address buyer, uint256 amount);
    event WhitelistUpdated(address user, bool status);
    event ICOStatusUpdated(bool isActive);
    event CooldownToggled(bool enabled);

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

    function toggleCooldown() external onlyOwner {
        cooldownEnabled = !cooldownEnabled;
        emit CooldownToggled(cooldownEnabled);
    }

    function buyTokens() external payable {
        require(isActive, "ICO not active");
        require(whitelist[msg.sender], "Not whitelisted");
        require(msg.value > 0, "Invalid amount");
        require(totalRaised + msg.value <= hardCap, "Hard cap reached");

        if (cooldownEnabled) {
            require(block.timestamp >= lastPurchaseTime[msg.sender] + COOLDOWN_DURATION, "Cooldown period not over");
        }

        uint256 tokenAmount = (msg.value * 10**18) / tokenPrice;
        totalRaised += msg.value;

        require(token.transfer(msg.sender, tokenAmount), "Transfer failed");
        lastPurchaseTime[msg.sender] = block.timestamp;
        emit TokensPurchased(msg.sender, tokenAmount);
    }

    function updateWhitelist(address[] calldata users, bool status) external onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            whitelist[users[i]] = status;
            emit WhitelistUpdated(users[i], status);
        }
    }

    function cooldownTimeLeft(address user) external view returns (uint256) {
        if (!cooldownEnabled) {
            return 0;
        }
        uint256 timeSinceLastPurchase = block.timestamp - lastPurchaseTime[user];
        if (timeSinceLastPurchase >= COOLDOWN_DURATION) {
            return 0;
        }
        return COOLDOWN_DURATION - timeSinceLastPurchase;
    }
}

