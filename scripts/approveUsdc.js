import 'dotenv/config';
import { encodeFunctionData, getContract, parseUnits } from 'viem';
import { aeroUniversalRouterAbi, walletClient, baseUsdcAbi } from '../utils.js';

async function main() {
  const aerodromeUniversalRouter = getContract({
    address: process.env.AERO_UNIVERSAL_ROUTER,
    abi: aeroUniversalRouterAbi,
    client: walletClient,
  });

  const baseUsdc = getContract({
    address: process.env.USDC_BASE,
    abi: baseUsdcAbi,
    client: walletClient,
  });

  const spender = aerodromeUniversalRouter.address;
  const value = parseUnits('1', 6);

  try {
    const [account] = await walletClient.getAddresses();
    console.log('Using account:', account);

    const data = encodeFunctionData({
      abi: baseUsdcAbi,
      functionName: 'approve',
      args: [spender, value],
    });
    console.log('Encoded "approve" function: ', data);

    const request = await walletClient.prepareTransactionRequest({
      to: baseUsdc.address,
      data: data,
    });
    console.log('Approval request:', request);

    const signature = await walletClient.signTransaction(request);
    console.log('Signed transaction: ', signature);

    const hash = await walletClient.sendRawTransaction({
      serializedTransaction: signature,
    });

    console.log('Approval transaction sent successfully:', hash);
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
