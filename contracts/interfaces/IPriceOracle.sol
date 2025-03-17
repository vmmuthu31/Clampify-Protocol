// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IPriceOracle
 * @dev Interface for price oracle
 */
interface IPriceOracle {
    function getPrice(address token) external view returns (uint256);
    function getPriceChange(address token, uint256 timeframe) external view returns (int256);
}