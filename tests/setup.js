// Global test setup
const { spawn } = require('child_process');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

// Global test configuration
global.testConfig = {
  timeout: 30000,
  retries: 3,
  rpcUrl: process.env.RPC_URL || 'http://127.0.0.1:8545'
};

// Helper function to wait for condition
global.waitForCondition = async (conditionFn, timeout = 10000, interval = 100) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await conditionFn()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error(`Condition not met within ${timeout}ms`);
};

// Helper to check if hardhat node is running
global.isHardhatRunning = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8545', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Start hardhat node if not running
beforeAll(async () => {
  const isRunning = await global.isHardhatRunning();
  if (!isRunning) {
    console.log('Starting Hardhat node...');
    // Note: In CI, you'd want to start this as a background service
    // For local development, start manually with: npx hardhat node
    console.log('Please start Hardhat node manually: npx hardhat node --fork YOUR_RPC_URL');
    
    // Wait for node to be ready
    await global.waitForCondition(global.isHardhatRunning, 30000);
  }
}, 40000);