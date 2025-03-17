// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title LaunchpadStructs
 * @dev Library containing structs used by the Clampify platform
 * @author vmmuthu31
 * @notice Last updated: 2025-03-17 14:51:42
 */
library LaunchpadStructs {
    // Token Registry
    struct TokenInfo {
        address tokenAddress;
        address creator;
        uint256 creationTime;
        uint256 totalSupply;
        uint256 initialPrice;
        uint256 creatorLockAmount;
        uint256 creatorLockEndTime;
        uint256 liquidityLockEndTime;
        address lpToken; // LP token address
        bool hasLiquidityLocked;
        bool isStabilityEnabled;
        bool isVerified;
        StabilityConfig stabilityConfig;
    }
    
    // Stability Configuration
    struct StabilityConfig {
        bool enableAutoStabilize;
        uint256 upperPriceThreshold; // Price increase % that triggers burn (in basis points)
        uint256 lowerPriceThreshold; // Price decrease % that triggers mint (in basis points)
        uint256 maxStabilizationAmount; // Maximum % of supply that can be minted/burned (in basis points)
        uint256 cooldownPeriod; // Time between stabilization events
        uint256 lastStabilizationTime;
    }
    
    // Supply Lock Data
    struct SupplyLock {
        address holder;
        uint256 amount;
        uint256 releaseTime;
        bool isVesting;
        uint256 vestingStart;
        uint256 vestingDuration;
        uint256 vestedAmount;
    }
    
    // Batch Operation Data
    struct BatchOperation {
        address[] tokens;
        uint256[] amounts;
        uint256[] params;
        bool[] flags;
    }
}