import 'dotenv/config';
import { createWalletClient, createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

export const account = privateKeyToAccount(`0x${process.env.WALLET_PK}`);

export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL),
});

export const walletClient = createWalletClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL),
  account: account,
});

export async function approveTokensToPermit2(
  permit2Contract,
  tokenContract,
  value
) {
  try {
    const spender = permit2Contract.address; //Aerodrome Universal Router
    console.log({
      spender: spender,
      usdcAmount: value,
    });

    const hash = await tokenContract.write.approve([spender, value]);
    console.log('tx successful: ', hash);
    const approveReceipt = await publicClient.waitForTransactionReceipt({
      hash: hash,
    });
    console.log('approval receipt: ', approveReceipt);
  } catch (error) {
    console.log('Error attempting to approve token: ', error);
  }
}

export async function permit2Router(
  permit2Contract,
  tokenAddress,
  spenderAddress,
  amount
) {
  try {
    const deadline = (await publicClient.getBlock()).number;
    const permit2Hash = await permit2Contract.write.approve([
      tokenAddress,
      spenderAddress,
      amount,
      deadline,
    ]);

    const permit2Receipt = await publicClient.waitForTransactionReceipt({
      hash: permit2Hash,
    });

    console.log('permit2 successful : ', permit2Receipt);
  } catch (error) {
    console.log('error with permit2 approval =>', error);
  }
}

export async function approveTokensToRouter(
  routerContract,
  tokenContract,
  value
) {
  try {
    const spender = routerContract.address; //Aerodrome Universal Router
    console.log(
      `Approving ${value} of USDC to be spent by the Universal Router ... \n Router address ${spender}`
    );

    const hash = await tokenContract.write.approve([spender, value]);
    console.log(' approval tx successful: ', hash);
    const approveReceipt = await publicClient.waitForTransactionReceipt({
      hash: hash,
    });
    console.log('tx mined receipt: ', approveReceipt.blockHash);
  } catch (error) {
    console.log('Error attempting to approve token: ', error);
  }
}

export async function transferTokenToRouter(
  tokenContract,
  routerContract,
  value
) {
  try {
    const transferHash = await tokenContract.write.transfer([
      routerContract.address,
      value,
    ]);
    console.log('token transfer complete: ', transferHash);

    const transferReceipt = await publicClient.waitForTransactionReceipt({
      hash: transferHash,
    });

    console.log('usdc transfer receipt: ', transferReceipt);
  } catch (error) {
    console.log('error transfering tokens => ', error);
  }
}

export const baseUsdcAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'authorizer',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'nonce',
        type: 'bytes32',
      },
    ],
    name: 'AuthorizationCanceled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'authorizer',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'nonce',
        type: 'bytes32',
      },
    ],
    name: 'AuthorizationUsed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: '_account',
        type: 'address',
      },
    ],
    name: 'Blacklisted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'newBlacklister',
        type: 'address',
      },
    ],
    name: 'BlacklisterChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'burner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Burn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'newMasterMinter',
        type: 'address',
      },
    ],
    name: 'MasterMinterChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'minter',
        type: 'address',
      },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Mint',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'minter',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'minterAllowedAmount',
        type: 'uint256',
      },
    ],
    name: 'MinterConfigured',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'oldMinter',
        type: 'address',
      },
    ],
    name: 'MinterRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  { anonymous: false, inputs: [], name: 'Pause', type: 'event' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'newAddress',
        type: 'address',
      },
    ],
    name: 'PauserChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'newRescuer',
        type: 'address',
      },
    ],
    name: 'RescuerChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: '_account',
        type: 'address',
      },
    ],
    name: 'UnBlacklisted',
    type: 'event',
  },
  { anonymous: false, inputs: [], name: 'Unpause', type: 'event' },
  {
    inputs: [],
    name: 'CANCEL_AUTHORIZATION_TYPEHASH',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PERMIT_TYPEHASH',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'RECEIVE_WITH_AUTHORIZATION_TYPEHASH',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'TRANSFER_WITH_AUTHORIZATION_TYPEHASH',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'authorizer', type: 'address' },
      { internalType: 'bytes32', name: 'nonce', type: 'bytes32' },
    ],
    name: 'authorizationState',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_account', type: 'address' }],
    name: 'blacklist',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'blacklister',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'authorizer', type: 'address' },
      { internalType: 'bytes32', name: 'nonce', type: 'bytes32' },
      { internalType: 'uint8', name: 'v', type: 'uint8' },
      { internalType: 'bytes32', name: 'r', type: 'bytes32' },
      { internalType: 'bytes32', name: 's', type: 'bytes32' },
    ],
    name: 'cancelAuthorization',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'authorizer', type: 'address' },
      { internalType: 'bytes32', name: 'nonce', type: 'bytes32' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'cancelAuthorization',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'minter', type: 'address' },
      { internalType: 'uint256', name: 'minterAllowedAmount', type: 'uint256' },
    ],
    name: 'configureMinter',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'currency',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'decrement', type: 'uint256' },
    ],
    name: 'decreaseAllowance',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'increment', type: 'uint256' },
    ],
    name: 'increaseAllowance',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'tokenName', type: 'string' },
      { internalType: 'string', name: 'tokenSymbol', type: 'string' },
      { internalType: 'string', name: 'tokenCurrency', type: 'string' },
      { internalType: 'uint8', name: 'tokenDecimals', type: 'uint8' },
      { internalType: 'address', name: 'newMasterMinter', type: 'address' },
      { internalType: 'address', name: 'newPauser', type: 'address' },
      { internalType: 'address', name: 'newBlacklister', type: 'address' },
      { internalType: 'address', name: 'newOwner', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'newName', type: 'string' }],
    name: 'initializeV2',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'lostAndFound', type: 'address' },
    ],
    name: 'initializeV2_1',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'accountsToBlacklist',
        type: 'address[]',
      },
      { internalType: 'string', name: 'newSymbol', type: 'string' },
    ],
    name: 'initializeV2_2',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_account', type: 'address' }],
    name: 'isBlacklisted',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'isMinter',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'masterMinter',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'minter', type: 'address' }],
    name: 'minterAllowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'nonces',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pauser',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
      { internalType: 'uint8', name: 'v', type: 'uint8' },
      { internalType: 'bytes32', name: 'r', type: 'bytes32' },
      { internalType: 'bytes32', name: 's', type: 'bytes32' },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'uint256', name: 'validAfter', type: 'uint256' },
      { internalType: 'uint256', name: 'validBefore', type: 'uint256' },
      { internalType: 'bytes32', name: 'nonce', type: 'bytes32' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'receiveWithAuthorization',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'uint256', name: 'validAfter', type: 'uint256' },
      { internalType: 'uint256', name: 'validBefore', type: 'uint256' },
      { internalType: 'bytes32', name: 'nonce', type: 'bytes32' },
      { internalType: 'uint8', name: 'v', type: 'uint8' },
      { internalType: 'bytes32', name: 'r', type: 'bytes32' },
      { internalType: 'bytes32', name: 's', type: 'bytes32' },
    ],
    name: 'receiveWithAuthorization',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'minter', type: 'address' }],
    name: 'removeMinter',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IERC20',
        name: 'tokenContract',
        type: 'address',
      },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'rescueERC20',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rescuer',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'uint256', name: 'validAfter', type: 'uint256' },
      { internalType: 'uint256', name: 'validBefore', type: 'uint256' },
      { internalType: 'bytes32', name: 'nonce', type: 'bytes32' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'transferWithAuthorization',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'uint256', name: 'validAfter', type: 'uint256' },
      { internalType: 'uint256', name: 'validBefore', type: 'uint256' },
      { internalType: 'bytes32', name: 'nonce', type: 'bytes32' },
      { internalType: 'uint8', name: 'v', type: 'uint8' },
      { internalType: 'bytes32', name: 'r', type: 'bytes32' },
      { internalType: 'bytes32', name: 's', type: 'bytes32' },
    ],
    name: 'transferWithAuthorization',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_account', type: 'address' }],
    name: 'unBlacklist',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_newBlacklister', type: 'address' },
    ],
    name: 'updateBlacklister',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_newMasterMinter', type: 'address' },
    ],
    name: 'updateMasterMinter',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_newPauser', type: 'address' }],
    name: 'updatePauser',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newRescuer', type: 'address' }],
    name: 'updateRescuer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'pure',
    type: 'function',
  },
];

export const aeroUniversalRouterAbi = [
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'permit2', type: 'address' },
          { internalType: 'address', name: 'weth9', type: 'address' },
          { internalType: 'address', name: 'seaportV1_5', type: 'address' },
          { internalType: 'address', name: 'seaportV1_4', type: 'address' },
          { internalType: 'address', name: 'openseaConduit', type: 'address' },
          { internalType: 'address', name: 'nftxZap', type: 'address' },
          { internalType: 'address', name: 'x2y2', type: 'address' },
          { internalType: 'address', name: 'foundation', type: 'address' },
          { internalType: 'address', name: 'sudoswap', type: 'address' },
          { internalType: 'address', name: 'elementMarket', type: 'address' },
          { internalType: 'address', name: 'nft20Zap', type: 'address' },
          { internalType: 'address', name: 'cryptopunks', type: 'address' },
          { internalType: 'address', name: 'looksRareV2', type: 'address' },
          {
            internalType: 'address',
            name: 'routerRewardsDistributor',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'looksRareRewardsDistributor',
            type: 'address',
          },
          { internalType: 'address', name: 'looksRareToken', type: 'address' },
          { internalType: 'address', name: 'v2Factory', type: 'address' },
          {
            internalType: 'address',
            name: 'v2Implementation',
            type: 'address',
          },
          { internalType: 'address', name: 'v3Factory', type: 'address' },
          {
            internalType: 'address',
            name: 'clImplementation',
            type: 'address',
          },
        ],
        internalType: 'struct RouterParameters',
        name: 'params',
        type: 'tuple',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], name: 'BalanceTooLow', type: 'error' },
  { inputs: [], name: 'BuyPunkFailed', type: 'error' },
  { inputs: [], name: 'ContractLocked', type: 'error' },
  { inputs: [], name: 'ETHNotAccepted', type: 'error' },
  {
    inputs: [
      { internalType: 'uint256', name: 'commandIndex', type: 'uint256' },
      { internalType: 'bytes', name: 'message', type: 'bytes' },
    ],
    name: 'ExecutionFailed',
    type: 'error',
  },
  { inputs: [], name: 'FromAddressIsNotOwner', type: 'error' },
  { inputs: [], name: 'InsufficientETH', type: 'error' },
  { inputs: [], name: 'InsufficientToken', type: 'error' },
  { inputs: [], name: 'InvalidBips', type: 'error' },
  {
    inputs: [{ internalType: 'uint256', name: 'commandType', type: 'uint256' }],
    name: 'InvalidCommandType',
    type: 'error',
  },
  { inputs: [], name: 'InvalidOwnerERC1155', type: 'error' },
  { inputs: [], name: 'InvalidOwnerERC721', type: 'error' },
  { inputs: [], name: 'InvalidPath', type: 'error' },
  { inputs: [], name: 'InvalidReserves', type: 'error' },
  { inputs: [], name: 'InvalidSpender', type: 'error' },
  { inputs: [], name: 'LengthMismatch', type: 'error' },
  { inputs: [], name: 'NotUniversalRouter', type: 'error' },
  { inputs: [], name: 'SliceOutOfBounds', type: 'error' },
  { inputs: [], name: 'StableExactOutputUnsupported', type: 'error' },
  { inputs: [], name: 'TransactionDeadlinePassed', type: 'error' },
  { inputs: [], name: 'UnableToClaim', type: 'error' },
  { inputs: [], name: 'UnsafeCast', type: 'error' },
  { inputs: [], name: 'V2InvalidPath', type: 'error' },
  { inputs: [], name: 'V2TooLittleReceived', type: 'error' },
  { inputs: [], name: 'V2TooMuchRequested', type: 'error' },
  { inputs: [], name: 'V3InvalidAmountOut', type: 'error' },
  { inputs: [], name: 'V3InvalidCaller', type: 'error' },
  { inputs: [], name: 'V3InvalidSwap', type: 'error' },
  { inputs: [], name: 'V3TooLittleReceived', type: 'error' },
  { inputs: [], name: 'V3TooMuchRequested', type: 'error' },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'RewardsSent',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'bytes', name: 'looksRareClaim', type: 'bytes' }],
    name: 'collectRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes', name: 'commands', type: 'bytes' },
      { internalType: 'bytes[]', name: 'inputs', type: 'bytes[]' },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes', name: 'commands', type: 'bytes' },
      { internalType: 'bytes[]', name: 'inputs', type: 'bytes[]' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256[]', name: '', type: 'uint256[]' },
      { internalType: 'uint256[]', name: '', type: 'uint256[]' },
      { internalType: 'bytes', name: '', type: 'bytes' },
    ],
    name: 'onERC1155BatchReceived',
    outputs: [{ internalType: 'bytes4', name: '', type: 'bytes4' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'bytes', name: '', type: 'bytes' },
    ],
    name: 'onERC1155Received',
    outputs: [{ internalType: 'bytes4', name: '', type: 'bytes4' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'bytes', name: '', type: 'bytes' },
    ],
    name: 'onERC721Received',
    outputs: [{ internalType: 'bytes4', name: '', type: 'bytes4' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'stf',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'int256', name: 'amount0Delta', type: 'int256' },
      { internalType: 'int256', name: 'amount1Delta', type: 'int256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'uniswapV3SwapCallback',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
];

export const weth9Abi = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'src', type: 'address' },
      { indexed: true, internalType: 'address', name: 'guy', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'wad', type: 'uint256' },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'dst', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'wad', type: 'uint256' },
    ],
    name: 'Deposit',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'src', type: 'address' },
      { indexed: true, internalType: 'address', name: 'dst', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'wad', type: 'uint256' },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'src', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'wad', type: 'uint256' },
    ],
    name: 'Withdrawal',
    type: 'event',
  },
  { payable: true, stateMutability: 'payable', type: 'fallback' },
  {
    constant: true,
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'guy', type: 'address' },
      { internalType: 'uint256', name: 'wad', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [],
    name: 'deposit',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'dst', type: 'address' },
      { internalType: 'uint256', name: 'wad', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { internalType: 'address', name: 'src', type: 'address' },
      { internalType: 'address', name: 'dst', type: 'address' },
      { internalType: 'uint256', name: 'wad', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: false,
    inputs: [{ internalType: 'uint256', name: 'wad', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const swapAbi = [
  {
    inputs: [
      {
        internalType: 'contract ISwapRouter',
        name: '_swapRouter',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'USDC',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'WETH9',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'poolFee',
    outputs: [
      {
        internalType: 'uint24',
        name: '',
        type: 'uint24',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amountIn',
        type: 'uint256',
      },
    ],
    name: 'swapExactInputSingle',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountOut',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'swapRouter',
    outputs: [
      {
        internalType: 'contract ISwapRouter',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export const daiAbi = [
  {
    inputs: [
      { internalType: 'address', name: '_bridge', type: 'address' },
      { internalType: 'address', name: '_remoteToken', type: 'address' },
      { internalType: 'string', name: '_name', type: 'string' },
      { internalType: 'string', name: '_symbol', type: 'string' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Burn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Mint',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [],
    name: 'BRIDGE',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'REMOTE_TOKEN',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'bridge',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_from', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
    ],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'subtractedValue', type: 'uint256' },
    ],
    name: 'decreaseAllowance',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'addedValue', type: 'uint256' },
    ],
    name: 'increaseAllowance',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'l1Token',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'l2Bridge',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'remoteToken',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes4', name: '_interfaceId', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export const swapBytecode =
  '0x60a060405234801561001057600080fd5b50604051610c57380380610c57833981810160405281019061003291906100e1565b8073ffffffffffffffffffffffffffffffffffffffff1660808173ffffffffffffffffffffffffffffffffffffffff16815250505061010e565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061009c82610071565b9050919050565b60006100ae82610091565b9050919050565b6100be816100a3565b81146100c957600080fd5b50565b6000815190506100db816100b5565b92915050565b6000602082840312156100f7576100f661006c565b5b6000610105848285016100cc565b91505092915050565b608051610b206101376000396000818161015e0152818161024c01526103080152610b206000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c8063089fe6aa1461005c5780634aa4a4fc1461007a57806373bd43ad1461009857806389a30271146100c8578063c31c9c07146100e6575b600080fd5b610064610104565b60405161007191906105f5565b60405180910390f35b61008261010a565b60405161008f9190610651565b60405180910390f35b6100b260048036038101906100ad91906106a7565b610122565b6040516100bf91906106e3565b60405180910390f35b6100d06102ee565b6040516100dd9190610651565b60405180910390f35b6100ee610306565b6040516100fb919061075d565b60405180910390f35b610bb881565b73420000000000000000000000000000000000000681565b600061014473833589fcd6edb6e08f4c7c32d4f71b54bda0291333308561032a565b61018373833589fcd6edb6e08f4c7c32d4f71b54bda029137f000000000000000000000000000000000000000000000000000000000000000084610482565b600060405180610100016040528073833589fcd6edb6e08f4c7c32d4f71b54bda0291373ffffffffffffffffffffffffffffffffffffffff16815260200173420000000000000000000000000000000000000673ffffffffffffffffffffffffffffffffffffffff168152602001610bb862ffffff1681526020013373ffffffffffffffffffffffffffffffffffffffff16815260200142815260200184815260200160008152602001600073ffffffffffffffffffffffffffffffffffffffff1681525090507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663414bf389826040518263ffffffff1660e01b81526004016102a39190610856565b6020604051808303816000875af11580156102c2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102e69190610887565b915050919050565b73833589fcd6edb6e08f4c7c32d4f71b54bda0291381565b7f000000000000000000000000000000000000000000000000000000000000000081565b6000808573ffffffffffffffffffffffffffffffffffffffff166323b872dd60e01b868686604051602401610361939291906108b4565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040516103cb919061095c565b6000604051808303816000865af19150503d8060008114610408576040519150601f19603f3d011682016040523d82523d6000602084013e61040d565b606091505b509150915081801561043b575060008151148061043a57508080602001905181019061043991906109ab565b5b5b61047a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161047190610a35565b60405180910390fd5b505050505050565b6000808473ffffffffffffffffffffffffffffffffffffffff1663095ea7b360e01b85856040516024016104b7929190610a55565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050604051610521919061095c565b6000604051808303816000865af19150503d806000811461055e576040519150601f19603f3d011682016040523d82523d6000602084013e610563565b606091505b5091509150818015610591575060008151148061059057508080602001905181019061058f91906109ab565b5b5b6105d0576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105c790610aca565b60405180910390fd5b5050505050565b600062ffffff82169050919050565b6105ef816105d7565b82525050565b600060208201905061060a60008301846105e6565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061063b82610610565b9050919050565b61064b81610630565b82525050565b60006020820190506106666000830184610642565b92915050565b600080fd5b6000819050919050565b61068481610671565b811461068f57600080fd5b50565b6000813590506106a18161067b565b92915050565b6000602082840312156106bd576106bc61066c565b5b60006106cb84828501610692565b91505092915050565b6106dd81610671565b82525050565b60006020820190506106f860008301846106d4565b92915050565b6000819050919050565b600061072361071e61071984610610565b6106fe565b610610565b9050919050565b600061073582610708565b9050919050565b60006107478261072a565b9050919050565b6107578161073c565b82525050565b6000602082019050610772600083018461074e565b92915050565b61078181610630565b82525050565b610790816105d7565b82525050565b61079f81610671565b82525050565b6107ae81610610565b82525050565b610100820160008201516107cb6000850182610778565b5060208201516107de6020850182610778565b5060408201516107f16040850182610787565b5060608201516108046060850182610778565b5060808201516108176080850182610796565b5060a082015161082a60a0850182610796565b5060c082015161083d60c0850182610796565b5060e082015161085060e08501826107a5565b50505050565b60006101008201905061086c60008301846107b4565b92915050565b6000815190506108818161067b565b92915050565b60006020828403121561089d5761089c61066c565b5b60006108ab84828501610872565b91505092915050565b60006060820190506108c96000830186610642565b6108d66020830185610642565b6108e360408301846106d4565b949350505050565b600081519050919050565b600081905092915050565b60005b8381101561091f578082015181840152602081019050610904565b60008484015250505050565b6000610936826108eb565b61094081856108f6565b9350610950818560208601610901565b80840191505092915050565b6000610968828461092b565b915081905092915050565b60008115159050919050565b61098881610973565b811461099357600080fd5b50565b6000815190506109a58161097f565b92915050565b6000602082840312156109c1576109c061066c565b5b60006109cf84828501610996565b91505092915050565b600082825260208201905092915050565b7f5354460000000000000000000000000000000000000000000000000000000000600082015250565b6000610a1f6003836109d8565b9150610a2a826109e9565b602082019050919050565b60006020820190508181036000830152610a4e81610a12565b9050919050565b6000604082019050610a6a6000830185610642565b610a7760208301846106d4565b9392505050565b7f5341000000000000000000000000000000000000000000000000000000000000600082015250565b6000610ab46002836109d8565b9150610abf82610a7e565b602082019050919050565b60006020820190508181036000830152610ae381610aa7565b905091905056fea26469706673582212203b38093a9e902e05fb31a7e0888aac250e6816087089c5426a74d604c54df41f64736f6c63430008180033';

export const permit2Abi = [
  {
    inputs: [{ internalType: 'uint256', name: 'deadline', type: 'uint256' }],
    name: 'AllowanceExpired',
    type: 'error',
  },
  { inputs: [], name: 'ExcessiveInvalidation', type: 'error' },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'InsufficientAllowance',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'maxAmount', type: 'uint256' }],
    name: 'InvalidAmount',
    type: 'error',
  },
  { inputs: [], name: 'InvalidContractSignature', type: 'error' },
  { inputs: [], name: 'InvalidNonce', type: 'error' },
  { inputs: [], name: 'InvalidSignature', type: 'error' },
  { inputs: [], name: 'InvalidSignatureLength', type: 'error' },
  { inputs: [], name: 'InvalidSigner', type: 'error' },
  { inputs: [], name: 'LengthMismatch', type: 'error' },
  {
    inputs: [
      { internalType: 'uint256', name: 'signatureDeadline', type: 'uint256' },
    ],
    name: 'SignatureExpired',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint160',
        name: 'amount',
        type: 'uint160',
      },
      {
        indexed: false,
        internalType: 'uint48',
        name: 'expiration',
        type: 'uint48',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
    ],
    name: 'Lockdown',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint48',
        name: 'newNonce',
        type: 'uint48',
      },
      {
        indexed: false,
        internalType: 'uint48',
        name: 'oldNonce',
        type: 'uint48',
      },
    ],
    name: 'NonceInvalidation',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint160',
        name: 'amount',
        type: 'uint160',
      },
      {
        indexed: false,
        internalType: 'uint48',
        name: 'expiration',
        type: 'uint48',
      },
      {
        indexed: false,
        internalType: 'uint48',
        name: 'nonce',
        type: 'uint48',
      },
    ],
    name: 'Permit',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'word',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'mask',
        type: 'uint256',
      },
    ],
    name: 'UnorderedNonceInvalidation',
    type: 'event',
  },
  {
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'allowance',
    outputs: [
      { internalType: 'uint160', name: 'amount', type: 'uint160' },
      { internalType: 'uint48', name: 'expiration', type: 'uint48' },
      { internalType: 'uint48', name: 'nonce', type: 'uint48' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint160', name: 'amount', type: 'uint160' },
      { internalType: 'uint48', name: 'expiration', type: 'uint48' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint48', name: 'newNonce', type: 'uint48' },
    ],
    name: 'invalidateNonces',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'wordPos', type: 'uint256' },
      { internalType: 'uint256', name: 'mask', type: 'uint256' },
    ],
    name: 'invalidateUnorderedNonces',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'token', type: 'address' },
          { internalType: 'address', name: 'spender', type: 'address' },
        ],
        internalType: 'struct IAllowanceTransfer.TokenSpenderPair[]',
        name: 'approvals',
        type: 'tuple[]',
      },
    ],
    name: 'lockdown',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'nonceBitmap',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      {
        components: [
          {
            components: [
              { internalType: 'address', name: 'token', type: 'address' },
              { internalType: 'uint160', name: 'amount', type: 'uint160' },
              { internalType: 'uint48', name: 'expiration', type: 'uint48' },
              { internalType: 'uint48', name: 'nonce', type: 'uint48' },
            ],
            internalType: 'struct IAllowanceTransfer.PermitDetails[]',
            name: 'details',
            type: 'tuple[]',
          },
          { internalType: 'address', name: 'spender', type: 'address' },
          { internalType: 'uint256', name: 'sigDeadline', type: 'uint256' },
        ],
        internalType: 'struct IAllowanceTransfer.PermitBatch',
        name: 'permitBatch',
        type: 'tuple',
      },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      {
        components: [
          {
            components: [
              { internalType: 'address', name: 'token', type: 'address' },
              { internalType: 'uint160', name: 'amount', type: 'uint160' },
              { internalType: 'uint48', name: 'expiration', type: 'uint48' },
              { internalType: 'uint48', name: 'nonce', type: 'uint48' },
            ],
            internalType: 'struct IAllowanceTransfer.PermitDetails',
            name: 'details',
            type: 'tuple',
          },
          { internalType: 'address', name: 'spender', type: 'address' },
          { internalType: 'uint256', name: 'sigDeadline', type: 'uint256' },
        ],
        internalType: 'struct IAllowanceTransfer.PermitSingle',
        name: 'permitSingle',
        type: 'tuple',
      },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: 'address', name: 'token', type: 'address' },
              { internalType: 'uint256', name: 'amount', type: 'uint256' },
            ],
            internalType: 'struct ISignatureTransfer.TokenPermissions',
            name: 'permitted',
            type: 'tuple',
          },
          { internalType: 'uint256', name: 'nonce', type: 'uint256' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
        ],
        internalType: 'struct ISignatureTransfer.PermitTransferFrom',
        name: 'permit',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'address', name: 'to', type: 'address' },
          {
            internalType: 'uint256',
            name: 'requestedAmount',
            type: 'uint256',
          },
        ],
        internalType: 'struct ISignatureTransfer.SignatureTransferDetails',
        name: 'transferDetails',
        type: 'tuple',
      },
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'permitTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: 'address', name: 'token', type: 'address' },
              { internalType: 'uint256', name: 'amount', type: 'uint256' },
            ],
            internalType: 'struct ISignatureTransfer.TokenPermissions[]',
            name: 'permitted',
            type: 'tuple[]',
          },
          { internalType: 'uint256', name: 'nonce', type: 'uint256' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
        ],
        internalType: 'struct ISignatureTransfer.PermitBatchTransferFrom',
        name: 'permit',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'address', name: 'to', type: 'address' },
          {
            internalType: 'uint256',
            name: 'requestedAmount',
            type: 'uint256',
          },
        ],
        internalType: 'struct ISignatureTransfer.SignatureTransferDetails[]',
        name: 'transferDetails',
        type: 'tuple[]',
      },
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'permitTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: 'address', name: 'token', type: 'address' },
              { internalType: 'uint256', name: 'amount', type: 'uint256' },
            ],
            internalType: 'struct ISignatureTransfer.TokenPermissions',
            name: 'permitted',
            type: 'tuple',
          },
          { internalType: 'uint256', name: 'nonce', type: 'uint256' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
        ],
        internalType: 'struct ISignatureTransfer.PermitTransferFrom',
        name: 'permit',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'address', name: 'to', type: 'address' },
          {
            internalType: 'uint256',
            name: 'requestedAmount',
            type: 'uint256',
          },
        ],
        internalType: 'struct ISignatureTransfer.SignatureTransferDetails',
        name: 'transferDetails',
        type: 'tuple',
      },
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'bytes32', name: 'witness', type: 'bytes32' },
      { internalType: 'string', name: 'witnessTypeString', type: 'string' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'permitWitnessTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: 'address', name: 'token', type: 'address' },
              { internalType: 'uint256', name: 'amount', type: 'uint256' },
            ],
            internalType: 'struct ISignatureTransfer.TokenPermissions[]',
            name: 'permitted',
            type: 'tuple[]',
          },
          { internalType: 'uint256', name: 'nonce', type: 'uint256' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
        ],
        internalType: 'struct ISignatureTransfer.PermitBatchTransferFrom',
        name: 'permit',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'address', name: 'to', type: 'address' },
          {
            internalType: 'uint256',
            name: 'requestedAmount',
            type: 'uint256',
          },
        ],
        internalType: 'struct ISignatureTransfer.SignatureTransferDetails[]',
        name: 'transferDetails',
        type: 'tuple[]',
      },
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'bytes32', name: 'witness', type: 'bytes32' },
      { internalType: 'string', name: 'witnessTypeString', type: 'string' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'permitWitnessTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'from', type: 'address' },
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'uint160', name: 'amount', type: 'uint160' },
          { internalType: 'address', name: 'token', type: 'address' },
        ],
        internalType: 'struct IAllowanceTransfer.AllowanceTransferDetails[]',
        name: 'transferDetails',
        type: 'tuple[]',
      },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint160', name: 'amount', type: 'uint160' },
      { internalType: 'address', name: 'token', type: 'address' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
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
