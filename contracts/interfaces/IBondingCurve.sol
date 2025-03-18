// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IBondingCurve
 * @dev Interface for bonding curve implementation
 */
interface IBondingCurve {
    function calculatePurchaseReturn(uint256 _supply, uint256 _connectorBalance, uint32 _connectorWeight, uint256 _depositAmount) external pure returns (uint256);
    function calculateSaleReturn(uint256 _supply, uint256 _connectorBalance, uint32 _connectorWeight, uint256 _sellAmount) external pure returns (uint256);
    function calculatePurchasePrice(uint256 _supply, uint256 _connectorBalance, uint32 _connectorWeight, uint256 _tokenAmount) external pure returns (uint256);
    function calculateSalePrice(uint256 _supply, uint256 _connectorBalance, uint32 _connectorWeight, uint256 _tokenAmount) external pure returns (uint256);
}