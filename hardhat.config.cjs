require('@nomicfoundation/hardhat-toolbox');
require('@nomicfoundation/hardhat-viem');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  optimizer: {
    enabled: true,
    runs: 1_000_000,
  },
  ignition: {
    maxFeePerGasLimit: 50_000_000_000n, // 50 gwei
    maxPriorityFeePerGas: 2_000_000_000n, // 2 gwei
  },
  solidity: {
    compilers: [
      {
        version: '0.8.24',
      },
      {
        version: '0.7.6',
      },
      {
        version: '0.8.20',
      },
    ],
  },
};
