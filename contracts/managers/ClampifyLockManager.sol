// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IClampifyLockManager.sol";
import "../libraries/LaunchpadStructs.sol";
import "../proxy/ClampifyLaunchpadProxy.sol";
import "../tokens/ClampifyToken.sol";

/**
 * @title ClampifyLockManager
 * @dev Manages token supply locking and liquidity locking
 * @author vmmuthu31
 * @notice Last modified: 2025-03-17 17:52:32
 */
contract ClampifyLockManager is IClampifyLockManager, AccessControl, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    
    // Reference to the launchpad
    ClampifyLaunchpadProxy public launchpad;
    
    // Locked supplies mapping: token => holder => locks
    mapping(address => mapping(address => LaunchpadStructs.SupplyLock[])) public lockedSupplies;
    
    // Batch lock parameters struct (to reduce stack usage)
    struct LockParams {
        address token;
        address holder;
        uint256 amount;
        uint256 releaseTime;
        bool isVesting;
        uint256 vestingStart;
        uint256 vestingDuration;
    }
    
    // Batch operation storage - separate arrays to avoid deep stack
    address[] private batchTokens;
    address[] private batchHolders;
    uint256[] private batchAmounts;
    uint256[] private batchReleaseTimes;
    bool[] private batchIsVesting;
    uint256[] private batchVestingStarts;
    uint256[] private batchVestingDurations;
    
    /**
     * @dev Constructor to initialize the lock manager
     * @param _launchpad Address of the launchpad contract
     */
    constructor(address _launchpad) {
        require(_launchpad != address(0), "ClampifyLockManager: Zero address");
        launchpad = ClampifyLaunchpadProxy(_launchpad);
        
        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, _launchpad);
    }
    
    /**
     * @dev Internal function to validate lock parameters
     */
    function _validateLockParams(LockParams memory params) internal view {
        require(params.token != address(0), "ClampifyLockManager: Token cannot be zero address");
        require(params.holder != address(0), "ClampifyLockManager: Holder cannot be zero address");
        require(params.amount > 0, "ClampifyLockManager: Amount must be greater than 0");
        require(params.releaseTime > block.timestamp, "ClampifyLockManager: Release time must be in future");
        
        if (params.isVesting) {
            require(params.vestingStart <= block.timestamp, "ClampifyLockManager: Vesting start must be now or in past");
            require(params.vestingDuration > 0, "ClampifyLockManager: Vesting duration must be greater than 0");
            require(params.releaseTime >= params.vestingStart + params.vestingDuration, 
                "ClampifyLockManager: Release time must be after vesting ends");
        }
    }
    
    /**
     * @dev Internal function to transfer tokens to contract
     */
    function _transferTokens(LockParams memory params, address sender) internal {
        if (sender == params.holder) {
            IERC20(params.token).safeTransferFrom(params.holder, address(this), params.amount);
        } else {
            // Only the launchpad can lock others' tokens
            require(sender == address(launchpad), "ClampifyLockManager: Not authorized");
            ClampifyToken(params.token).transferFrom(params.holder, address(this), params.amount);
        }
    }
    
    /**
     * @dev Internal function to create lock record
     */
    function _createLock(LockParams memory params) internal {
        LaunchpadStructs.SupplyLock memory lock = LaunchpadStructs.SupplyLock({
            holder: params.holder,
            amount: params.amount,
            releaseTime: params.releaseTime,
            isVesting: params.isVesting,
            vestingStart: params.vestingStart,
            vestingDuration: params.vestingDuration,
            vestedAmount: 0
        });
        
        lockedSupplies[params.token][params.holder].push(lock);
        
        emit SupplyLocked(params.token, params.holder, params.amount, params.releaseTime);
    }
    
    /**
     * @dev Lock token supply for a holder
     */
    function lockSupply(
        address _token,
        address _holder,
        uint256 _amount,
        uint256 _releaseTime,
        bool _isVesting,
        uint256 _vestingStart,
        uint256 _vestingDuration
    ) external override nonReentrant {
        LockParams memory params = LockParams({
            token: _token,
            holder: _holder,
            amount: _amount,
            releaseTime: _releaseTime,
            isVesting: _isVesting,
            vestingStart: _vestingStart,
            vestingDuration: _vestingDuration
        });
        
        _validateLockParams(params);
        _transferTokens(params, msg.sender);
        _createLock(params);
    }
    
    /**
     * @dev Unlock tokens after lock period
     */
    function unlockTokens(address _token, uint256 _lockIndex) external override nonReentrant {
        require(_token != address(0), "ClampifyLockManager: Token cannot be zero address");
        require(_lockIndex < lockedSupplies[_token][msg.sender].length, "ClampifyLockManager: Invalid lock index");
        
        LaunchpadStructs.SupplyLock storage lock = lockedSupplies[_token][msg.sender][_lockIndex];
        require(lock.holder == msg.sender, "ClampifyLockManager: Not lock owner");
        require(block.timestamp >= lock.releaseTime, "ClampifyLockManager: Tokens still locked");
        
        uint256 remainingAmount = lock.isVesting ? lock.amount.sub(lock.vestedAmount) : lock.amount;
        require(remainingAmount > 0, "ClampifyLockManager: No tokens to unlock");
        
        // Remove lock by replacing with the last one and popping
        if (_lockIndex < lockedSupplies[_token][msg.sender].length - 1) {
            lockedSupplies[_token][msg.sender][_lockIndex] = lockedSupplies[_token][msg.sender][lockedSupplies[_token][msg.sender].length - 1];
        }
        lockedSupplies[_token][msg.sender].pop();
        
        // Transfer tokens to holder
        IERC20(_token).safeTransfer(msg.sender, remainingAmount);
        
        emit SupplyUnlocked(_token, msg.sender, remainingAmount);
    }
    
    /**
     * @dev Unlock vested tokens for a holder
     */
    function unlockVestedTokens(address _token, uint256 _lockIndex) external override nonReentrant {
        require(_token != address(0), "ClampifyLockManager: Token cannot be zero address");
        require(_lockIndex < lockedSupplies[_token][msg.sender].length, "ClampifyLockManager: Invalid lock index");
        
        LaunchpadStructs.SupplyLock storage lock = lockedSupplies[_token][msg.sender][_lockIndex];
        require(lock.holder == msg.sender, "ClampifyLockManager: Not lock owner");
        require(lock.isVesting, "ClampifyLockManager: Not a vesting lock");
        require(block.timestamp >= lock.vestingStart, "ClampifyLockManager: Vesting not started");
        
        // Calculate vested amount
        uint256 elapsedTime = block.timestamp < (lock.vestingStart + lock.vestingDuration) 
            ? block.timestamp - lock.vestingStart 
            : lock.vestingDuration;
        
        uint256 totalVested = lock.amount.mul(elapsedTime).div(lock.vestingDuration);
        uint256 claimableAmount = totalVested.sub(lock.vestedAmount);
        
        require(claimableAmount > 0, "ClampifyLockManager: No tokens to claim");
        
        // Update vested amount
        lock.vestedAmount = lock.vestedAmount.add(claimableAmount);
        
        // Transfer vested tokens
        IERC20(_token).safeTransfer(msg.sender, claimableAmount);
        
        emit SupplyUnlocked(_token, msg.sender, claimableAmount);
    }
    
    /**
     * @dev Clear batch arrays
     */
    function _clearBatchArrays() private {
        delete batchTokens;
        delete batchHolders;
        delete batchAmounts;
        delete batchReleaseTimes;
        delete batchIsVesting;
        delete batchVestingStarts;
        delete batchVestingDurations;
    }
    
    /**
     * @dev Store arrays for batch processing
     */
    function _storeBatchArrays(
        address[] calldata _tokens,
        address[] calldata _holders,
        uint256[] calldata _amounts,
        uint256[] calldata _releaseTimes,
        bool[] calldata _isVesting,
        uint256[] calldata _vestingStarts,
        uint256[] calldata _vestingDurations
    ) private {
        uint256 len = _tokens.length;
        for (uint256 i = 0; i < len; i++) {
            batchTokens.push(_tokens[i]);
            batchHolders.push(_holders[i]);
            batchAmounts.push(_amounts[i]);
            batchReleaseTimes.push(_releaseTimes[i]);
            batchIsVesting.push(_isVesting[i]);
            batchVestingStarts.push(_vestingStarts[i]);
            batchVestingDurations.push(_vestingDurations[i]);
        }
    }
    
    /**
     * @dev Batch lock supplies for multiple tokens/holders
     */
    function batchLockSupply(
        address[] calldata _tokens,
        address[] calldata _holders,
        uint256[] calldata _amounts,
        uint256[] calldata _releaseTimes,
        bool[] calldata _isVesting,
        uint256[] calldata _vestingStarts,
        uint256[] calldata _vestingDurations
    ) external override {
        uint256 len = _tokens.length;
        require(
            len == _holders.length &&
            len == _amounts.length &&
            len == _releaseTimes.length &&
            len == _isVesting.length &&
            len == _vestingStarts.length &&
            len == _vestingDurations.length,
            "ClampifyLockManager: Array length mismatch"
        );
        
        // Process in batches to avoid stack issues
        _clearBatchArrays();
        _storeBatchArrays(_tokens, _holders, _amounts, _releaseTimes, _isVesting, _vestingStarts, _vestingDurations);
        
        // Execute lock operations
        uint256 successCount = 0;
        for (uint256 i = 0; i < batchTokens.length; i++) {
            // Try to execute the lock operation
            (bool success,) = address(this).call(
                abi.encodeWithSelector(
                    this.lockSupply.selector,
                    batchTokens[i],
                    batchHolders[i],
                    batchAmounts[i],
                    batchReleaseTimes[i],
                    batchIsVesting[i],
                    batchVestingStarts[i],
                    batchVestingDurations[i]
                )
            );
            
            if (success) {
                successCount++;
            }
        }
        
        emit BatchOperationProcessed(msg.sender, 2, successCount);
    }
    
    /**
     * @dev Unlock liquidity after lock period
     * @param _token Token address
     */
    function unlockLiquidity(address _token) external override nonReentrant {
        // Only the launchpad can call this
        require(msg.sender == address(launchpad), "ClampifyLockManager: Not authorized");
        
        // Logic for unlocking liquidity should be delegated through the launchpad
        // This ensures proper access control through the main launchpad contract
        
        emit LiquidityUnlocked(_token, address(0), 0); // Event emitted by the implementation
    }
    
    /**
     * @dev Get locked supplies for a token holder
     * @param _token Token address
     * @param _holder Holder address
     * @return Array of supply lock structures
     */
    function getLockedSupplies(address _token, address _holder) external view returns (LaunchpadStructs.SupplyLock[] memory) {
        return lockedSupplies[_token][_holder];
    }
}