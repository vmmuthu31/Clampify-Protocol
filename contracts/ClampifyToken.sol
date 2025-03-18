// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ClampifyToken
 * @dev Token implementation that matches Clampify's expectations
 */
contract ClampifyToken {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    address public launchpad;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor(
        string memory _name, 
        string memory _symbol, 
        uint256 _initialSupply,
        address _launchpad
    ) {
        name = _name;
        symbol = _symbol;
        launchpad = _launchpad;
        
        totalSupply = _initialSupply;
        balanceOf[_launchpad] = _initialSupply;
        emit Transfer(address(0), _launchpad, _initialSupply);
    }
    
    modifier onlyLaunchpad() {
        require(msg.sender == launchpad, "Not launchpad");
        _;
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        return _transfer(msg.sender, to, amount);
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        if (msg.sender == launchpad) {
            // Launchpad can transfer without checking allowance
            return _transfer(from, to, amount);
        } else {
            require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
            allowance[from][msg.sender] -= amount;
            return _transfer(from, to, amount);
        }
    }
    
    function _transfer(address from, address to, uint256 amount) internal returns (bool) {
        require(to != address(0), "Transfer to zero address");
        require(balanceOf[from] >= amount, "Insufficient balance");
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
    
    function mint(address to, uint256 amount) external onlyLaunchpad {
        require(to != address(0), "Mint to zero address");
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }
    
    function burn(uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }
    
    function burnFrom(address account, uint256 amount) external {
        if (msg.sender == launchpad) {
            // Launchpad can burn without checking allowance
            require(balanceOf[account] >= amount, "Insufficient balance");
            balanceOf[account] -= amount;
            totalSupply -= amount;
            emit Transfer(account, address(0), amount);
        } else {
            require(account != address(0), "Burn from zero address");
            require(balanceOf[account] >= amount, "Insufficient balance");
            require(allowance[account][msg.sender] >= amount, "Insufficient allowance");
            
            allowance[account][msg.sender] -= amount;
            balanceOf[account] -= amount;
            totalSupply -= amount;
            
            emit Transfer(account, address(0), amount);
        }
    }
}