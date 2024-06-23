import { getContract, parseUnits, formatUnits } from 'viem';
import {
  walletClient,
  swapAbi,
  publicClient,
  baseUsdcAbi,
  account,
} from '../utils.js';
const baseUsdcAddress = process.env.USDC_BASE;
const contractAddress = '0xb0d35ac1504b935f4270b368454b4b715b916d40';

const contract = getContract({
  address: contractAddress,
  abi: swapAbi,
  client: { public: publicClient, wallet: walletClient },
});

const baseUsdc = getContract({
  address: baseUsdcAddress,
  abi: baseUsdcAbi,
  client: walletClient,
});

const rawBalance = await baseUsdc.read.balanceOf([
  walletClient.account.address,
]);
const balance = formatUnits(rawBalance, 6);

console.log(`${walletClient.account.address}'s USDC balance: ${balance}`);

try {
  const spender = contract.address; //SwapContract Address
  const value = parseUnits('1', 6);

  console.log({
    spender: spender,
    usdcAmount: value,
  });

  const hash = await baseUsdc.write.approve([spender, value]);
  console.log('tx successful: ', hash);
  const approveReceipt = await publicClient.waitForTransactionReceipt({
    hash: hash,
  });
  console.log('approval receipt: ', approveReceipt);
} catch (error) {
  console.log('Error attempting to approve token: ', error);
}

try {
  const value = 1; //parseUnits('1', 6);
  console.log(`Swapping ${value} USDC for WETH`);
  const { request } = await publicClient.simulateContract({
    account: account,
    address: contract.address,
    abi: swapAbi,
    functionName: 'swapExactInputSingle',
    args: [value],
    gas: 900000,
  });

  // const hash = await contract.write.swapExactInputSingle([value]);
  // const receipt = await publicClient.waitForTransactionReceipt({ hash: hash });
  console.log('Swap successful! tx: ', receipt);
} catch (error) {
  console.log('Error swapping: ', error);
}
