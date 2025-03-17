// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IClampifyLaunchpad
 * @dev Interface for ClampifyLaunchpad
 */
interface IClampifyLaunchpad {
    // Core functions
    function createMemeToken(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _creatorLockPercentage,
        uint256 _creatorLockDuration,
        uint256 _initialLiquidityAmount,
        uint256 _initialPrice,
        bool _enableStability
    ) external returns (address);
    
    // Token management
    function getTokenInfo(address _token) external view returns (
        address tokenAddress,
        address creator,
        uint256 creationTime,
        uint256 totalSupply,
        uint256 initialPrice,
        uint256 creatorLockAmount,
        uint256 creatorLockEndTime,
        uint256 liquidityLockEndTime,
        address lpToken,
        bool hasLiquidityLocked,
        bool isStabilityEnabled,
        bool isVerified
    );
    
    function getCreatorTokens(address _creator) external view returns (address[] memory);
    function verifyToken(address _token, bool _isVerified) external;
    
    // Fee management
    function setFeeParameters(uint256 _tokenCreationFee, uint256 _tradingFee, uint256 _liquidityLockFee) external;
    function updateFeeCollector(address _newCollector) external;
    
    // Configuration
    function updateDexRouter(address _newRouter) external;
    function updatePlatformToken(address _newToken) external;
    function updatePriceOracle(address _newOracle) external;
    function setLockPeriods(uint256 _minCreatorLock, uint256 _minLiquidityLock) external;
    
    // Treasury management
    function emergencyWithdraw(address _token, uint256 _amount) external;
    
    // Events
    event TokenCreated(address indexed token, address indexed creator, uint256 totalSupply, uint256 initialPrice);
    event TokenVerified(address indexed token, bool isVerified);
    event FeeParametersUpdated(uint256 tokenCreationFee, uint256 tradingFee, uint256 liquidityLockFee);
    event DexRouterUpdated(address oldRouter, address newRouter);
    event FeeCollectorUpdated(address oldCollector, address newCollector);
    event PlatformTokenUpdated(address oldToken, address newToken);
    event OracleUpdated(address indexed oldOracle, address indexed newOracle);
    event LockPeriodsUpdated(uint256 minCreatorLockPeriod, uint256 minLiquidityLockPeriod);
}