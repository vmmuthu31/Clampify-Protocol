// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./ClampifyToken.sol";

/**
 * @title ClampifyFactory
 * @dev Factory contract for creating new meme tokens with bonding curve, supply locking, and automatic/manual token graduation
 */
contract ClampifyFactory is Ownable, ReentrancyGuard {
    // Fee structure
    uint256 public creationFee = 0.01 ether;
    uint256 public tradingFeePercent = 2; // 2% trading fee

    // Graduation requirements (owner can update)
    uint256 public graduationMarketCap = 100 ether; // Example: 100 ETH market cap
    uint256 public graduationVolume = 100_000 * 10**18; // Example: 100,000 tokens traded

    // Token details structure
    struct TokenInfo {
        address tokenAddress;
        address creator;
        uint256 createdAt;
        uint256 lockupPeriod;
        bool liquidityLocked;
        uint256 liquidityUnlockTime;
        bool graduated;            // graduation status
        uint256 graduatedAt;       // block timestamp when graduated
    }

    // Mapping of token address to token info
    mapping(address => TokenInfo) public tokens;

    // Array of token addresses
    address[] public allTokens;

    // Events
    event TokenCreated(address indexed tokenAddress, address indexed creator, string name, string symbol);
    event TokenGraduated(address indexed tokenAddress, uint256 marketCap, uint256 totalVolume, uint256 at, bool isAuto);
    event FeesUpdated(uint256 creationFee, uint256 tradingFeePercent);
    event FeesCollected(uint256 amount);
    event GraduationThresholdsUpdated(uint256 marketCap, uint256 volume);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Create a new token with bonding curve
     * @param name Token name
     * @param symbol Token symbol
     * @param initialSupply Initial supply of tokens
     * @param maxSupply Maximum supply of tokens
     * @param initialPrice Initial price in wei
     * @param creatorLockupPeriod Period in seconds for creator's tokens to be locked
     * @param lockLiquidity Whether to lock liquidity
     * @param liquidityLockPeriod Period in seconds for liquidity to be locked
     * @return tokenAddress Address of the new token
     */
    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 maxSupply,
        uint256 initialPrice,
        uint256 creatorLockupPeriod,
        bool lockLiquidity,
        uint256 liquidityLockPeriod
    ) external payable nonReentrant returns (address tokenAddress) {
        // Ensure creation fee is paid
        require(msg.value >= creationFee, "Insufficient fee");
        
        // Create new token contract
        ClampifyToken newToken = new ClampifyToken(
            name,
            symbol,
            initialSupply,
            maxSupply,
            initialPrice,
            msg.sender,
            creatorLockupPeriod,
            address(this)
        );
        tokenAddress = address(newToken);
        
        // Store token info
        tokens[tokenAddress] = TokenInfo({
            tokenAddress: tokenAddress,
            creator: msg.sender,
            createdAt: block.timestamp,
            lockupPeriod: creatorLockupPeriod,
            liquidityLocked: lockLiquidity,
            liquidityUnlockTime: lockLiquidity ? block.timestamp + liquidityLockPeriod : 0,
            graduated: false,
            graduatedAt: 0
        });
        allTokens.push(tokenAddress);
        emit TokenCreated(tokenAddress, msg.sender, name, symbol);

        return tokenAddress;
    }

    /**
     * @dev Get all tokens created
     * @return Array of token addresses
     */
    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }

    /**
     * @dev Get token count
     * @return Number of tokens created
     */
    function getTokenCount() external view returns (uint256) {
        return allTokens.length;
    }

    /**
     * @dev Update fees
     * @param newCreationFee New creation fee
     * @param newTradingFeePercent New trading fee percent
     */
    function updateFees(uint256 newCreationFee, uint256 newTradingFeePercent) external onlyOwner {
        require(newTradingFeePercent <= 5, "Trading fee too high"); // Cap at 5%
        creationFee = newCreationFee;
        tradingFeePercent = newTradingFeePercent;
        emit FeesUpdated(creationFee, tradingFeePercent);
    }

    /**
     * @dev Update graduation thresholds
     * @param _marketCap Graduation market cap threshold
     * @param _volume Graduation volume threshold
     */
    function updateGraduationThresholds(uint256 _marketCap, uint256 _volume) external onlyOwner {
        graduationMarketCap = _marketCap;
        graduationVolume = _volume;
        emit GraduationThresholdsUpdated(_marketCap, _volume);
    }

    /**
     * @dev Calculate trading fee
     * @param amount Amount to calculate fee for
     * @return Fee amount
     */
    function calculateTradingFee(uint256 amount) public view returns (uint256) {
        return (amount * tradingFeePercent) / 100;
    }

    /**
     * @dev Collect fees
     */
    function collectFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to collect");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Fee transfer failed");
        emit FeesCollected(balance);
    }

    /**
     * @dev Get token info for a specific token
     * @param tokenAddress Address of the token
     * @return creator Address of the token creator
     * @return createdAt Timestamp when the token was created
     * @return lockupPeriod Period in seconds for creator's tokens to be locked
     * @return liquidityLocked Whether liquidity is locked
     * @return liquidityUnlockTime Timestamp when liquidity will be unlocked
     * @return graduated Whether the token has graduated
     * @return graduatedAt Timestamp when the token was graduated
     */
    function getTokenInfo(address tokenAddress) external view returns (
        address creator,
        uint256 createdAt,
        uint256 lockupPeriod,
        bool liquidityLocked,
        uint256 liquidityUnlockTime,
        bool graduated,
        uint256 graduatedAt
    ) {
        TokenInfo storage info = tokens[tokenAddress];
        require(info.tokenAddress != address(0), "Token not found");

        return (
            info.creator,
            info.createdAt,
            info.lockupPeriod,
            info.liquidityLocked,
            info.liquidityUnlockTime,
            info.graduated,
            info.graduatedAt
        );
    }

    /**
     * @dev Check if a token is graduated
     * @param tokenAddress Address of the token
     * @return True if graduated, false otherwise
     */
    function isGraduated(address tokenAddress) external view returns (bool) {
        return tokens[tokenAddress].graduated;
    }

    /**
     * @dev (Manual) Trigger graduation for a token if requirements are met
     *      Only owner or token creator can call this as a fallback/manual path.
     */
    function graduateToken(address tokenAddress) public nonReentrant {
        TokenInfo storage info = tokens[tokenAddress];
        require(info.tokenAddress != address(0), "Token not found");
        require(!info.graduated, "Already graduated");
        require(
            msg.sender == owner() || msg.sender == info.creator,
            "Only owner or creator can manually graduate"
        );

        (
            , // currentPrice (unused)
            uint256 marketCap,
            uint256 volumeTraded,
            , // ath (unused)
            // atl (unused)
        ) = ClampifyToken(payable(tokenAddress)).getTokenStatistics();

        require(marketCap >= graduationMarketCap, "Market cap too low for graduation");
        require(volumeTraded >= graduationVolume, "Volume too low for graduation");

        info.graduated = true;
        info.graduatedAt = block.timestamp;
        emit TokenGraduated(tokenAddress, marketCap, volumeTraded, block.timestamp, false);
    }

    /**
     * @dev (Auto) Called by token contract after every trade (buy/sell) to check for graduation.
     *      Only callable by a registered ClampifyToken.
     */
    function checkAndAutoGraduate(address tokenAddress) external {
        TokenInfo storage info = tokens[tokenAddress];
        require(info.tokenAddress != address(0), "Token not found");
        require(msg.sender == tokenAddress, "Only token contract can auto-graduate itself");
        if (info.graduated) return;

        (
            , // currentPrice (unused)
            uint256 marketCap,
            uint256 volumeTraded,
            , // ath (unused)
            // atl (unused)
        ) = ClampifyToken(payable(tokenAddress)).getTokenStatistics();

        if (marketCap >= graduationMarketCap && volumeTraded >= graduationVolume) {
            info.graduated = true;
            info.graduatedAt = block.timestamp;
            emit TokenGraduated(tokenAddress, marketCap, volumeTraded, block.timestamp, true);
        }
    }

    receive() external payable {}
}