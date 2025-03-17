// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "../interfaces/IClampifyLaunchpad.sol";

/**
 * @title ClampifyLaunchpadProxy
 * @dev Main entry point for Clampify platform - simplified non-upgradeable version
 */
contract ClampifyLaunchpadProxy is 
    AccessControl,
    ReentrancyGuard,
    IClampifyLaunchpad 
{
    using Address for address;
    
    // Module addresses
    address public implementation;
    address public tokenFactory;
    address public lockManager;
    address public stabilityManager;
    
    // Core chain id for validation
    uint256 public constant CORE_CHAIN_ID = 1116;
    
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");
    bytes32 public constant DEX_INTEGRATOR_ROLE = keccak256("DEX_INTEGRATOR_ROLE");
    bytes32 public constant ORACLE_MANAGER_ROLE = keccak256("ORACLE_MANAGER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    
    // State variables
    address public platformToken; 
    address public feeCollector;
    address public dexRouter;
    address public priceOracle;
    
    // Fee structure (in basis points, 100 = 1%)
    uint256 public tokenCreationFee; 
    uint256 public tradingFee;
    uint256 public liquidityLockFee;
    
    // Minimum lock periods
    uint256 public minCreatorLockPeriod;
    uint256 public minLiquidityLockPeriod;
    
    // Statistics
    uint256 public totalTokensCreated;
    uint256 public totalFeesCollected;
    uint256 public totalLiquidityLocked;
    
    // Events
    event ImplementationUpdated(address indexed oldImpl, address indexed newImpl);
    event ModuleUpdated(string moduleType, address indexed oldModule, address indexed newModule);

    /**
     * @dev Constructor (replacing initializer in non-upgradeable version)
     */
    constructor(
        address _implementation,
        address _tokenFactory,
        address _lockManager,
        address _stabilityManager,
        address _platformToken,
        address _feeCollector,
        address _dexRouter,
        address _priceOracle
    ) {
        // Verify we're on Core blockchain
        require(block.chainid == CORE_CHAIN_ID, "Clampify: Must be deployed on Core blockchain");
        
        // Set core module addresses
        implementation = _implementation;
        tokenFactory = _tokenFactory;
        lockManager = _lockManager;
        stabilityManager = _stabilityManager;
        
        // Set core platform variables
        platformToken = _platformToken;
        feeCollector = _feeCollector;
        dexRouter = _dexRouter;
        priceOracle = _priceOracle;
        
        // Set default fee parameters
        tokenCreationFee = 200;    // 2%
        tradingFee = 50;           // 0.5%
        liquidityLockFee = 10;     // 0.1%
        
        // Set default lock periods
        minCreatorLockPeriod = 30 days;
        minLiquidityLockPeriod = 180 days;
        
        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
        _grantRole(FEE_MANAGER_ROLE, msg.sender);
        _grantRole(DEX_INTEGRATOR_ROLE, msg.sender);
        _grantRole(ORACLE_MANAGER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
    }
    
    /**
     * @dev Check if an address contains contract code
     * @param addr Address to check
     * @return True if the address contains code
     */
    function isContract(address addr) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }
    
    /**
     * @dev Update implementation contract
     * @param _newImplementation New implementation address
     */
    function updateImplementation(address _newImplementation) external onlyRole(UPGRADER_ROLE) {
        require(isContract(_newImplementation), "Clampify: Implementation must be a contract");
        address oldImplementation = implementation;
        implementation = _newImplementation;
        emit ImplementationUpdated(oldImplementation, _newImplementation);
    }
    
    /**
     * @dev Update module addresses
     */
    function updateModules(
        address _tokenFactory,
        address _lockManager,
        address _stabilityManager
    ) external onlyRole(UPGRADER_ROLE) {
        if (_tokenFactory != address(0)) {
            require(isContract(_tokenFactory), "Clampify: TokenFactory must be a contract");
            address oldModule = tokenFactory;
            tokenFactory = _tokenFactory;
            emit ModuleUpdated("TokenFactory", oldModule, _tokenFactory);
        }
        
        if (_lockManager != address(0)) {
            require(isContract(_lockManager), "Clampify: LockManager must be a contract");
            address oldModule = lockManager;
            lockManager = _lockManager;
            emit ModuleUpdated("LockManager", oldModule, _lockManager);
        }
        
        if (_stabilityManager != address(0)) {
            require(isContract(_stabilityManager), "Clampify: StabilityManager must be a contract");
            address oldModule = stabilityManager;
            stabilityManager = _stabilityManager;
            emit ModuleUpdated("StabilityManager", oldModule, _stabilityManager);
        }
    }
    
    // Implement IClampifyLaunchpad interface by delegating to implementation contract
    
    function createMemeToken(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _creatorLockPercentage,
        uint256 _creatorLockDuration,
        uint256 _initialLiquidityAmount,
        uint256 _initialPrice,
        bool _enableStability
    ) external override nonReentrant returns (address) {
        // Delegate call to implementation
        (bool success, bytes memory result) = implementation.delegatecall(
            abi.encodeWithSignature(
                "createMemeToken(string,string,uint256,uint256,uint256,uint256,uint256,bool)",
                _name,
                _symbol,
                _totalSupply,
                _creatorLockPercentage,
                _creatorLockDuration,
                _initialLiquidityAmount,
                _initialPrice,
                _enableStability
            )
        );
        
        require(success, "Clampify: Token creation failed");
        return abi.decode(result, (address));
    }
    
    function getTokenInfo(address _token) external view override returns (
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
        // Delegate call to implementation
        (bool success, bytes memory result) = implementation.staticcall(
            abi.encodeWithSignature("getTokenInfo(address)", _token)
        );
        
        require(success, "Clampify: Failed to get token info");
        return abi.decode(result, (
            address, address, uint256, uint256, uint256, uint256, uint256, uint256,
            address, bool, bool, bool
        ));
    }
    
    function getCreatorTokens(address _creator) external view override returns (address[] memory) {
        // Delegate call to implementation
        (bool success, bytes memory result) = implementation.staticcall(
            abi.encodeWithSignature("getCreatorTokens(address)", _creator)
        );
        
        require(success, "Clampify: Failed to get creator tokens");
        return abi.decode(result, (address[]));
    }
    
    function verifyToken(address _token, bool _isVerified) external override onlyRole(GOVERNANCE_ROLE) {
        // Delegate call to implementation
        (bool success, ) = implementation.delegatecall(
            abi.encodeWithSignature("verifyToken(address,bool)", _token, _isVerified)
        );
        
        require(success, "Clampify: Failed to verify token");
    }
    
    function setFeeParameters(uint256 _tokenCreationFee, uint256 _tradingFee, uint256 _liquidityLockFee) 
        external override onlyRole(FEE_MANAGER_ROLE) {
        require(_tokenCreationFee <= 500, "Clampify: Creation fee too high");
        require(_tradingFee <= 100, "Clampify: Trading fee too high");
        require(_liquidityLockFee <= 50, "Clampify: Liquidity lock fee too high");
        
        tokenCreationFee = _tokenCreationFee;
        tradingFee = _tradingFee;
        liquidityLockFee = _liquidityLockFee;
        
        emit FeeParametersUpdated(_tokenCreationFee, _tradingFee, _liquidityLockFee);
    }
    
    function updateFeeCollector(address _newCollector) external override onlyRole(FEE_MANAGER_ROLE) {
        require(_newCollector != address(0), "Clampify: New collector cannot be zero address");
        
        address oldCollector = feeCollector;
        feeCollector = _newCollector;
        
        emit FeeCollectorUpdated(oldCollector, _newCollector);
    }
    
    function updateDexRouter(address _newRouter) external override onlyRole(DEX_INTEGRATOR_ROLE) {
        require(_newRouter != address(0), "Clampify: New router cannot be zero address");
        
        address oldRouter = dexRouter;
        dexRouter = _newRouter;
        
        emit DexRouterUpdated(oldRouter, _newRouter);
    }
    
    function updatePlatformToken(address _newToken) external override onlyRole(ADMIN_ROLE) {
        require(_newToken != address(0), "Clampify: New token cannot be zero address");
        
        address oldToken = platformToken;
        platformToken = _newToken;
        
        emit PlatformTokenUpdated(oldToken, _newToken);
    }
    
    function updatePriceOracle(address _newOracle) external override onlyRole(ORACLE_MANAGER_ROLE) {
        address oldOracle = priceOracle;
        priceOracle = _newOracle;
        
        emit OracleUpdated(oldOracle, _newOracle);
    }
    
    function setLockPeriods(uint256 _minCreatorLock, uint256 _minLiquidityLock) 
        external override onlyRole(GOVERNANCE_ROLE) {
        require(_minCreatorLock >= 7 days, "Clampify: Creator lock too short");
        require(_minLiquidityLock >= 30 days, "Clampify: Liquidity lock too short");
        
        minCreatorLockPeriod = _minCreatorLock;
        minLiquidityLockPeriod = _minLiquidityLock;
        
        emit LockPeriodsUpdated(_minCreatorLock, _minLiquidityLock);
    }
    
    function emergencyWithdraw(address _token, uint256 _amount) external override onlyRole(ADMIN_ROLE) {
        // Delegate call to implementation
        (bool success, ) = implementation.delegatecall(
            abi.encodeWithSignature("emergencyWithdraw(address,uint256)", _token, _amount)
        );
        
        require(success, "Clampify: Emergency withdraw failed");
    }
}