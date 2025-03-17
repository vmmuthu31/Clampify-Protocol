// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IClampifyStabilityManager.sol";
import "../interfaces/IPriceOracle.sol";
import "../interfaces/IDEXRouter.sol";
import "../libraries/LaunchpadStructs.sol";
import "../proxy/ClampifyLaunchpadProxy.sol";
import "../tokens/ClampifyToken.sol";

/**
 * @title ClampifyStabilityManager
 * @dev Manages token price stability mechanisms
 * @author vmmuthu31
 * @notice Last modified: 2025-03-17 15:03:18
 */
contract ClampifyStabilityManager is IClampifyStabilityManager, AccessControl, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    
    // Reference to the launchpad
    ClampifyLaunchpadProxy public launchpad;
    
    // Mapping of token stabilization configurations
    mapping(address => LaunchpadStructs.StabilityConfig) public stabilityConfigs;
    
    // Mapping of authorized stabilizers
    mapping(address => bool) public authorizedStabilizers;
    
    // Gas limit for stabilization operations
    uint256 public stabilizationGasLimit = 500000;
    
    // Role constant
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    
    /**
     * @dev Constructor to initialize the stability manager
     * @param _launchpad Address of the launchpad contract
     */
    constructor(address _launchpad) {
        require(_launchpad != address(0), "ClampifyStabilityManager: Zero address");
        launchpad = ClampifyLaunchpadProxy(_launchpad);
        
        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, _launchpad);
        
        // Set the contract creator as an authorized stabilizer
        authorizedStabilizers[msg.sender] = true;
    }
    
    /**
     * @dev Check if token needs price stabilization
     * @param _token Token address
     * @return needsStabilization Whether stabilization is needed
     * @return isInflation Whether inflation is needed (true) or deflation (false)
     * @return amount Amount to mint/burn for stabilization
     */
    function checkStabilization(address _token) external view override returns (bool needsStabilization, bool isInflation, uint256 amount) {
        LaunchpadStructs.StabilityConfig storage stability = stabilityConfigs[_token];
        
        // Skip if stability isn't enabled
        if (!stability.enableAutoStabilize) return (false, false, 0);
        
        // Skip if cooldown period hasn't elapsed
        if (block.timestamp < stability.lastStabilizationTime.add(stability.cooldownPeriod)) return (false, false, 0);
        
        // Need a price oracle to determine if stabilization is needed
        address priceOracle = launchpad.priceOracle();
        if (priceOracle == address(0)) return (false, false, 0);
        
        // Get price change percentage from oracle
        int256 priceChange = IPriceOracle(priceOracle).getPriceChange(_token, 1 days);
        
        // Convert price change to basis points
        int256 priceChangeBps = priceChange * 10000 / 1e18;
        
        // Get token supply for calculating stabilization amount
        uint256 totalSupply = IERC20(_token).totalSupply();
        
        // Check if price change exceeds thresholds
        if (priceChangeBps > int256(stability.upperPriceThreshold)) {
            // Price increased too much, need deflation (burn)
            uint256 maxBurnAmount = totalSupply.mul(stability.maxStabilizationAmount).div(10000);
            return (true, false, maxBurnAmount);
        } else if (priceChangeBps < -int256(stability.lowerPriceThreshold)) {
            // Price decreased too much, need inflation (mint)
            uint256 maxMintAmount = totalSupply.mul(stability.maxStabilizationAmount).div(10000);
            return (true, true, maxMintAmount);
        }
        
        return (false, false, 0);
    }
    
    /**
     * @dev Trigger price stabilization mechanism
     * @param _token Token address
     * @param _isInflation Whether to inflate (mint) or deflate (burn)
     * @param _amount Amount to mint/burn
     */
    function triggerStabilization(address _token, bool _isInflation, uint256 _amount) external override nonReentrant {
        require(_token != address(0), "ClampifyStabilityManager: Token cannot be zero address");
        require(
            _hasRoleAtLaunchpad(GOVERNANCE_ROLE, msg.sender) || 
            authorizedStabilizers[msg.sender], 
            "ClampifyStabilityManager: Not authorized"
        );
        
        LaunchpadStructs.StabilityConfig storage stability = stabilityConfigs[_token];
        require(stability.enableAutoStabilize, "ClampifyStabilityManager: Stability not enabled");
        require(
            block.timestamp >= stability.lastStabilizationTime.add(stability.cooldownPeriod),
            "ClampifyStabilityManager: Cooldown period not elapsed"
        );
        
        // Get token supply for max amount check
        uint256 totalSupply = IERC20(_token).totalSupply();
        uint256 maxAmount = totalSupply.mul(stability.maxStabilizationAmount).div(10000);
        require(_amount <= maxAmount, "ClampifyStabilityManager: Amount too large");
        
        // Get price change for logging
        uint256 priceChange = 0;
        address priceOracle = launchpad.priceOracle();
        if (priceOracle != address(0)) {
            try IPriceOracle(priceOracle).getPriceChange(_token, 1 days) returns (int256 change) {
                priceChange = uint256(change > 0 ? change : -change);
            } catch {
                // Ignore oracle errors
            }
        }
        
        // Execute stabilization
        if (_isInflation) {
            // Mint new tokens
            ClampifyToken(_token).mint(address(this), _amount);
            
            // Add tokens to liquidity if needed
            _addStabilityLiquidity(_token, _amount);
        } else {
            // Burn tokens from circulation
            uint256 tokenBalance = IERC20(_token).balanceOf(address(this));
            if (tokenBalance < _amount) {
                _amount = tokenBalance;
            }
            
            if (_amount > 0) {
                ClampifyToken(_token).burn(_amount);
            }
        }
        
        // Update stabilization timestamp
        stability.lastStabilizationTime = block.timestamp;
        
        emit StabilityTriggered(_token, _isInflation, _amount, priceChange);
    }
    
    /**
     * @dev Batch trigger stabilization for multiple tokens
     * @param _tokens Array of token addresses
     */
    function batchTriggerStabilization(address[] calldata _tokens) external override {
        require(
            _hasRoleAtLaunchpad(GOVERNANCE_ROLE, msg.sender) || 
            authorizedStabilizers[msg.sender], 
            "ClampifyStabilityManager: Not authorized"
        );
        
        uint256 stabilizedCount = 0;
        
        for (uint256 i = 0; i < _tokens.length; i++) {
            address token = _tokens[i];
            
            // Skip invalid tokens
            if (token == address(0)) continue;
            
            // Skip tokens with stability disabled
            LaunchpadStructs.StabilityConfig storage stability = stabilityConfigs[token];
            if (!stability.enableAutoStabilize) continue;
            
            // Check if stabilization is needed
            (bool needsStabilization, bool isInflation, uint256 amount) = this.checkStabilization(token);
            
            if (needsStabilization) {
                // Execute with a gas limit to prevent the entire batch from failing
                (bool success, ) = address(this).call{gas: stabilizationGasLimit}(
                    abi.encodeWithSelector(
                        this.triggerStabilization.selector,
                        token,
                        isInflation,
                        amount
                    )
                );
                
                if (success) {
                    stabilizedCount++;
                }
            }
        }
    }
    
    /**
     * @dev Update token stability configuration
     * @param _token Token address
     * @param _enableAutoStabilize Enable automatic stabilization
     * @param _upperThreshold Price increase threshold in basis points
     * @param _lowerThreshold Price decrease threshold in basis points
     * @param _maxAmount Maximum stabilization amount in basis points
     * @param _cooldown Cooldown period in seconds
     */
    function updateStabilityConfig(
        address _token,
        bool _enableAutoStabilize,
        uint256 _upperThreshold,
        uint256 _lowerThreshold,
        uint256 _maxAmount,
        uint256 _cooldown
    ) external override {
        require(_token != address(0), "ClampifyStabilityManager: Token cannot be zero address");
        
        // Check if caller is token creator or has governance role
        require(
            _isTokenCreator(msg.sender, _token) || 
            _hasRoleAtLaunchpad(GOVERNANCE_ROLE, msg.sender),
            "ClampifyStabilityManager: Not authorized"
        );
        
        // Validate thresholds
        require(_upperThreshold > 0 && _upperThreshold <= 5000, "ClampifyStabilityManager: Invalid upper threshold (0-50%)");
        require(_lowerThreshold > 0 && _lowerThreshold <= 5000, "ClampifyStabilityManager: Invalid lower threshold (0-50%)");
        require(_maxAmount > 0 && _maxAmount <= 1000, "ClampifyStabilityManager: Invalid max amount (0-10%)");
        require(_cooldown >= 1 hours && _cooldown <= 7 days, "ClampifyStabilityManager: Cooldown must be between 1 hour and 7 days");
        
        // Update stability configuration
        LaunchpadStructs.StabilityConfig storage stability = stabilityConfigs[_token];
        stability.enableAutoStabilize = _enableAutoStabilize;
        stability.upperPriceThreshold = _upperThreshold;
        stability.lowerPriceThreshold = _lowerThreshold;
        stability.maxStabilizationAmount = _maxAmount;
        stability.cooldownPeriod = _cooldown;
    }

    /**
     * @dev Set authorized stabilizer status
     * @param _stabilizer Address of the stabilizer
     * @param _isAuthorized Whether the stabilizer is authorized
     */
    function setAuthorizedStabilizer(address _stabilizer, bool _isAuthorized) external override {
        require(_stabilizer != address(0), "ClampifyStabilityManager: Stabilizer cannot be zero address");
        require(_hasRoleAtLaunchpad(GOVERNANCE_ROLE, msg.sender), "ClampifyStabilityManager: Not authorized");
        
        authorizedStabilizers[_stabilizer] = _isAuthorized;
        
        emit StabilizerAuthorized(_stabilizer, _isAuthorized);
    }
    
    /**
     * @dev Get stability configuration for a token
     * @param _token Token address
     * @return enableAutoStabilize Whether auto-stabilization is enabled
     * @return upperPriceThreshold Upper price threshold in basis points
     * @return lowerPriceThreshold Lower price threshold in basis points
     * @return maxStabilizationAmount Maximum amount for stabilization in basis points
     * @return cooldownPeriod Cooldown period between stabilizations
     * @return lastStabilizationTime Last time stabilization was triggered
     */
    function getStabilityConfig(address _token) external view returns (
        bool enableAutoStabilize,
        uint256 upperPriceThreshold,
        uint256 lowerPriceThreshold,
        uint256 maxStabilizationAmount,
        uint256 cooldownPeriod,
        uint256 lastStabilizationTime
    ) {
        LaunchpadStructs.StabilityConfig storage stability = stabilityConfigs[_token];
        return (
            stability.enableAutoStabilize,
            stability.upperPriceThreshold,
            stability.lowerPriceThreshold,
            stability.maxStabilizationAmount,
            stability.cooldownPeriod,
            stability.lastStabilizationTime
        );
    }
    
    /**
     * @dev Add liquidity with stabilized tokens
     * @param _token Token address
     * @param _amount Amount to add to liquidity
     */
    function _addStabilityLiquidity(address _token, uint256 _amount) internal {
        // Get DEX router from launchpad
        address dexRouter = launchpad.dexRouter();
        address platformToken = launchpad.platformToken();
        
        // Check if we have a router and LP exists
        if (dexRouter != address(0)) {
            // Approve token for DEX router
            IERC20(_token).approve(dexRouter, _amount);
            
            // Calculate platform token amount based on the current price
            // This is a simplified approach - in production you'd want to get the actual price
            address priceOracle = launchpad.priceOracle();
            uint256 platformAmount = 0;
            
            if (priceOracle != address(0)) {
                try IPriceOracle(priceOracle).getPrice(_token) returns (uint256 price) {
                    platformAmount = _amount.mul(price).div(1e18).div(2);
                } catch {
                    // If price query fails, use a conservative amount
                    platformAmount = _amount.div(100); // 1% of token amount as platform tokens
                }
            } else {
                // Fallback if no oracle
                platformAmount = _amount.div(100);
            }
            
            // Check if we have enough platform tokens
            if (IERC20(platformToken).balanceOf(address(this)) >= platformAmount && platformAmount > 0) {
                IERC20(platformToken).approve(dexRouter, platformAmount);
                
                try IDEXRouter(dexRouter).addLiquidity(
                    _token,
                    platformToken,
                    _amount,
                    platformAmount,
                    _amount.mul(90).div(100), // 10% slippage tolerance
                    platformAmount.mul(90).div(100), // 10% slippage tolerance
                    address(launchpad), // Send LP tokens to launchpad
                    block.timestamp + 15 minutes
                ) {
                    // Liquidity added successfully
                } catch {
                    // If adding liquidity fails, transfer tokens to launchpad
                    IERC20(_token).transfer(address(launchpad), _amount);
                }
            } else {
                // If we don't have enough platform tokens, transfer tokens to launchpad
                IERC20(_token).transfer(address(launchpad), _amount);
            }
        } else {
            // If no DEX router, transfer tokens to launchpad
            IERC20(_token).transfer(address(launchpad), _amount);
        }
    }
    
    /**
     * @dev Check if an address is the creator of a token
     * @param _address Address to check
     * @param _token Token address
     * @return True if the address is the creator
     */
    function _isTokenCreator(address _address, address _token) internal view returns (bool) {
        address creator;
        (, creator, , , , , , , , , ,) = launchpad.getTokenInfo(_token);
        return _address == creator;
    }
    
    /**
     * @dev Set stabilization gas limit
     * @param _gasLimit New gas limit
     */
    function setStabilizationGasLimit(uint256 _gasLimit) external onlyRole(GOVERNANCE_ROLE) {
        require(_gasLimit >= 200000 && _gasLimit <= 2000000, "ClampifyStabilityManager: Invalid gas limit");
        stabilizationGasLimit = _gasLimit;
    }
    
    /**
     * @dev Withdraw platform tokens for liquidity stabilization
     * @param _amount Amount to withdraw
     */
    function withdrawPlatformTokens(uint256 _amount) external onlyRole(GOVERNANCE_ROLE) {
        address platformToken = launchpad.platformToken();
        uint256 balance = IERC20(platformToken).balanceOf(address(this));
        uint256 withdrawAmount = _amount > balance ? balance : _amount;
        
        if (withdrawAmount > 0) {
            IERC20(platformToken).safeTransfer(msg.sender, withdrawAmount);
        }
    }
    
    /**
     * @dev Helper function to check if caller has a role on the launchpad contract
     */
    function _hasRoleAtLaunchpad(bytes32 role, address account) internal view returns (bool) {
        return AccessControl(address(launchpad)).hasRole(role, account);
    }
}