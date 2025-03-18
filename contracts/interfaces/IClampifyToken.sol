// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IClampifyToken
 * @dev Interface for Clampify tokens
 */
interface IClampifyToken {
    function mint(address _to, uint256 _amount) external;
    function burn(uint256 _amount) external;
    function burnFrom(address _account, uint256 _amount) external;
}