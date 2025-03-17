// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IClampifyStabilityManager
 * @dev Interface for ClampifyStabilityManager
 */
interface IClampifyStabilityManager {
    function checkStabilization(address _token) external view returns (bool needsStabilization, bool isInflation, uint256 amount);
    
    function triggerStabilization(address _token, bool _isInflation, uint256 _amount) external;
    
    function batchTriggerStabilization(address[] calldata _tokens) external;
    
    function updateStabilityConfig(
        address _token,
        bool _enableAutoStabilize,
        uint256 _upperThreshold,
        uint256 _lowerThreshold,
        uint256 _maxAmount,
        uint256 _cooldown
    ) external;
    
    function setAuthorizedStabilizer(address _stabilizer, bool _isAuthorized) external;
    
    event StabilityTriggered(address indexed token, bool isInflation, uint256 amount, uint256 priceChange);
    event StabilizerAuthorized(address stabilizer, bool isAuthorized);
}