// Network configuration
export const NETWORKS = {
  SEPOLIA: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    explorer: 'https://sepolia.etherscan.io',
  },
  HARDHAT: {
    chainId: 31337,
    name: 'Hardhat Local',
    rpcUrl: 'http://127.0.0.1:8545',
    explorer: 'http://localhost',
  },
};

// Contract address (deploy your contract and update this)
export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

// Contribution types
export const CONTRIBUTION_TYPES = {
  0: 'Code Review',
  1: 'Bug Fix',
  2: 'Feature Development',
  3: 'Documentation',
  4: 'Testing',
  5: 'Design',
};

// Points per contribution type
export const CONTRIBUTION_POINTS = [5, 4, 3, 3, 2, 2];
