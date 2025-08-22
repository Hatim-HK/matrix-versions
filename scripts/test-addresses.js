// Quick script to test address validation
const WalletService = require('../src/WalletService');

async function testAddresses() {
  console.log('🧪 Testing Address Validation...\n');
  
  const serviceV5 = new WalletService('v5');
  const serviceV6 = new WalletService('v6');
  
  const testAddresses = [
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik
    '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8', // Binance
    '0xA0b86a33E6417c7B07A39E1A747Ba8D2aE0d1e1F', // Test address (might have checksum issue)
    '0x0000000000000000000000000000000000000000', // Zero address
    'invalid-address',
    '0x123',
    ''
  ];
  
  console.log('Address Validation Results:');
  console.log('Address'.padEnd(45), 'V5', 'V6', 'Match');
  console.log('-'.repeat(60));
  
  for (const address of testAddresses) {
    const isValidV5 = serviceV5.isValidAddress(address);
    const isValidV6 = serviceV6.isValidAddress(address);
    const match = isValidV5 === isValidV6 ? '✅' : '❌';
    
    const shortAddress = address.length > 42 ? address.substring(0, 42) + '...' : address;
    console.log(
      shortAddress.padEnd(45),
      isValidV5 ? '✅' : '❌',
      isValidV6 ? '✅' : '❌', 
      match
    );
  }
  
  console.log('\n🔧 Testing Address Normalization...\n');
  
  const testNormalization = [
    '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', // lowercase
    '0xD8DA6BF26964AF9D7EED9E03E53415D37AA96045', // uppercase
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'  // mixed case (correct)
  ];
  
  for (const address of testNormalization) {
    try {
      const normalizedV5 = serviceV5.normalizeAddress(address);
      const normalizedV6 = serviceV6.normalizeAddress(address);
      const match = normalizedV5 === normalizedV6 ? '✅' : '❌';
      
      console.log(`Input:  ${address}`);
      console.log(`V5:     ${normalizedV5}`);
      console.log(`V6:     ${normalizedV6}`);
      console.log(`Match:  ${match}\n`);
    } catch (error) {
      console.log(`❌ Error normalizing ${address}: ${error.message}\n`);
    }
  }
}

// Run if called directly
if (require.main === module) {
  testAddresses().catch(console.error);
}

module.exports = testAddresses;