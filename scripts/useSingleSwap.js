import {
  getContract,
  parseUnits,
  formatUnits,
  encodeFunctionData,
  decodeFunctionData,
} from 'viem';
import {
  walletClient,
  swapAbi,
  publicClient,
  baseUsdcAbi,
  account,
} from '../utils.js';
const baseUsdcAddress = process.env.USDC_BASE;
const contractAddress = '0x4bf436be1faa321ea1a96ed8a42bcec6eaddcfa9';

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

// try {
//   const spender = contract.address; //SwapContract Address
//   const value = parseUnits('1', 6);

//   console.log({
//     spender: spender,
//     usdcAmount: value,
//   });

//   const hash = await baseUsdc.write.approve([spender, value]);
//   console.log('tx successful: ', hash);
//   const approveReceipt = await publicClient.waitForTransactionReceipt({
//     hash: hash,
//   });
//   console.log('approval receipt: ', approveReceipt);

//   const transferHash = await baseUsdc.write.transfer([spender, value]);
//   console.log('Transfer USDC complete: ', transferHash);

//   const transferReceipt = await publicClient.waitForTransactionReceipt({
//     hash: transferHash,
//   });
//   console.log('usdc transfer receipt: ', transferReceipt);
// } catch (error) {
//   console.log('Error attempting to approve token: ', error);
// }

try {
  const value = parseUnits('1', 6);
  console.log(`Swapping ${value} USDC for WETH`);
  // const { request } = await publicClient.simulateContract({
  //   address: contract.address,
  //   abi: swapAbi,
  //   functionName: 'swapExactInputSingle',
  //   account: account,
  //   args: [1],
  //   gas: 900000,
  // });

  // const data = encodeFunctionData({
  //   abi: swapAbi,
  //   functionName: 'swapExactInputSingle',
  //   args: [1],
  // });

  const a = decodeFunctionData({
    abi: swapAbi,
    data: '0x73bd43ad0000000000000000000000000000000000000000000000000000000000000001',
  });
  console.log('a: ', a);

  console.log('Encoded "swapExactInputSingle" tx data: ', data);

  const request = await walletClient.prepareTransactionRequest({
    to: contractAddress,
    data: data,
  });
  console.log('Approval request:', request);

  const signature = await walletClient.signTransaction(request);
  console.log('Signed transaction: ', signature);

  const hash = await walletClient.sendRawTransaction({
    serializedTransaction: signature,
  });

  console.log('Approval transaction sent successfully:', hash);

  // const hash = await contract.write.swapExactInputSingle([value]);
  // const receipt = await publicClient.waitForTransactionReceipt({ hash: hash });
  console.log('Swap successful! tx: ', receipt);
} catch (error) {
  console.log('Error swapping: ', error);
}
