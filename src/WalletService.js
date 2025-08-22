// Abstraction layer to handle both ethers v5 and v6
class WalletService {
  constructor(version = 'v6') {
    this.version = version;
    this.ethers = this._loadEthers(version);
    this.provider = null;
  }

  _loadEthers(version) {
    if (version === 'v5') {
      return require('ethers-v5');
    } else {
      return require('ethers');
    }
  }

  async connect(rpcUrl) {
    if (this.version === 'v5') {
      this.provider = new this.ethers.providers.JsonRpcProvider(rpcUrl);
    } else {
      this.provider = new this.ethers.JsonRpcProvider(rpcUrl);
    }
    return this.provider;
  }

  async getBalance(address) {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }

    // Normalize address to handle checksum issues
    const normalizedAddress = this.normalizeAddress(address);
    
    const balance = await this.provider.getBalance(normalizedAddress);
    
    // Handle different return types between v5 and v6
    if (this.version === 'v5') {
      return {
        raw: balance,
        formatted: this.ethers.utils.formatEther(balance),
        wei: balance.toString()
      };
    } else {
      return {
        raw: balance,
        formatted: this.ethers.formatEther(balance),
        wei: balance.toString()
      };
    }
  }

  normalizeAddress(address) {
    // Handle basic validation and normalization
    if (!address || typeof address !== 'string') {
      throw new Error('Invalid address format');
    }
    
    // For ethers, we can use getAddress to normalize checksum
    if (this.version === 'v5') {
      return this.ethers.utils.getAddress(address);
    } else {
      return this.ethers.getAddress(address);
    }
  }

  async getBlockNumber() {
    if (!this.provider) {
      throw new Error('Provider not connected');
    }
    return await this.provider.getBlockNumber();
  }

  createWallet(privateKey) {
    if (this.version === 'v5') {
      return new this.ethers.Wallet(privateKey, this.provider);
    } else {
      return new this.ethers.Wallet(privateKey, this.provider);
    }
  }

  // Helper method to check if address is valid
  isValidAddress(address) {
    try {
      if (!address || typeof address !== 'string') {
        return false;
      }
      
      if (this.version === 'v5') {
        // In v5, isAddress is more lenient, getAddress throws on invalid
        this.ethers.utils.getAddress(address);
        return true;
      } else {
        // In v6, isAddress might be stricter, but getAddress is more reliable
        this.ethers.getAddress(address);
        return true;
      }
    } catch {
      return false;
    }
  }

  // Format utilities
  formatEther(wei) {
    if (this.version === 'v5') {
      return this.ethers.utils.formatEther(wei);
    } else {
      return this.ethers.formatEther(wei);
    }
  }

  parseEther(ether) {
    if (this.version === 'v5') {
      return this.ethers.utils.parseEther(ether);
    } else {
      return this.ethers.parseEther(ether);
    }
  }
}

module.exports = WalletService;