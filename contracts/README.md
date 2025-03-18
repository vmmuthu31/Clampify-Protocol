# ClampFi Protocol

## The First Supply-Clamping Meme Token Launchpad

ClampFi is an innovative meme token launchpad built on Core blockchain that introduces revolutionary supply clamping technology to make rug pulls mathematically impossible while preserving the fun and creativity of meme tokens.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Built on Core](https://img.shields.io/badge/Built%20on-Core-blue)](https://coredao.org/)
[![Anti-Rug](https://img.shields.io/badge/Anti-Rug-green)](https://github.com/clampfi/protocol)

## 🔒 What is Supply Clamping?

Supply clamping is a breakthrough security approach that limits token holders' ability to dump large amounts of tokens at once by implementing:

1. **Time-Based Locking**: Tokens are locked for specific time periods
2. **Graduated Release**: Vested tokens unlock gradually, not all at once
3. **Maximum Daily Limits**: Holders can only sell a percentage of their holdings per day
4. **Dynamic Adjustments**: Sell limits adapt based on market conditions

## 🛡️ Key Security Features

### Anti-Rug Pull Mechanics

- Mandatory creator token locking (minimum 30 days)
- Required liquidity locking (minimum 180 days)
- Maximum sell limits of 3% per wallet per day
- Bonding curve option that makes liquidity rug pulls impossible

### Stability Mechanisms

- Price stability through automatic mint/burn functions
- Configurable price thresholds for intervention
- Market stress detection for additional protection
- Bonding curve option for algorithmic price stability

### Community Governance

- On-chain governance through token-weighted voting
- Community control of platform parameters
- Democratic proposal and execution system
- Transparent, immutable rules

## 📊 How It Works

### Token Creation

Creating tokens through ClampFi requires:

- Creator token locking (minimum 20% of supply)
- Liquidity provision with time lock
- Compliance with minimum security standards

### Token Trading

ClampFi offers two trading models:

1. **Traditional DEX Trading** - With enhanced security layers
2. **Bonding Curve** - Algorithmic pricing that prevents rug pulls

### Supply Locks

Tokens are subject to:

- Time-based release schedules
- Maximum daily selling limits
- Vesting options for gradual distribution
- Transparent on-chain lock tracking

### Governance

Platform parameters are controlled by:

- Token-weighted voting by the community
- Formal proposal process
- Transparent execution of approved changes
- Role-based access control

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- Yarn or npm
- MetaMask or Web3 wallet

### Installation for Local Development

```bash
# Clone the repository
git clone https://github.com/vmmuthu31/Clampify-Protocol
cd protocol

# Install dependencies
yarn install

# Compile contracts
yarn compile

# Run tests
yarn test

# Deploy to local network
yarn deploy:local
```

## 📝 Contract Addresses (Core Mainnet)

| Contract           | Address |
| ------------------ | ------- |
| ClampFi Protocol   | `0x...` |
| ClampFi Governance | `0x...` |
| Platform Token     | `0x...` |

## 🔧 Developer Resources

### Smart Contract Architecture

The protocol consists of four main contracts:

1. `Clampify.sol` - Core protocol handling token creation and security
2. `ClampifyToken.sol` - Token implementation with special security features
3. `ClampifyGovernance.sol` - On-chain governance system
4. `BondingCurve.sol` - Algorithmic price discovery implementation

### Key Functions

#### Token Creation

```solidity
function createMemeToken(
    string memory _name,
    string memory _symbol,
    uint256 _totalSupply,
    uint256 _creatorLockPercentage,
    uint256 _creatorLockDuration,
    uint256 _initialLiquidityAmount,
    uint256 _initialPrice,
    bool _enableStability,
    bool _useBondingCurve
) external payable returns (address);
```

#### Supply Locking

```solidity
function lockSupply(
    address _token,
    address _holder,
    uint256 _amount,
    uint256 _releaseTime,
    bool _isVesting,
    uint256 _vestingStart,
    uint256 _vestingDuration
) external;
```

#### Trading via Bonding Curve

```solidity
function buyFromBondingCurve(address _token, uint256 _platformAmount)
    external returns (uint256 _returnAmount);

function sellToBondingCurve(address _token, uint256 _tokenAmount)
    external returns (uint256 _returnAmount);
```

#### Governance Actions

```solidity
function createProposal(
    string memory _description,
    address _targetContract,
    bytes memory _callData,
    uint256 _votingPeriod
) external;
```

## 📈 Use Cases

### For Token Creators

- Create meme tokens with built-in security features
- Earn ongoing rewards from successful tokens
- Build community trust through verifiable security

### For Investors

- Trade meme tokens with protection against rug pulls
- Participate in governance decisions
- Enjoy more stable token economics

### For Developers

- Build on top of the protocol with our SDK
- Create custom security features
- Integrate with existing DeFi applications

## 🤝 Contributing

We welcome contributions to the ClampFi Protocol! Please see our [contribution guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Website](https://clampfi.xyz)
<!-- - [Documentation](https://docs.clampfi.finance)
- [Twitter](https://twitter.com/clampfi)
- [Discord](https://discord.gg/clampfi)
- [Medium](https://medium.com/@clampfi) -->

## 🙏 Acknowledgements

- Core blockchain for providing the foundation
- OpenZeppelin for secure contract libraries
- Our community for continuous feedback and support

---

## Security Disclaimer

ClampFi Protocol is built with security as a priority, but please use at your own risk. Always do your own research and consider the risks of blockchain and smart contract interactions.
