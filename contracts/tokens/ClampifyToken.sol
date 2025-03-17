// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title ClampifyToken
 * @dev ERC20 token with minting and burning capabilities
 * Specifically designed to work with the Clampify Launchpad for supply locking
 */
contract ClampifyToken is ERC20, ERC20Burnable, AccessControl {
    using SafeMath for uint256;
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant TRANSFER_ROLE = keccak256("TRANSFER_ROLE");
    
    address public launchpad;
    uint256 public creationTime;
    
    // Anti-dump mechanism
    uint256 public maxTransferAmount;
    mapping(address => bool) public isExemptFromTransferLimit;
    
    // Events
    event TransferLimitUpdated(uint256 previousLimit, uint256 newLimit);
    event ExemptionUpdated(address indexed account, bool isExempt);
    
    /**
     * @dev Constructor to initialize the token
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _initialSupply Initial supply of tokens
     * @param _launchpad Launchpad address
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        address _launchpad
    ) ERC20(_name, _symbol) {
        require(_launchpad != address(0), "ClampifyToken: Launchpad cannot be zero address");
        
        launchpad = _launchpad;
        creationTime = block.timestamp;
   
        _grantRole(DEFAULT_ADMIN_ROLE, _launchpad);
        _grantRole(MINTER_ROLE, _launchpad);
        _grantRole(BURNER_ROLE, _launchpad);
        _grantRole(TRANSFER_ROLE, _launchpad);
        
        // Set default transfer limit to 1% of supply
        maxTransferAmount = _initialSupply.div(100);
        
        // Exempt launchpad from transfer limits
        isExemptFromTransferLimit[_launchpad] = true;
        
        _mint(_launchpad, _initialSupply);
    }
    
    /**
     * @dev Mint new tokens (only callable by accounts with MINTER_ROLE)
     * @param _to Address to mint tokens to
     * @param _amount Amount of tokens to mint
     */
    function mint(address _to, uint256 _amount) external onlyRole(MINTER_ROLE) {
        _mint(_to, _amount);
    }
    
    /**
     * @dev Override transfer function to enforce transfer limits
     * @param recipient Recipient address
     * @param amount Amount to transfer
     */
    function transfer(address recipient, uint256 amount) public override returns (bool) {
        _checkTransferLimit(msg.sender, recipient, amount);
        return super.transfer(recipient, amount);
    }
    
    /**
     * @dev Override transferFrom function to enforce transfer limits
     * @param sender Sender address
     * @param recipient Recipient address
     * @param amount Amount to transfer
     */
    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        _checkTransferLimit(sender, recipient, amount);
        return super.transferFrom(sender, recipient, amount);
    }
    
    /**
     * @dev Check transfer limits
     * @param sender Sender address
     * @param recipient Recipient address
     * @param amount Amount to transfer
     */
    function _checkTransferLimit(address sender, address recipient, uint256 amount) internal view {
        // Skip limits for exempt addresses or when called by launchpad
        if (isExemptFromTransferLimit[sender] || 
            isExemptFromTransferLimit[recipient] || 
            msg.sender == launchpad ||
            hasRole(TRANSFER_ROLE, msg.sender)) {
            return;
        }
        
        require(amount <= maxTransferAmount, "ClampifyToken: Transfer amount exceeds limit");
    }
    
    /**
     * @dev Set maximum transfer amount (percentage of total supply)
     * @param _maxTransferBips Maximum transfer percentage in basis points (1% = 100 bips)
     */
    function setMaxTransferAmount(uint256 _maxTransferBips) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_maxTransferBips > 0, "ClampifyToken: Max transfer must be greater than 0");
        require(_maxTransferBips <= 10000, "ClampifyToken: Max transfer must be <= 100%");
        
        uint256 previousLimit = maxTransferAmount;
        maxTransferAmount = totalSupply().mul(_maxTransferBips).div(10000);
        
        emit TransferLimitUpdated(previousLimit, maxTransferAmount);
    }
    
    /**
     * @dev Set address exemption from transfer limits
     * @param _account Address to update
     * @param _isExempt Whether the address is exempt
     */
    function setTransferLimitExemption(address _account, bool _isExempt) external onlyRole(DEFAULT_ADMIN_ROLE) {
        isExemptFromTransferLimit[_account] = _isExempt;
        emit ExemptionUpdated(_account, _isExempt);
    }
    
    /**
     * @dev Burn tokens (only callable by accounts with BURNER_ROLE)
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) public override {
        require(hasRole(BURNER_ROLE, msg.sender) || msg.sender == launchpad, "ClampifyToken: Not authorized to burn");
        super.burn(amount);
    }
    
    /**
     * @dev Burn tokens from an account (only callable by accounts with BURNER_ROLE)
     * @param account Account to burn from
     * @param amount Amount to burn
     */
    function burnFrom(address account, uint256 amount) public override {
        require(hasRole(BURNER_ROLE, msg.sender) || msg.sender == launchpad, "ClampifyToken: Not authorized to burn");
        super.burnFrom(account, amount);
    }
}