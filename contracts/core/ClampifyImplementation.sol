// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IClampifyLaunchpad.sol";
import "../interfaces/IClampifyTokenFactory.sol";
import "../interfaces/IClampifyLockManager.sol";
import "../interfaces/IClampifyStabilityManager.sol";
import "../proxy/ClampifyLaunchpadProxy.sol";
import "../libraries/LaunchpadStructs.sol";

/**
 * @title ClampifyImplementation
 * @dev Core implementation for ClampifyLaunchpad
 */
contract ClampifyImplementation {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    
    // Events
    event TokenCreated(address indexed token, address indexed creator, uint256 totalSupply, uint256 initialPrice);
    event TokenVerified(address indexed token, bool isVerified);
    
    // Role constants
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Storage mappings - these match the proxy's storage layout
    mapping(address => LaunchpadStructs.TokenInfo) public tokenRegistry;
    mapping(address => uint256) public creatorRewards;
    
    // State variables that will be stored in the proxy
    uint256 public totalFeesCollected;
    uint256 public totalTokensCreated;
    uint256 public totalLiquidityLocked;
    
    // Constants
    uint256 public constant MAX_BPS = 10000; // 100%
    
    /**
     * @dev Create a new meme token with anti-rug pull features
     * Called by proxy via delegatecall
     */
    function createMemeToken(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _creatorLockPercentage,
        uint256 _creatorLockDuration,
        uint256 _initialLiquidityAmount,
        uint256 _initialPrice,
        bool _enableStability
    ) external returns (address) {
    // Access state from proxy's storage since this is called via delegatecall
    ClampifyLaunchpadProxy proxy = ClampifyLaunchpadProxy(address(this));
    address platformToken = proxy.platformToken();
    address feeCollector = proxy.feeCollector();
    address tokenFactory = proxy.tokenFactory();
    address lockManager = proxy.lockManager();
    address bondingCurve = proxy.bondingCurve();
    uint256 tokenCreationFee = proxy.tokenCreationFee();
    uint256 minCreatorLockPeriod = proxy.minCreatorLockPeriod();
    
    // Validate inputs
    require(_totalSupply > 0, "Clampify: Total supply must be greater than 0");
    require(_creatorLockPercentage > 0, "Clampify: Creator lock percentage must be greater than 0");
    require(_creatorLockPercentage <= 10000, "Clampify: Creator lock percentage must be <= 100%");
    require(_creatorLockDuration >= minCreatorLockPeriod, "Clampify: Lock duration too short");
    require(_initialLiquidityAmount > 0, "Clampify: Initial liquidity must be greater than 0");
    require(_initialLiquidityAmount < _totalSupply, "Clampify: Liquidity exceeds total supply");
    
    // Collect creation fee
    uint256 creationFee = _totalSupply.mul(tokenCreationFee).div(MAX_BPS);
    IERC20(platformToken).safeTransferFrom(msg.sender, feeCollector, creationFee);
    
    // Update fees collected - using state variable in implementation
    totalFeesCollected += creationFee;
    
    // Create new token through factory
    address tokenAddress = IClampifyTokenFactory(tokenFactory).createToken(
        _name,
        _symbol,
        _totalSupply,
        address(this)
    );
    
    // Calculate token distributions
    uint256 creatorLockAmount = _totalSupply.mul(_creatorLockPercentage).div(MAX_BPS);
    uint256 creatorLockEndTime = block.timestamp.add(_creatorLockDuration);
    uint256 remainingAfterLock = _totalSupply.sub(creatorLockAmount);
    uint256 creatorAmount = remainingAfterLock.sub(_initialLiquidityAmount);
    
    // Setup token in registry
    IClampifyTokenFactory(tokenFactory).setupToken(
        tokenAddress,
        msg.sender,
        _totalSupply,
        _initialPrice,
        creatorLockAmount,
        creatorLockEndTime,
        _enableStability
    );
    
    // Store token info in registry
    LaunchpadStructs.TokenInfo storage tokenInfo = tokenRegistry[tokenAddress];
    tokenInfo.tokenAddress = tokenAddress;
    tokenInfo.creator = msg.sender;
    tokenInfo.creationTime = block.timestamp;
    tokenInfo.totalSupply = _totalSupply;
    tokenInfo.initialPrice = _initialPrice;
    tokenInfo.creatorLockAmount = creatorLockAmount;
    tokenInfo.creatorLockEndTime = creatorLockEndTime;
    tokenInfo.isStabilityEnabled = _enableStability;
    
    // Configure stability mechanism if enabled
    if (_enableStability) {
        LaunchpadStructs.StabilityConfig storage stability = tokenInfo.stabilityConfig;
        stability.enableAutoStabilize = true;
        stability.upperPriceThreshold = 2000; // 20% price increase
        stability.lowerPriceThreshold = 1500; // 15% price decrease
        stability.maxStabilizationAmount = 500; // 5% of supply
        stability.cooldownPeriod = 1 days;
        stability.lastStabilizationTime = block.timestamp;
    }
    
    // Transfer unlocked tokens to creator
    IERC20(tokenAddress).transfer(msg.sender, creatorAmount);
    
    // Lock creator's tokens
    IClampifyLockManager(lockManager).lockSupply(
        tokenAddress,
        msg.sender,
        creatorLockAmount,
        creatorLockEndTime,
        false, // not vesting
        0,
        0
    );
    
    // Setup initial liquidity
    (address lpToken, uint256 liquidity) = IClampifyTokenFactory(tokenFactory).setupInitialLiquidity(
        tokenAddress,
        _initialLiquidityAmount,
        _initialPrice
    );
    
    // Update token info with liquidity lock data
    tokenInfo.hasLiquidityLocked = true;
    tokenInfo.liquidityLockEndTime = block.timestamp + proxy.minLiquidityLockPeriod();
    tokenInfo.lpToken = lpToken;
    
    // Update statistics using implementation state variables
    totalTokensCreated += 1;
    totalLiquidityLocked += liquidity;
    
    // Initialize bonding curve for token pricing
    if (bondingCurve != address(0)) {
        // Calculate initial reserve based on initial price and token amount
        uint256 initialReserve = _initialLiquidityAmount.mul(_initialPrice).div(1e18);
        
        // Call initializeToken on the bonding curve contract
        // This sets up the bonding curve parameters for this token
        (bool success, ) = bondingCurve.call(
            abi.encodeWithSignature(
                "initializeToken(address,uint256,uint256)",
                tokenAddress,
                _totalSupply,
                initialReserve
            )
        );
        
        // If bonding curve initialization fails, log but continue
        // This ensures token creation doesn't fail entirely if bonding curve has issues
        if (!success) {
            // We don't revert here to ensure token creation can still succeed
            // Even without bonding curve initialization
        }
    }
    
    // Emit event directly from the implementation
    emit TokenCreated(tokenAddress, msg.sender, _totalSupply, _initialPrice);
    
    return tokenAddress;
    }
    
    /**
     * @dev Get token information from registry
     */
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
    ) {
        LaunchpadStructs.TokenInfo storage info = tokenRegistry[_token];
        return (
            info.tokenAddress,
            info.creator,
            info.creationTime,
            info.totalSupply,
            info.initialPrice,
            info.creatorLockAmount,
            info.creatorLockEndTime,
            info.liquidityLockEndTime,
            info.lpToken,
            info.hasLiquidityLocked,
            info.isStabilityEnabled,
            info.isVerified
        );
    }
    
    /**
     * @dev Verify a token for additional visibility and trust
     */
    function verifyToken(address _token, bool _isVerified) external {
        require(AccessControl(address(this)).hasRole(GOVERNANCE_ROLE, msg.sender), "Clampify: Not authorized");
        require(_token != address(0), "Clampify: Token cannot be zero address");
        
        LaunchpadStructs.TokenInfo storage tokenInfo = tokenRegistry[_token];
        require(tokenInfo.tokenAddress == _token, "Clampify: Token not registered");
        
        tokenInfo.isVerified = _isVerified;
        
        // Emit event directly from the implementation
        emit TokenVerified(_token, _isVerified);
    }
    
    /**
     * @dev Emergency withdraw function to rescue tokens
     */
    function emergencyWithdraw(address _token, uint256 _amount) external {
        require(AccessControl(address(this)).hasRole(ADMIN_ROLE, msg.sender), "Clampify: Not authorized");
        require(_token != address(0), "Clampify: Token cannot be zero address");
        
        // Check if it's a registered token with locked liquidity
        LaunchpadStructs.TokenInfo storage tokenInfo = tokenRegistry[_token];
        if (tokenInfo.tokenAddress == _token && tokenInfo.hasLiquidityLocked) {
            require(
                block.timestamp >= tokenInfo.liquidityLockEndTime,
                "Clampify: Liquidity still locked"
            );
        }
        
        uint256 balance = IERC20(_token).balanceOf(address(this));
        uint256 withdrawAmount = _amount > balance ? balance : _amount;
        
        require(withdrawAmount > 0, "Clampify: No tokens to withdraw");
        
        IERC20(_token).safeTransfer(msg.sender, withdrawAmount);
    }
}