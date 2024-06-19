import 'dotenv/config';
import { encodeFunctionData, getContract, parseUnits } from 'viem';
import {
  aeroUniversalRouterAbi,
  walletClient,
  baseUsdcAbi, // This should be the ABI of the implementation contract
} from '../utils.js';

async function main() {
  const aerodromeUniversalRouter = getContract({
    address: process.env.AERO_UNIVERSAL_ROUTER,
    abi: aeroUniversalRouterAbi,
    client: walletClient,
  });

  const baseUsdc = getContract({
    address: process.env.USDC_BASE, // Proxy contract address
    abi: baseUsdcAbi, // Implementation contract ABI
    client: walletClient,
  });

  console.log('USDC Proxy Address: ', baseUsdc.address);
  console.log('Aerodrome Router Address: ', aerodromeUniversalRouter.address);

  const spender = aerodromeUniversalRouter.address;
  const value = parseUnits('1', 6); // USDC uses 6 decimals

  try {
    const [account] = await walletClient.getAddresses();
    console.log('Using account:', account);

    // const { request: usdcApprovalRequest } =
    //   await publicClient.simulateContract({
    //     address: baseUsdc.address, // Use the proxy address
    //     account: account,
    //     abi: baseUsdcAbi, // Use the implementation ABI
    //     functionName: 'approve',
    //     args: [spender, value],
    //   });

    const data = encodeFunctionData({
      abi: baseUsdcAbi,
      functionName: 'approve',
      args: [spender, value],
    });
    console.log('data: ', data);

    const request = await walletClient.prepareTransactionRequest({
      to: baseUsdc.address,
      data: data,
    });
    console.log('Approval request:', request);
    const signature = await walletClient.signTransaction(request);
    console.log('sig: ', signature);

    const hash = await walletClient.sendRawTransaction({
      serializedTransaction: signature,
    });
    console.log('tx sent: ', hash);
    //const tx = await walletClient.writeContract(usdcApprovalRequest);
    //console.log('Approval transaction sent successfully:', tx);
  } catch (error) {
    console.error('Error during contract interaction:', error);
  }
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
