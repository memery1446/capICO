// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract ICOFactory is Ownable {
    struct SaleConfig {
        uint256 startTime;
        uint256 duration;
        uint256 tokenPrice;
        uint256 minPurchase;
        uint256 maxPurchase;
        bool requiresWhitelist;
        DistributionType distributionType;
        VestingConfig vestingConfig;
        PricingMechanism pricingMechanism;
    }

    struct VestingConfig {
        uint256 cliff;
        uint256 vestingDuration;
        uint256 initialUnlock;
        uint256 vestingInterval; // e.g., monthly, weekly
    }

    enum DistributionType { 
        IMMEDIATE,  // Tokens transferred immediately
        VESTING,    // Tokens released over time
        CLIFF      // Tokens released after a waiting period
    }

    enum PricingMechanism {
        FIXED,          // Fixed price throughout
        DECREASING,     // Price decreases over time
        DUTCH_AUCTION,  // Starting high and automatically decreasing
        BONUS_PERIODS   // Different bonus percentages at different times
    }

    event ICOCreated(address icoAddress, address tokenAddress, SaleConfig config);

    function createICO(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 totalSupply,
        SaleConfig memory config
    ) external returns (address) {
        // Create token and ICO contracts
        // Set up configuration
        // Transfer ownership to sender
        // Emit event
    }
}

contract ConfigurableICO is ReentrancyGuard, Pausable, Ownable {
    // Core ICO functionality with all configurable parameters
    // Distribution mechanisms
    // Price calculation logic
    // Vesting schedules
}


