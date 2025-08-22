# Ethers v5/v6 Backward Compatibility Test Harness

This repository demonstrates how to test backward compatibility between ethers v5 and v6 when getting wallet balances on Ethereum forks.

## Features

- ✅ **Version Matrix Testing**: Tests against both ethers v5 and v6
- ✅ **Cross-Version Compatibility**: Ensures identical behavior across versions  
- ✅ **Fork Testing**: Uses Hardhat to fork mainnet for realistic testing
- ✅ **CI Integration**: GitHub Actions workflow with compatibility gates
- ✅ **Abstraction Layer**: Clean API that works with both versions

## Quick Start

### Prerequisites

- Node.js 16+ 
- NPM or Yarn
- Ethereum RPC endpoint (Alchemy, Infura, etc.)

### Installation

```bash
git clone <repository-url>
cd matrix-versions
npm install
```

### Configuration

1. **Set up your RPC endpoint:**
```bash
export ETHEREUM_RPC_URL="https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY"
```

2. **Update hardhat.config.js** with your RPC URL

### Running Tests

#### Start Hardhat Fork
```bash
# Terminal 1: Start the fork
npx hardhat node --fork $ETHEREUM_RPC_URL
```

#### Run Compatibility Tests
```bash
# Terminal 2: Run all tests
npm test


# Test specific version
npm run test:v5
npm run test:v6

# Run cross-version compatibility
npm run test:compatibility
```

## Project Structure

```
├── src/
│   └── WalletService.js      # Abstraction layer for both ethers versions
├── tests/
│   ├── setup.js              # Test environment setup
│   └── compatibility.test.js # Main compatibility test suite
├── .github/workflows/
│   └── compatibility.yml     # CI/CD pipeline
├── hardhat.config.js         # Hardhat configuration for forking
├── jest.config.js            # Jest test configuration
└── package.json              # Dependencies and scripts
```

## Test Coverage

The test suite covers:

### Basic Functionality
- ✅ Provider connection
- ✅ Address validation  
- ✅ Balance retrieval
- ✅ Wallet creation
- ✅ Utility functions (formatEther, parseEther)

### Cross-Version Compatibility
- ✅ Identical balance results across versions
- ✅ Consistent formatting behavior
- ✅ Same address validation logic
- ✅ Identical wallet generation from private keys

### Error Handling
- ✅ Invalid address handling
- ✅ Connection error consistency
- ✅ Graceful failure modes

## CI/CD Pipeline

The GitHub Actions workflow tests:

### Version Matrix
- Node.js versions: 16.x, 18.x, 20.x
- Ethers versions: v5, v6
- Cross-compatibility between versions

### Compatibility Gates
- Backward compatibility checks **block releases** if they fail
- All tests must pass before allowing deployment
- Comprehensive test coverage reporting

### Pipeline Steps
1. **Setup**: Install dependencies, start Hardhat fork
2. **Matrix Testing**: Run tests across all version combinations  
3. **Compatibility Check**: Verify cross-version behavior
4. **Release Gate**: Block release if compatibility breaks

## Usage Examples

### Basic Usage

```javascript
const WalletService = require('./src/WalletService');

// Test with ethers v5
const serviceV5 = new WalletService('v5');
await serviceV5.connect('http://localhost:8545');

// Test with ethers v6  
const serviceV6 = new WalletService('v6');
await serviceV6.connect('http://localhost:8545');

// Get balance (works identically in both versions)
const balance = await serviceV5.getBalance('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
console.log(`Balance: ${balance.formatted} ETH`);
```

### Custom Test Cases

```javascript
describe('Custom Compatibility Tests', () => {
  test('should handle your specific use case', async () => {
    const addressToTest = '0x742d35Cc64C0532A5e4ad555b3824Be31c5e5917';
    
    const balanceV5 = await serviceV5.getBalance(addressToTest);
    const balanceV6 = await serviceV6.getBalance(addressToTest);
    
    expect(balanceV5.wei).toBe(balanceV6.wei);
  });
});
```

## Configuration Options

### Environment Variables
- `ETHEREUM_RPC_URL`: Your Ethereum RPC endpoint
- `ETHERS_VERSION`: Force specific version (v5 or v6)
- `CI`: Enable CI-specific behavior

### Test Configuration
```javascript
// jest.config.js
module.exports = {
  testTimeout: 30000,        // Longer timeout for blockchain calls
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  // ... other options
};
```

## Troubleshooting

### Common Issues

**1. RPC Connection Fails**
```bash
# Make sure your RPC URL is correct
export ETHEREUM_RPC_URL="https://eth-mainnet.alchemyapi.io/v2/YOUR_ACTUAL_KEY"

# Test connection
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $ETHEREUM_RPC_URL
```

**2. Hardhat Node Won't Start**
```bash
# Kill existing processes
pkill -f hardhat

# Start with specific fork block
npx hardhat node --fork $ETHEREUM_RPC_URL --fork-block-number 18500000
```

**3. Tests Timeout**
```bash
# Increase timeout in jest.config.js
module.exports = {
  testTimeout: 60000, // 60 seconds
};
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-test`
3. Add your compatibility tests
4. Ensure all tests pass: `npm run test:compatibility`  
5. Submit a pull request

## License

MIT License - feel free to use this as a template for your own compatibility testing needs.

---

This test harness provides a solid foundation for ensuring backward compatibility when working with different versions of ethers.js in your Ethereum applications.