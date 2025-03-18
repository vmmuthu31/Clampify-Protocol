// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IClampify
 * @dev Interface for the main Clampify contract
 */
interface IClampify {
    // Define StabilityConfig first
    struct StabilityConfig {
        bool enableAutoStabilize;
        uint256 upperPriceThreshold;
        uint256 lowerPriceThreshold;
        uint256 maxStabilizationAmount;
        uint256 cooldownPeriod;
        uint256 lastStabilizationTime;
    }
    
    // Then use it in TokenInfo
    struct TokenInfo {
        address tokenAddress;
        address creator;
        uint256 creationTime;
        uint256 totalSupply;
        uint256 initialPrice;
        uint256 creatorLockAmount;
        uint256 creatorLockEndTime;
        uint256 liquidityLockEndTime;
        bool hasLiquidityLocked;
        bool isStabilityEnabled;
        bool isVerified;
        StabilityConfig stabilityConfig;
    }
    
    struct SupplyLock {
        uint256 amount;
        uint256 releaseTime;
        bool isVesting;
        uint256 vestingStart;
        uint256 vestingDuration;
        uint256 vestedAmount;
    }

    // Events
    event TokenCreated(address indexed token, address indexed creator, uint256 totalSupply, uint256 initialPrice);
    event SupplyLocked(address indexed token, address indexed holder, uint256 amount, uint256 releaseTime);
    event SupplyUnlocked(address indexed token, address indexed holder, uint256 amount);
    event LiquidityLocked(address indexed token, address indexed lpToken, uint256 amount, uint256 lockEndTime);
    event LiquidityUnlocked(address indexed token, address indexed lpToken, uint256 amount);
    event StabilityTriggered(address indexed token, bool isInflation, uint256 amount, uint256 priceChange);
    event CreatorRewarded(address indexed creator, address indexed token, uint256 amount);
    
    // Main functions
    function createMemeToken(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _creatorLockPercentage,
        uint256 _creatorLockDuration,
        uint256 _initialLiquidityAmount,
        uint256 _initialPrice,
        bool _enableStability,
        bool _useBondingCurve
    ) external payable returns (address);
    
    function lockSupply(
        address _token,
        address _holder,
        uint256 _amount,
        uint256 _releaseTime,
        bool _isVesting,
        uint256 _vestingStart,
        uint256 _vestingDuration
    ) external;
    
    function unlockTokens(address _token, uint256 _lockIndex) external;
    
    function unlockVestedTokens(address _token, uint256 _lockIndex) external;
    
    function triggerStabilization(address _token, bool _isInflation, uint256 _amount) external;
}