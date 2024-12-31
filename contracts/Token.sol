// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Token is ERC20, ERC20Pausable, Ownable, ReentrancyGuard {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * (10**18); // 1 billion tokens
    uint256 public immutable launchTime;
    mapping(address => uint256) public lastTransferTime;
    uint256 public TRANSFER_COOLDOWN = 1 days;
    uint256 public DEMO_TRANSFER_COOLDOWN = 2 minutes;
    uint256 public MAX_TRANSFER_AMOUNT = 100_000 * (10**18); // 100k tokens
    bool public isDemoMode = true;
    mapping(address => bool) public exemptAccounts;

    event TransferLimitUpdated(uint256 newLimit);
    event CooldownUpdated(uint256 newCooldown);
    event DemoModeToggled(bool isDemoMode);
    event ExemptAccountSet(address account, bool isExempt);

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        require(initialSupply * (10**18) <= MAX_SUPPLY, "Exceeds max supply");
        _mint(msg.sender, initialSupply * (10**18));
        launchTime = block.timestamp;
        exemptAccounts[msg.sender] = true;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
        
        // Skip checks for minting, burning, and exempt accounts
        if (from == address(0) || to == address(0) || exemptAccounts[from]) return;

        require(amount <= MAX_TRANSFER_AMOUNT, "Transfer amount too large");

        uint256 cooldownPeriod = isDemoMode ? DEMO_TRANSFER_COOLDOWN : TRANSFER_COOLDOWN;
        require(
            lastTransferTime[from] + cooldownPeriod <= block.timestamp,
            "Transfer cooldown active"
        );
        
        lastTransferTime[from] = block.timestamp;
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setTransferCooldown(uint256 newCooldown) external onlyOwner {
        TRANSFER_COOLDOWN = newCooldown;
        emit CooldownUpdated(newCooldown);
    }

    function setDemoTransferCooldown(uint256 newCooldown) external onlyOwner {
        DEMO_TRANSFER_COOLDOWN = newCooldown;
        emit CooldownUpdated(newCooldown);
    }

    function setMaxTransferAmount(uint256 newLimit) external onlyOwner {
        MAX_TRANSFER_AMOUNT = newLimit;
        emit TransferLimitUpdated(newLimit);
    }

    function toggleDemoMode() external onlyOwner {
        isDemoMode = !isDemoMode;
        emit DemoModeToggled(isDemoMode);
    }

    function setExemptAccount(address account, bool isExempt) external onlyOwner {
        exemptAccounts[account] = isExempt;
        emit ExemptAccountSet(account, isExempt);
    }
}

