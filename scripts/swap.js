import 'dotenv/config';
import {
  aeroUniversalRouterAbi,
  baseUsdcAbi,
  walletClient,
  weth9Abi,
  daiAbi,
  publicClient,
} from '../utils.js';
import { parseUnits, toHex, getContract, toBytes } from 'viem';
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

  // Approve tokens
  const MAX_UINT = BigInt(2) ** BigInt(256) - BigInt(1);

  // try {
  //   const spender = router.address; //SwapContract Address
  //   const value = parseUnits('.5', 6);

  //   console.log({
  //     spender: spender,
  //     usdcAmount: value,
  //   });

  //   const hash = await token.write.approve([spender, value]);
  //   console.log('tx successful: ', hash);
  //   const approveReceipt = await publicClient.waitForTransactionReceipt({
  //     hash: hash,
  //   });
  //   console.log('approval receipt: ', approveReceipt);

  //   const transferHash = await token.write.transfer([spender, value]);
  //   console.log('Transfer USDC complete: ', transferHash);

  //   const transferReceipt = await publicClient.waitForTransactionReceipt({
  //     hash: transferHash,
  //   });
  //   console.log('usdc transfer receipt: ', transferReceipt);
  // } catch (error) {
  //   console.log('Error attempting to approve token: ', error);
  // }

  // const tokenApprovalTx = await token.write.approve([router.address, MAX_UINT]);
  // const tokenApprovalReceipt = await publicClient.waitForTransactionReceipt({
  //   hash: tokenApprovalTx,
  // });
  // console.log(
  //   'Token approval transaction mined:',
  //   tokenApprovalReceipt.blockHash
  // );

  // const daiApprovalTx = await dai.write.approve([router.address, MAX_UINT]);
  // const daiApprovalReceipt = await publicClient.waitForTransactionReceipt({
  //   hash: daiApprovalTx,
  // });
  // console.log('DAI approval transaction mined:', daiApprovalReceipt.blockHash);

  // Define the swap parameters
  const amountIn = parseUnits('1', 6); // 1 TOKEN // USDC uses 6 decimals
  const minAmountOut = parseUnits('0.3', 18); // Minimum amount of DAI

  // V2_SWAP_EXACT_OUT simple --> 0x09

  const commands = toHex(toBytes(9)); // 0x09
  console.log('commands: ', commands);
  console.log('length of command : ', commands.length);

  // Define the path object
  const route = {
    from: toHexAddress(TOKEN_ADDRESS),
    to: toHexAddress(DAI_ADDRESS),
    stable: false,
  };

  console.log('path:', route);

  // Create an array of path objects
  const routes = [route];
  console.log('paths: ', routes);

  // Manually encode the parameters
  const swapInputs = ethers.AbiCoder.defaultAbiCoder().encode(
    [
      'address', // Constants.MSG_SENDER
      'uint256', // AMOUNT
      'uint256', // type(uint256).max
      'tuple(address from, address to, bool stable)[]', // routes
      'bool', // true
    ],
    [account, minAmountOut, MAX_UINT, routes, false]
  );
  let inputs = [];
  inputs[0] = swapInputs;

  console.log('inputs: ', inputs);

  // Execute the swap
  try {
    const tx = await router.write.execute([commands, inputs]);
    const executeReceipt = await publicClient.waitForTransactionReceipt({
      hash: tx,
    });
    console.log('swap executed:', executeReceipt.blockHash);
    console.log('Swap executed successfully');
  } catch (executeError) {
    console.error('Error executing swap: ', executeError);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
