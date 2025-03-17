// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ClampifyToken
 * @dev ERC20 token with minting and burning capabilities
 */
contract ClampifyToken is ERC20, ERC20Burnable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    
    address public launchpad;
    
    /**
     * @dev Constructor to initialize the token
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _initialSupply Initial supply of tokens
     * @param _launchpad Address of the launchpad
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        address _launchpad // End of Selection
    ) ERC20(_name, _symbol) {
        require(_launchpad != address(0), "Clampify: Launchpad cannot be zero address");
        
        launchpad = _launchpad;
   
        _grantRole(DEFAULT_ADMIN_ROLE, _launchpad);
        _grantRole(MINTER_ROLE, _launchpad);
        _grantRole(BURNER_ROLE, _launchpad);
        
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
     * @dev Burn tokens (only callable by accounts with BURNER_ROLE)
     * @param _amount Amount of tokens to burn
     */
    function burn(uint256 _amount) public override {
        require(hasRole(BURNER_ROLE, msg.sender) || msg.sender == launchpad, "Clampify: Not authorized to burn");
        super.burn(_amount);
    }
    
    /**
     * @dev Burn tokens from an account (only callable by accounts with BURNER_ROLE)
     * @param _account Account to burn from
     * @param _amount Amount to burn
     */
    function burnFrom(address _account, uint256 _amount) public override {
        require(hasRole(BURNER_ROLE, msg.sender) || msg.sender == launchpad, "Clampify: Not authorized to burn");
        super.burnFrom(_account, _amount);
    }
    
    /**
     * @dev Transfer tokens with launchpad approval
     * This allows the launchpad to enforce supply locking
     */
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public virtual override returns (bool) {
        if (msg.sender == launchpad) {
            _transfer(sender, recipient, amount);
            return true;
        } else {
            return super.transferFrom(sender, recipient, amount);
        }
    }
}