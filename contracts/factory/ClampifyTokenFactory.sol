// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IClampifyTokenFactory.sol";
import "../interfaces/IDEXRouter.sol";
import "../interfaces/IDEXFactory.sol";
import "../tokens/ClampifyToken.sol";
import "../proxy/ClampifyLaunchpadProxy.sol";

contract ClampifyTokenFactory is IClampifyTokenFactory, AccessControl {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    
    ClampifyLaunchpadProxy public launchpad;
    mapping(address => bool) public isClampifyToken;
    
    constructor(address _launchpad) {
        require(_launchpad != address(0), "ClampifyTokenFactory: Zero address");
        launchpad = ClampifyLaunchpadProxy(_launchpad);
        _grantRole(DEFAULT_ADMIN_ROLE, _launchpad);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function createToken(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        address _initialOwner
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) returns (address) {
        require(_totalSupply > 0, "ClampifyTokenFactory: Zero supply");
        require(_initialOwner != address(0), "ClampifyTokenFactory: Zero owner");
        
        ClampifyToken newToken = new ClampifyToken(
            _name,
            _symbol,
            _totalSupply,
            _initialOwner
        );
        
        address tokenAddress = address(newToken);
        isClampifyToken[tokenAddress] = true;
        
        emit TokenCreated(tokenAddress, _name, _symbol, _totalSupply);
        
        return tokenAddress;
    }
    
    function setupToken(
        address _token,
        address,  // _creator (unused)
        uint256,  // _totalSupply (unused)
        uint256,  // _initialPrice (unused)
        uint256,  // _creatorLockAmount (unused)
        uint256,  // _creatorLockEndTime (unused)
        bool      // _enableStability (unused)
    ) external view override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(isClampifyToken[_token], "ClampifyTokenFactory: Not a Clampify token");
    }
    
    function setupInitialLiquidity(
        address _token, 
        uint256 _tokenAmount, 
        uint256 _initialPrice
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) returns (address lpToken, uint256 liquidity) {
        require(isClampifyToken[_token], "ClampifyTokenFactory: Not a Clampify token");
        
        address platformToken = launchpad.platformToken();
        address dexRouter = launchpad.dexRouter();
        
        uint256 platformAmount = _tokenAmount.mul(_initialPrice).div(1e18);
        
        IERC20(platformToken).safeTransferFrom(tx.origin, address(this), platformAmount);
        
        IERC20(_token).approve(dexRouter, _tokenAmount);
        IERC20(platformToken).approve(dexRouter, platformAmount);
        
        (,, liquidity) = IDEXRouter(dexRouter).addLiquidity(
            _token,
            platformToken,
            _tokenAmount,
            platformAmount,
            _tokenAmount.mul(95).div(100),
            platformAmount.mul(95).div(100),
            address(launchpad),
            block.timestamp + 15 minutes
        );
        
        address factory = IDEXRouter(dexRouter).factory();
        lpToken = IDEXFactory(factory).getPair(_token, platformToken);
        require(lpToken != address(0), "ClampifyTokenFactory: LP token creation failed");
        
        emit LiquidityAdded(_token, lpToken, _tokenAmount, platformAmount);
        
        return (lpToken, liquidity);
    }
}