import { SWAP_ROUTER_02_ADDRESSES } from '@uniswap/sdk-core';
import {
  swapAbi,
  swapBytecode,
  publicClient,
  walletClient,
  account,
} from '../utils.js';

console.log('account: ', account);
console.log('base universal router address: ', SWAP_ROUTER_02_ADDRESSES(8453));

const hash = await walletClient.deployContract({
  abi: swapAbi,
  account: account,
  args: [SWAP_ROUTER_02_ADDRESSES(8453)],
  bytecode: swapBytecode,
});

console.log('Contract deployment successful. Tx: : ', hash);

const receipt = await publicClient.waitForTransactionReceipt({ hash: hash });

console.log('Contract address: ', receipt.contractAddress);
