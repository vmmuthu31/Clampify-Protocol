// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IClampifyTokenFactory
 * @dev Interface for ClampifyTokenFactory
 */
interface IClampifyTokenFactory {
    function createToken(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        address _initialOwner
    ) external returns (address);
    
    function setupToken(
        address _token,
        address _creator,
        uint256 _totalSupply,
        uint256 _initialPrice,
        uint256 _creatorLockAmount,
        uint256 _creatorLockEndTime,
        bool _enableStability
    ) external;
    
    function setupInitialLiquidity(
        address _token, 
        uint256 _tokenAmount, 
        uint256 _initialPrice
    ) external returns (address lpToken, uint256 liquidity);
    
    event TokenCreated(address indexed token, string name, string symbol, uint256 totalSupply);
    event LiquidityAdded(address indexed token, address indexed lpToken, uint256 tokenAmount, uint256 platformAmount);
}