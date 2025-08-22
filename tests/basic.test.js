const WalletService = require('../src/WalletService');

describe('Basic Ethers Compatibility Tests (No Node Required)', () => {
  const versions = ['v5', 'v6'];

  describe.each(versions)('Ethers %s Basic Functions', (version) => {
    let service;

    beforeEach(() => {
      service = new WalletService(version);
    });

    test('should initialize service correctly', () => {
      expect(service).toBeDefined();
      expect(service.version).toBe(version);
      expect(service.ethers).toBeDefined();
    });

    test('should validate addresses correctly', () => {
      const validAddresses = [
        '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',
        '0x0000000000000000000000000000000000000000'
      ];

      const invalidAddresses = [
        'invalid-address',
        '0x123',
        'not-an-address',
        '0xnotvalid',
        ''
      ];

      validAddresses.forEach(address => {
        expect(service.isValidAddress(address)).toBe(true);
      });

      invalidAddresses.forEach(address => {
        expect(service.isValidAddress(address)).toBe(false);
      });
    });

    test('should create wallet from private key', () => {
      const privateKey = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
      
      // Should not throw error
      expect(() => {
        const wallet = service.createWallet(privateKey);
        expect(wallet).toBeDefined();
        expect(wallet.address).toBeDefined();
        expect(service.isValidAddress(wallet.address)).toBe(true);
      }).not.toThrow();
    });

    test('should handle ether formatting', () => {
      const testCases = [
        { ether: '1.0', expectedWei: '1000000000000000000' },
        { ether: '0.1', expectedWei: '100000000000000000' },
        { ether: '1.5', expectedWei: '1500000000000000000' }
      ];

      testCases.forEach(({ ether, expectedWei }) => {
        const wei = service.parseEther(ether);
        expect(wei.toString()).toBe(expectedWei);
        
        const formatted = service.formatEther(wei);
        expect(formatted).toBe(ether);
      });
    });

    test('should throw error when getting balance without provider', async () => {
      const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
      
      await expect(service.getBalance(testAddress))
        .rejects.toThrow('Provider not connected');
    });

    test('should throw error when getting block number without provider', async () => {
      await expect(service.getBlockNumber())
        .rejects.toThrow('Provider not connected');
    });

    test('should handle address normalization', () => {
      const testCases = [
        '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', // lowercase
        '0xD8DA6BF26964AF9D7EED9E03E53415D37AA96045', // uppercase
        '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'  // mixed case (correct)
      ];

      testCases.forEach(address => {
        expect(() => {
          const normalized = service.normalizeAddress(address);
          expect(normalized).toBe('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
        }).not.toThrow();
      });
    });
  });

  describe('Cross-Version Compatibility (Basic)', () => {
    let serviceV5, serviceV6;

    beforeEach(() => {
      serviceV5 = new WalletService('v5');
      serviceV6 = new WalletService('v6');
    });

    test('should validate same addresses consistently', () => {
      const testAddresses = [
        '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',
        'invalid-address',
        '0x123',
        ''
      ];

      testAddresses.forEach(address => {
        const isValidV5 = serviceV5.isValidAddress(address);
        const isValidV6 = serviceV6.isValidAddress(address);
        expect(isValidV5).toBe(isValidV6);
      });
    });

    test('should create same wallet address from same private key', () => {
      const privateKey = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
      
      const walletV5 = serviceV5.createWallet(privateKey);
      const walletV6 = serviceV6.createWallet(privateKey);
      
      expect(walletV5.address.toLowerCase()).toBe(walletV6.address.toLowerCase());
    });

    test('should format ether amounts consistently', () => {
      const testAmounts = [
        '1000000000000000000',  // 1 ETH
        '500000000000000000',   // 0.5 ETH
        '1500000000000000000',  // 1.5 ETH
        '100000000000000000'    // 0.1 ETH
      ];

      testAmounts.forEach(wei => {
        const formattedV5 = serviceV5.formatEther(wei);
        const formattedV6 = serviceV6.formatEther(wei);
        expect(formattedV5).toBe(formattedV6);
      });
    });

    test('should parse ether amounts consistently', () => {
      const testAmounts = ['1.0', '0.5', '1.5', '0.1', '2.123456789'];

      testAmounts.forEach(ether => {
        const weiV5 = serviceV5.parseEther(ether);
        const weiV6 = serviceV6.parseEther(ether);
        expect(weiV5.toString()).toBe(weiV6.toString());
      });
    });

    test('should normalize addresses consistently', () => {
      const testAddresses = [
        '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', // lowercase
        '0xD8DA6BF26964AF9D7EED9E03E53415D37AA96045', // uppercase
        '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'  // mixed case
      ];

      testAddresses.forEach(address => {
        const normalizedV5 = serviceV5.normalizeAddress(address);
        const normalizedV6 = serviceV6.normalizeAddress(address);
        expect(normalizedV5).toBe(normalizedV6);
      });
    });
  });

  describe('Version-Specific Behavior', () => {
    test('should load correct ethers version', () => {
      const serviceV5 = new WalletService('v5');
      const serviceV6 = new WalletService('v6');

      // V5 should have utils, V6 should not (or in different location)
      if (serviceV5.version === 'v5') {
        expect(serviceV5.ethers.utils).toBeDefined();
      }
      
      // Both should have basic functions but potentially in different locations
      expect(serviceV5.ethers).toBeDefined();
      expect(serviceV6.ethers).toBeDefined();
    });

    test('should handle error types consistently', async () => {
      const serviceV5 = new WalletService('v5');
      const serviceV6 = new WalletService('v6');

      // Both should throw when no provider connected
      await expect(serviceV5.getBalance('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'))
        .rejects.toThrow('Provider not connected');
      
      await expect(serviceV6.getBalance('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'))
        .rejects.toThrow('Provider not connected');
    });
  });
});