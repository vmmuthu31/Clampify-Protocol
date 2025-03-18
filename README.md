# Clampify: Anti-Rug Pull Meme Token Platform with Bonding Curve

**Author:** vmmuthu31

## Overview

Clampify is a revolutionary meme token creation platform built on Core blockchain that offers built-in safeguards against rug pulls while providing a pump.fun style bonding curve mechanism for fair and transparent token pricing. The platform combines creator flexibility with investor protection through automatic liquidity locking, creator token vesting, and algorithmic price stabilization.

## Key Features

- 🔒 **Anti-Rug Pull Mechanisms**: Mandatory liquidity locking and creator token vesting
- 📈 **Bonding Curve**: Pump.fun style mathematical pricing model
- 💰 **Price Stabilization**: Automatic and configurable price stability mechanisms
- ✅ **Governance**: Token verification and platform parameter management
- 💸 **Sustainable Revenue Model**: Multiple fee streams for platform sustainability

## Contract Architecture

```
clampify
└─ contracts
   ├─ core
   │  └─ ClampifyImplementation.sol        # Core platform logic
   ├─ factory
   │  └─ ClampifyTokenFactory.sol          # Token creation factory
   ├─ governance
   │  └─ ClampifyGovernance.sol            # Platform governance
   ├─ interfaces
   │  ├─ IClampifyLaunchpad.sol            # Main platform interface
   │  ├─ IClampifyLockManager.sol          # Lock mechanism interface
   │  ├─ IClampifyStabilityManager.sol     # Price stability interface
   │  ├─ IClampifyTokenFactory.sol         # Factory interface
   │  ├─ IDEXFactory.sol                   # DEX integration interface
   │  ├─ IDEXRouter.sol                    # DEX router interface
   │  └─ IPriceOracle.sol                  # Price oracle interface
   ├─ libraries
   │  └─ LaunchpadStructs.sol              # Data structures
   ├─ managers
   │  ├─ ClampifyLockManager.sol           # Token & liquidity locking
   │  └─ ClampifyStabilityManager.sol      # Price stabilization
   ├─ pricing
   │  └─ ClampifyBondingCurve.sol          # Bonding curve mechanism
   ├─ proxy
   │  └─ ClampifyLaunchpadProxy.sol        # Platform entry point
   └─ tokens
      └─ ClampifyToken.sol                 # ERC20 token with protections
```

## Contract Details

### ClampifyLaunchpadProxy.sol

The main entry point for the platform that coordinates all modules.

**Key Functions:**

```solidity
function createMemeToken(
    string memory _name,
    string memory _symbol,
    uint256 _totalSupply,
    uint256 _creatorLockPercentage,
    uint256 _creatorLockDuration,
    uint256 _initialLiquidityAmount,
    uint256 _initialPrice,
    bool _enableStability
) external returns (address);

function getTokenInfo(address _token) external view returns (...);
function updateBondingCurve(address _newBondingCurve) external;
function setFeeParameters(...) external;
```

### ClampifyImplementation.sol

Contains the core logic for token creation and management.

**Key Functions:**

```solidity
function createMemeToken(...) external returns (address);
function getTokenInfo(address _token) external view returns (...);
function verifyToken(address _token, bool _isVerified) external;
```

### ClampifyTokenFactory.sol

Creates tokens and sets up initial liquidity pools.

**Key Functions:**

```solidity
function createToken(string memory _name, string memory _symbol, uint256 _totalSupply, address _owner) external returns (address);
function setupInitialLiquidity(address _tokenAddress, uint256 _liquidityAmount, uint256 _initialPrice) external returns (address, uint256);
```

### ClampifyToken.sol

ERC20 token with built-in transfer limits and rug-pull protection.

**Key Functions:**

```solidity
function mint(address _to, uint256 _amount) external;
function burn(uint256 _amount) external;
function setMaxTransferAmount(uint256 _maxAmount) external;
```

### ClampifyLockManager.sol

Manages token locking for creators and liquidity.

**Key Functions:**

```solidity
function lockSupply(address _token, address _holder, uint256 _amount, uint256 _releaseTime, bool _isVesting, uint256 _vestingStart, uint256 _vestingDuration) external;
function unlockTokens(address _token, uint256 _lockIndex) external;
```

### ClampifyStabilityManager.sol

Automatically stabilizes token prices based on configurable parameters.

**Key Functions:**

```solidity
function checkStabilization(address _token) external view returns (bool, bool, uint256);
function triggerStabilization(address _token) external;
```

### ClampifyBondingCurve.sol

Implements the pump.fun style bonding curve mechanism for token pricing.

**Key Functions:**

```solidity
function initializeToken(address _token, uint256 _initialSupply, uint256 _initialReserve) external;
function calculateCurrentPrice(address _token) public view returns (uint256);
function handleMint(address _token, uint256 _reserveAmount) external returns (uint256);
function handleBurn(address _token, uint256 _tokenAmount) external returns (uint256);
```

## Deployment Order

1. ClampifyToken.sol (Platform token)
2. ClampifyBondingCurve.sol
3. ClampifyTokenFactory.sol
4. ClampifyLockManager.sol
5. ClampifyStabilityManager.sol
6. ClampifyImplementation.sol
7. ClampifyLaunchpadProxy.sol
8. ClampifyGovernance.sol

## Bonding Curve Mechanism

Our bonding curve implementation uses a 50% reserve ratio with a mathematical relationship between token supply and price:

- **Purchase Formula**: `supply * ((1 + deposit/reserve)^(reserveRatio) - 1)`
- **Sale Formula**: `reserve * (1 - (1 - tokenAmount/supply)^(1/reserveRatio))`
- **Price Calculation**: `reserve * reserveRatio / supply`

The bonding curve creates a transparent and predictable token pricing model that rewards early adopters while maintaining liquidity for all participants.

## Revenue Model

The platform generates revenue through multiple streams:

1. **Token Creation Fee**: 2% of token supply
2. **Trading Fee**: 0.5% of trade value
3. **Liquidity Lock Fee**: 0.1% of locked liquidity
4. **Bonding Curve Fee**: 0.25% of bonding curve transactions

These fees are configurable by governance and can be directed to the platform treasury, used for buybacks, or distributed to governance token stakers.

## Security Features

- **Mandatory Liquidity Locking**: Initial liquidity is locked for a minimum of 180 days
- **Creator Token Vesting**: Portions of creator tokens are locked for a minimum of 30 days
- **Transfer Limits**: Configurable maximum transfer amounts to prevent dumps
- **Price Stabilization**: Automatic mint/burn mechanisms to maintain price stability
- **Role-Based Access**: Granular permission system for platform management

## Example: Token Creation

```javascript
// Connect to platform
const clampify = await ethers.getContractAt(
  "ClampifyLaunchpadProxy",
  PROXY_ADDRESS
);

// Approve platform to spend platform tokens for creation fee
const platformToken = await ethers.getContractAt(
  "IERC20",
  PLATFORM_TOKEN_ADDRESS
);
await platformToken.approve(PROXY_ADDRESS, ethers.utils.parseEther("1000"));

// Create new token
const tx = await clampify.createMemeToken(
  "Awesome Meme Token", // name
  "AMT", // symbol
  ethers.utils.parseEther("1000000"), // totalSupply
  2000, // creatorLockPercentage (20%)
  60 * 60 * 24 * 90, // creatorLockDuration (90 days)
  ethers.utils.parseEther("100000"), // initialLiquidityAmount
  ethers.utils.parseEther("0.001"), // initialPrice
  true // enableStability
);

// Get created token address
const receipt = await tx.wait();
const event = receipt.events.find((e) => e.event === "TokenCreated");
const tokenAddress = event.args.token;
```

## Contributing

We welcome contributions to the Clampify platform! Please see our [Contribution Guidelines](https://clampify.xyz/contributing) for more information.

## License

Clampify is released under the MIT License.

## Contact

- Website: [https://clampify.xyz](https://clampify.xyz)
- Twitter: [@ClampifyProject](https://twitter.com/ClampifyProject)
- GitHub: [github.com/vmmuthu31/clampify](https://github.com/vmmuthu31/Clampify-Protocol)

---

Built with ❤️ on Core blockchain by vmmuthu31 and the Clampify team.
