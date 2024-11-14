//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Token is ERC20, ERC20Pausable, Ownable, ReentrancyGuard {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * (10**18); // 1 billion tokens
    uint256 public immutable launchTime;
    mapping(address => uint256) public lastTransferTime;
    uint256 public constant TRANSFER_COOLDOWN = 1 days;
    uint256 public constant MAX_TRANSFER_AMOUNT = 100_000 * (10**18); // 100k tokens

    event TransferLimitUpdated(uint256 newLimit);
    event CooldownUpdated(uint256 newCooldown);

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        require(initialSupply * (10**18) <= MAX_SUPPLY, "Exceeds max supply");
        _mint(msg.sender, initialSupply * (10**18));
        launchTime = block.timestamp;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
        
        // Skip checks for minting and burning
        if (from == address(0) || to == address(0)) return;
        
        // Skip checks for contract owner
        if (owner() == from) return;

        require(amount <= MAX_TRANSFER_AMOUNT, "Transfer amount too large");
        require(
            lastTransferTime[from] + TRANSFER_COOLDOWN <= block.timestamp,
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

    // For CapICO contract emergency control
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
