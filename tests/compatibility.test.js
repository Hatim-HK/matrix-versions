const WalletService = require('../src/WalletService');

const TEST_CONFIG = {
  rpcUrl: 'http://127.0.0.1:8545',
  testAddresses: [
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik's address (correct checksum)
    '0xA0b86a33E6417c7B07A39E1A747Ba8D2aE0d1e1F',  // Test address (needs checksum fix)
    '0x0000000000000000000000000000000000000000'   // Zero address
  ],
  // Use properly checksummed addresses
  validTestAddresses: [
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik's address
    '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',  // Binance Hot Wallet
  ],
  testPrivateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
};

describe('Ethers Version Compatibility Tests', () => {
  const versions = ['v5', 'v6'];
  let services = {};

  beforeAll(async () => {
    // Initialize services for both versions
    for (const version of versions) {
      services[version] = new WalletService(version);
      await services[version].connect(TEST_CONFIG.rpcUrl);
    }
  });

  describe.each(versions)('Ethers %s', (version) => {
    let service;

    beforeEach(() => {
      service = services[version];
    });

    test('should connect to provider', async () => {
      expect(service.provider).toBeDefined();
      const blockNumber = await service.getBlockNumber();
      expect(typeof blockNumber).toBe('number');
      expect(blockNumber).toBeGreaterThan(0);
    });

    test('should validate addresses correctly', () => {
      // Test with properly checksummed addresses
      TEST_CONFIG.validTestAddresses.forEach(address => {
        expect(service.isValidAddress(address)).toBe(true);
      });
      
      // Test zero address
      expect(service.isValidAddress('0x0000000000000000000000000000000000000000')).toBe(true);
      
      // Test invalid addresses
      expect(service.isValidAddress('invalid-address')).toBe(false);
      expect(service.isValidAddress('0x123')).toBe(false);
      expect(service.isValidAddress('')).toBe(false);
    });

    test('should get balance for valid addresses', async () => {
      for (const address of TEST_CONFIG.validTestAddresses) {
        const balance = await service.getBalance(address);
        
        expect(balance).toHaveProperty('raw');
        expect(balance).toHaveProperty('formatted');
        expect(balance).toHaveProperty('wei');
        expect(typeof balance.formatted).toBe('string');
        expect(typeof balance.wei).toBe('string');
        
        // Balance should be a valid number when parsed
        const parsedBalance = parseFloat(balance.formatted);
        expect(parsedBalance).toBeGreaterThanOrEqual(0);
        
        // Wei should be a valid number string
        expect(balance.wei).toMatch(/^\d+$/);
      }
    });

    test('should handle zero balance correctly', async () => {
      // Instead of assuming zero address has 0 balance (which it might not on a fork),
      // let's test that we can format any balance correctly
      const testAddress = TEST_CONFIG.validTestAddresses[0];
      const balance = await service.getBalance(testAddress);
      
      // Test that formatting works - any balance >= 0 is valid
      expect(parseFloat(balance.formatted)).toBeGreaterThanOrEqual(0);
      expect(balance.wei).toMatch(/^\d+$/);
      
      // Test formatting edge case with 0
      const zeroFormatted = service.formatEther('0');
      expect(zeroFormatted).toBe('0.0');
    });

    test('should create wallet with private key', () => {
      const wallet = service.createWallet(TEST_CONFIG.testPrivateKey);
      expect(wallet).toBeDefined();
      expect(wallet.address).toBeDefined();
      expect(service.isValidAddress(wallet.address)).toBe(true);
    });

    test('should format ether correctly', () => {
      const weiAmount = service.parseEther('1.5');
      const formatted = service.formatEther(weiAmount);
      expect(formatted).toBe('1.5');
    });
  });

  describe('Cross-Version Compatibility', () => {
    test('should return same balance for same address across versions', async () => {
      const testAddress = TEST_CONFIG.validTestAddresses[0];
      
      const balanceV5 = await services.v5.getBalance(testAddress);
      const balanceV6 = await services.v6.getBalance(testAddress);
      
      // The raw balance should be identical
      expect(balanceV5.wei).toBe(balanceV6.wei);
      expect(balanceV5.formatted).toBe(balanceV6.formatted);
    });

    test('should handle formatting consistently across versions', () => {
      const testAmount = '1234567890000000000'; // 1.23456789 ETH in wei
      
      const formattedV5 = services.v5.formatEther(testAmount);
      const formattedV6 = services.v6.formatEther(testAmount);
      
      expect(formattedV5).toBe(formattedV6);
    });

    test('should validate same addresses consistently', () => {
      const validAddresses = TEST_CONFIG.validTestAddresses;
      const invalidAddresses = ['invalid-address', '0x123', ''];
      
      [...validAddresses, ...invalidAddresses].forEach(address => {
        const isValidV5 = services.v5.isValidAddress(address);
        const isValidV6 = services.v6.isValidAddress(address);
        expect(isValidV5).toBe(isValidV6);
      });
    });

    test('should create wallets with same address from same private key', () => {
      const walletV5 = services.v5.createWallet(TEST_CONFIG.testPrivateKey);
      const walletV6 = services.v6.createWallet(TEST_CONFIG.testPrivateKey);
      
      expect(walletV5.address.toLowerCase()).toBe(walletV6.address.toLowerCase());
    });
  });

  describe('Error Handling Compatibility', () => {
    test('should handle invalid addresses consistently', async () => {
      const invalidAddress = 'invalid-address';
      
      await expect(services.v5.getBalance(invalidAddress))
        .rejects.toThrow();
      
      await expect(services.v6.getBalance(invalidAddress))
        .rejects.toThrow();
    });

    test('should handle connection errors consistently', async () => {
      const disconnectedV5 = new WalletService('v5');
      const disconnectedV6 = new WalletService('v6');
      
      await expect(disconnectedV5.getBalance(TEST_CONFIG.testAddresses[0]))
        .rejects.toThrow('Provider not connected');
      
      await expect(disconnectedV6.getBalance(TEST_CONFIG.testAddresses[0]))
        .rejects.toThrow('Provider not connected');
    });
  });
});