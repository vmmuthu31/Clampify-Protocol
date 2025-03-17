// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IClampifyLockManager
 * @dev Interface for ClampifyLockManager
 */
interface IClampifyLockManager {
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
    
    function batchLockSupply(
        address[] calldata _tokens,
        address[] calldata _holders,
        uint256[] calldata _amounts,
        uint256[] calldata _releaseTimes,
        bool[] calldata _isVesting,
        uint256[] calldata _vestingStarts,
        uint256[] calldata _vestingDurations
    ) external;
    
    function unlockLiquidity(address _token) external;
    
    event SupplyLocked(address indexed token, address indexed holder, uint256 amount, uint256 releaseTime);
    event SupplyUnlocked(address indexed token, address indexed holder, uint256 amount);
    event LiquidityLocked(address indexed token, address indexed lpToken, uint256 amount, uint256 lockEndTime);
    event LiquidityUnlocked(address indexed token, address indexed lpToken, uint256 amount);
    event BatchOperationProcessed(address indexed operator, uint256 operationType, uint256 count);
}