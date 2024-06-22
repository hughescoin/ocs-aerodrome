import 'dotenv/config';
import {
  aeroUniversalRouterAbi,
  baseUsdcAbi,
  walletClient,
  weth9Abi,
  publicClient,
} from '../utils.js';
import { parseUnits, toBytes, toHex, getContract } from 'viem';

// Replace with actual contract ABIs and addresses
const ROUTER_ABI = aeroUniversalRouterAbi;
const TOKEN_ABI = baseUsdcAbi;
const WETH_ABI = weth9Abi;

const ROUTER_ADDRESS = process.env.AERO_UNIVERSAL_ROUTER; // Universal Router contract address
const TOKEN_ADDRESS = process.env.USDC_BASE; // Token contract address
const WETH_ADDRESS = process.env.WETH9_BASE; // WETH contract address
const DEADLINE = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

async function main() {
  // Get signer (e.g., account)
  const [account] = await walletClient.getAddresses();

  // Initialize contracts

  const router = getContract({
    address: ROUTER_ADDRESS,
    abi: ROUTER_ABI,
    client: walletClient,
  });

  const token = getContract({
    address: TOKEN_ADDRESS,
    abi: TOKEN_ABI,
    client: walletClient,
  });

  const weth = getContract({
    address: WETH_ADDRESS,
    abi: WETH_ABI,
    client: walletClient,
  });

  // Approve tokens
  const MAX_UINT = BigInt(2) ** BigInt(256) - BigInt(1);

  const tokenApprovalTx = await token.write.approve([router.address, MAX_UINT]);
  const tokenApprovalReceipt = await publicClient.waitForTransactionReceipt({
    hash: tokenApprovalTx,
  });
  console.log(
    'Token approval transaction mined:',
    tokenApprovalReceipt.blockHash
  );

  const wethApprovalTx = await weth.write.approve([router.address, MAX_UINT]);
  const wethApprovalReceipt = await publicClient.waitForTransactionReceipt({
    hash: wethApprovalTx,
  });
  console.log(
    'WETH9 approval transaction mined:',
    wethApprovalReceipt.blockHash
  );

  // Define the swap parameters
  const amountIn = parseUnits('1', 6); // 1 TOKEN // USDC uses 6 decimals
  const minAmountOut = parseUnits('0.9', 18); // Minimum amount of WETH

  const commands = toHex(toBytes('V2_SWAP_EXACT_IN'));

  const inputs = toHex(
    toBytes([
      account,
      amountIn,
      minAmountOut,
      [TOKEN_ADDRESS, WETH_ADDRESS],
      account,
    ])
  );

  // Execute the swap
  const tx = await router.write.execute([commands, inputs]);
  const executeReceipt = await publicClient.waitForTransactionReceipt({
    hash: tx,
  });
  console.log('swap executed:', executeReceipt.blockHash);

  console.log('Swap executed successfully');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
