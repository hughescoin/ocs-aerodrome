import 'dotenv/config';
import {
  aeroUniversalRouterAbi,
  baseUsdcAbi,
  walletClient,
  weth9Abi,
  daiAbi,
  publicClient,
  permit2Abi,
  approveTokensToRouter,
} from '../utils.js';
import { parseUnits, toHex, getContract, toBytes, boolToHex, size } from 'viem';
import { ethers } from 'ethers';

// Replace with actual contract ABIs and addresses
const ROUTER_ABI = aeroUniversalRouterAbi;
const TOKEN_ABI = baseUsdcAbi;
const WETH_ABI = weth9Abi;
const DAI_ABI = daiAbi;

const ROUTER_ADDRESS = process.env.AERO_UNIVERSAL_ROUTER; // Universal Router contract address
const TOKEN_ADDRESS = process.env.USDC_BASE; // Token contract address
const WETH_ADDRESS = process.env.WETH9_BASE; // WETH contract address
const DAI_ADDRESS = process.env.DAI_BASE;

function toHexAddress(address) {
  if (!ethers.isAddress(address)) {
    throw new Error(`Invalid address: ${address}`);
  }
  return ethers.getAddress(address);
}

const permitSingle = {
  spender: '',
  sigDeadline: '',
};

const permitDetails = {
  address: '',
  amount: '',
  expiration: '',
  nonce: '',
};

async function main() {
  // Get signer (e.g., account)
  const [account] = await walletClient.getAddresses();

  console.log('ROUTER_ADDRESS:', ROUTER_ADDRESS);
  console.log('TOKEN_ADDRESS:', TOKEN_ADDRESS);
  console.log('WETH_ADDRESS:', WETH_ADDRESS);
  console.log('DAI_ADDRESS:', DAI_ADDRESS);
  console.log('Account:', account);

  if (!ROUTER_ADDRESS || !TOKEN_ADDRESS || !WETH_ADDRESS || !DAI_ADDRESS) {
    throw new Error('One or more environment variables are missing');
  }

  // Initialize contracts
  const router = getContract({
    address: toHexAddress(ROUTER_ADDRESS),
    abi: ROUTER_ABI,
    client: walletClient,
  });

  const permit2 = getContract({
    address: toHexAddress(process.env.PERMIT2_BASE),
    abi: permit2Abi,
    client: walletClient,
  });
  const token = getContract({
    address: toHexAddress(TOKEN_ADDRESS),
    abi: TOKEN_ABI,
    client: walletClient,
  });

  const weth = getContract({
    address: toHexAddress(WETH_ADDRESS),
    abi: WETH_ABI,
    client: walletClient,
  });

  const dai = getContract({
    address: toHexAddress(DAI_ADDRESS),
    abi: DAI_ABI,
    client: walletClient,
  });

  const MAX_UINT = BigInt(2) ** BigInt(256) - BigInt(1);
  const MAX_UINT48 = (BigInt(1) << BigInt(48)) - BigInt(1);
  const MAX_UINT160 = (BigInt(1) << BigInt(160)) - BigInt(1);

  // Approve tokens
  const value = parseUnits('1', 6);

  await approveTokensToRouter(router, token, value);

  // V2_SWAP_EXACT_IN

  const commands = toHex(toBytes(8));
  console.log('commands: ', commands);
  console.log('length of command : ', commands.length);

  // Define the swap parameters
  const amountIn = parseUnits('1', 6); // 1 TOKEN // USDC uses 6 decimals
  const minAmountOut = parseUnits('0.9895', 18); // Minimum amount of DAI

  // Define the path

  const path = [
    toHexAddress(TOKEN_ADDRESS),
    toHexAddress(DAI_ADDRESS),
    toHexAddress(boolToHex(false, { size: 20 }).toString()),
  ];

  console.log('path:', path);
  console.log(
    `USDC Input: ${BigInt(amountIn)} \n Min DAI output: ${minAmountOut}`
  );

  // Manually encode the parameters
  const swapInputs = ethers.AbiCoder.defaultAbiCoder().encode(
    [
      'address', // Constants.MSG_SENDER
      'uint256', // AMOUNT
      'uint256', // type(uint256).max
      'address[]', // path
      'bool', // true
    ],
    [account, BigInt(amountIn), BigInt(0), path, true]
  );

  const inputs = [swapInputs];
  console.log('inputs: ', inputs);

  // Execute the swap
  try {
    const tx = await router.write.execute([commands, inputs]);
    const executeReceipt = await publicClient.waitForTransactionReceipt({
      hash: tx,
    });
    console.log('Swap executed successfully: ', executeReceipt.blockHash);
  } catch (executeError) {
    console.error('Error executing swap: ', executeError);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
