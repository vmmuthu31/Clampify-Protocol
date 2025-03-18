// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ClampifyBondingCurve
 * @dev Implements pump.fun style bonding curve for token pricing with platform revenue share
 * @author vmmuthu31
 * @notice Last modified: 2025-03-17 19:10:45
 */
contract ClampifyBondingCurve is AccessControl {
    using SafeMath for uint256;
    
    // Constants for curve parameters
    uint256 public constant RESERVE_RATIO = 500000; // 50% in parts per million
    uint256 public constant PPM = 1000000;          // Parts per million
    uint256 public constant INITIAL_PRICE = 1e15;   // 0.001 ETH initial price
    
    // Role identifiers
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");
    
    // Platform fee configuration
    uint256 public platformFeePercentage = 25;      // 0.25% default fee
    address public feeCollector;
    address public platformToken;
    
    // Curve state variables
    mapping(address => uint256) public connectorBalances;  // Platform token reserve per meme token
    mapping(address => uint256) public tokenSupplies;      // Current supply of each token
    
    // Events
    event TokensIssued(address indexed token, uint256 supply, uint256 price);
    event TokensRedeemed(address indexed token, uint256 supply, uint256 price);
    event FeeCollected(address indexed token, uint256 amount, address collector);
    event FeeParametersUpdated(uint256 newPercentage, address newCollector);
    
    /**
     * @dev Constructor sets up roles
     * @param _platformToken The address of the platform token used as reserve
     * @param _feeCollector The address that will receive fees
     */
    constructor(address _platformToken, address _feeCollector) {
        require(_platformToken != address(0), "Platform token cannot be zero address");
        require(_feeCollector != address(0), "Fee collector cannot be zero address");
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(FEE_MANAGER_ROLE, msg.sender);
        
        platformToken = _platformToken;
        feeCollector = _feeCollector;
    }
    
    /**
     * @dev Set platform fee percentage and collector
     * @param _feePercentage New fee percentage (in basis points, 25 = 0.25%)
     * @param _feeCollector New fee collector address
     */
    function setPlatformFeeParameters(uint256 _feePercentage, address _feeCollector) external onlyRole(FEE_MANAGER_ROLE) {
        require(_feePercentage <= 100, "Fee cannot exceed 1%");  // Max 1% fee
        require(_feeCollector != address(0), "Fee collector cannot be zero address");
        
        platformFeePercentage = _feePercentage;
        feeCollector = _feeCollector;
        
        emit FeeParametersUpdated(_feePercentage, _feeCollector);
    }
    
    /**
     * @dev Initialize a new token with the bonding curve
     * @param _token The token address
     * @param _initialSupply The initial token supply
     * @param _initialReserve Initial reserve amount in platform tokens
     */
    function initializeToken(address _token, uint256 _initialSupply, uint256 _initialReserve) external onlyRole(ADMIN_ROLE) {
        require(tokenSupplies[_token] == 0, "Token already initialized");
        require(_initialSupply > 0, "Initial supply must be positive");
        
        tokenSupplies[_token] = _initialSupply;
        connectorBalances[_token] = _initialReserve;
        
        emit TokensIssued(_token, _initialSupply, calculateCurrentPrice(_token));
    }
    
    /**
     * @dev Calculate amount of tokens to mint for given reserve deposit
     * @param _token The token address
     * @param _reserveAmount Amount of reserve tokens to deposit
     * @return Amount of tokens to mint
     */
    function calculatePurchaseReturn(address _token, uint256 _reserveAmount) public view returns (uint256) {
        uint256 supply = tokenSupplies[_token];
        uint256 reserve = connectorBalances[_token];
        
        // Return 0 if token not initialized or no deposit
        if (supply == 0 || reserve == 0 || _reserveAmount == 0) return 0;
        
        // Adjust for platform fee
        uint256 feeAmount = _reserveAmount.mul(platformFeePercentage).div(10000);
        uint256 effectiveDeposit = _reserveAmount.sub(feeAmount);
        
        // Formula: supply * ((1 + deposit/reserve)^(reserveRatio) - 1)
        // For 50% reserve ratio this simplifies to a square root formula
        
        uint256 newReserve = reserve.add(effectiveDeposit);
        uint256 ratio = newReserve.mul(PPM).div(reserve);
        
        // When RESERVE_RATIO is 50%, we can use sqrt approximation
        if (RESERVE_RATIO == 500000) {
            // Calculate sqrt(ratio) * supply - supply
            uint256 sqrtRatio = sqrt(ratio.mul(PPM));
            return supply.mul(sqrtRatio).div(PPM).sub(supply);
        } else {
            // For other reserve ratios, use an approximation
            uint256 exponent = RESERVE_RATIO.mul(PPM);
            uint256 result = pow(ratio, exponent).mul(supply).div(PPM).sub(supply);
            return result;
        }
    }
    
    /**
     * @dev Calculate reserve amount returned for token redemption
     * @param _token The token address
     * @param _tokenAmount Amount of tokens to redeem
     * @return Amount of reserve tokens to return
     */
    function calculateSaleReturn(address _token, uint256 _tokenAmount) public view returns (uint256) {
        uint256 supply = tokenSupplies[_token];
        uint256 reserve = connectorBalances[_token];
        
        // Return 0 if token not initialized or invalid sale
        if (supply == 0 || reserve == 0 || _tokenAmount == 0 || _tokenAmount >= supply) return 0;
        
        // Formula: reserve * (1 - (1 - tokenAmount/supply)^(1/reserveRatio))
        // For 50% reserve ratio, this simplifies to a square relationship
        
        uint256 newSupply = supply.sub(_tokenAmount);
        uint256 ratio = newSupply.mul(PPM).div(supply);
        
        // When RESERVE_RATIO is 50%, we can use square approximation
        if (RESERVE_RATIO == 500000) {
            // Calculate reserve * (1 - ratio^2)
            uint256 ratioSquared = ratio.mul(ratio).div(PPM);
            uint256 rawReturn = reserve.mul(PPM.sub(ratioSquared)).div(PPM);
            
            // Apply platform fee
            uint256 feeAmount = rawReturn.mul(platformFeePercentage).div(10000);
            return rawReturn.sub(feeAmount);
        } else {
            // For other reserve ratios, use an approximation
            uint256 exponent = PPM.div(RESERVE_RATIO);
            uint256 rawReturn = reserve.mul(PPM.sub(pow(ratio, exponent))).div(PPM);
            
            // Apply platform fee
            uint256 feeAmount = rawReturn.mul(platformFeePercentage).div(10000);
            return rawReturn.sub(feeAmount);
        }
    }
    
    /**
     * @dev Calculate current token price based on supply and reserve
     * @param _token The token address
     * @return Current price in platform token units
     */
    function calculateCurrentPrice(address _token) public view returns (uint256) {
        uint256 supply = tokenSupplies[_token];
        uint256 reserve = connectorBalances[_token];
        
        // Default to initial price if not initialized
        if (supply == 0 || reserve == 0) return INITIAL_PRICE;
        
        // Price = reserve * reserveRatio / supply
        return reserve.mul(RESERVE_RATIO).div(supply);
    }
    
    /**
     * @dev Update token supply and reserve after mint/burn
     * @param _token The token address
     * @param _supply New supply
     * @param _reserve New reserve
     */
    function updateCurveState(address _token, uint256 _supply, uint256 _reserve) external onlyRole(ADMIN_ROLE) {
        require(_token != address(0), "Invalid token address");
        
        tokenSupplies[_token] = _supply;
        connectorBalances[_token] = _reserve;
    }
    
    /**
     * @dev Handle token minting via the curve
     * @param _token The token address
     * @param _reserveAmount Amount of reserve token deposited
     * @return Amount of tokens to mint
     */
    function handleMint(address _token, uint256 _reserveAmount) external onlyRole(ADMIN_ROLE) returns (uint256) {
        require(_reserveAmount > 0, "Reserve deposit must be positive");
        
        // Calculate platform fee
        uint256 platformFee = _reserveAmount.mul(platformFeePercentage).div(10000);
        uint256 effectiveDeposit = _reserveAmount.sub(platformFee);
        
        // Calculate tokens to mint based on effective deposit
        uint256 tokensToMint = calculatePurchaseReturn(_token, effectiveDeposit);
        require(tokensToMint > 0, "Invalid mint amount");
        
        // Transfer platform fee to fee collector
        if (platformFee > 0) {
            IERC20(platformToken).transfer(feeCollector, platformFee);
            emit FeeCollected(_token, platformFee, feeCollector);
        }
        
        // Update state with effective deposit
        connectorBalances[_token] = connectorBalances[_token].add(effectiveDeposit);
        tokenSupplies[_token] = tokenSupplies[_token].add(tokensToMint);
        
        emit TokensIssued(_token, tokensToMint, calculateCurrentPrice(_token));
        
        return tokensToMint;
    }
    
    /**
     * @dev Handle token burning via the curve
     * @param _token The token address
     * @param _tokenAmount Amount of tokens to burn
     * @return Amount of reserve tokens to return
     */
    function handleBurn(address _token, uint256 _tokenAmount) external onlyRole(ADMIN_ROLE) returns (uint256) {
        require(_tokenAmount > 0, "Token amount must be positive");
        
        // Calculate raw reserve return
        uint256 rawReserveReturn = calculateSaleReturn(_token, _tokenAmount);
        require(rawReserveReturn > 0, "Invalid burn amount");
        
        // Calculate platform fee
        uint256 platformFee = rawReserveReturn.mul(platformFeePercentage).div(10000);
        uint256 effectiveReturn = rawReserveReturn.sub(platformFee);
        
        // Transfer platform fee to fee collector
        if (platformFee > 0) {
            IERC20(platformToken).transfer(feeCollector, platformFee);
            emit FeeCollected(_token, platformFee, feeCollector);
        }
        
        // Update state with full reserve change
        connectorBalances[_token] = connectorBalances[_token].sub(rawReserveReturn);
        tokenSupplies[_token] = tokenSupplies[_token].sub(_tokenAmount);
        
        emit TokensRedeemed(_token, _tokenAmount, calculateCurrentPrice(_token));
        
        return effectiveReturn;
    }
    
    /**
     * @dev Square root function
     * @param x Input value
     * @return y Square root of x
     */
    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
    
    /**
     * @dev Power function with fixed point precision
     * @param _base Base value
     * @param _exponent Exponent value (in ppm)
     * @return result Base raised to the fractional exponent
     */
    function pow(uint256 _base, uint256 _exponent) internal pure returns (uint256 result) {
        // Simplified power function for approximation
        // For more precise calculation, would use logarithmic approximation
        
        // Simple case - integer exponent
        if (_exponent % PPM == 0) {
            result = 1;
            uint256 expInt = _exponent / PPM;
            uint256 base = _base;
            
            while (expInt > 0) {
                if (expInt % 2 == 1) {
                    result = result.mul(base).div(PPM);
                }
                expInt = expInt / 2;
                base = base.mul(base).div(PPM);
            }
            return result;
        } else {
            // For fractional exponents, use a binomial approximation
            // This is a simplified approach - in production would use logarithmic methods
            return _approximatePower(_base, _exponent);
        }
    }
    
    /**
     * @dev Power function approximation using binomial expansion
     * @param _base Base value
     * @param _exponent Exponent value (in ppm)
     * @return result Approximate result of exponentiation
     */
    function _approximatePower(uint256 _base, uint256 _exponent) private pure returns (uint256) {
        uint256 expRemainder = _exponent.mod(PPM);
        
        // Use a linear approximation for small fractional exponents
        if (expRemainder == 0) {
            return PPM;
        }
        
        // First term of binomial expansion
        uint256 term1 = PPM;
        
        // Second term of binomial expansion (e * ln(x))
        uint256 adjustment = expRemainder.mul(_base.sub(PPM)).div(PPM);
        
        // For small exponents, linear approximation is reasonable
        if (expRemainder <= 100000) { // Less than 0.1
            return term1.add(adjustment);
        } else {
            // Add some compensation factor for larger fractions
            return term1.add(adjustment.mul(85).div(100));
        }
    }
}