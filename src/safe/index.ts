import { NetworkNumber } from '@defisaver/positions-sdk';
import {
  encodeFunctionData, encodePacked, getCreate2Address, keccak256,
} from 'viem';
import { Wallet } from '../types';
import {
  SAFE_API_URL, SAFE_REFUND_RECEIVER, SALT_PREFIX, ZERO_ADDRESS,
} from '../constants';
import {
  getConfigContractAbi,
  getSafeFactoryAddress, getSafeFallbackHandlerAddress, getSafeWalletSingletonAddress, SafeFactoryContract,
} from '../contracts';
import { getViemProvider } from '../services/viem';

export const getSafeWallets = async (userAddress: string, network: NetworkNumber): Promise<{ success: boolean, wallets: string[] }> => {
  try {
    const res = await fetch(`${SAFE_API_URL}/safe/all-wallets?network=${network}&account=${userAddress}`);
    const wallets = await res.json();

    const oneOneWallets = wallets
      .filter((wallet: Wallet) => wallet.type === 'Safe' && (wallet.owners || []).length === 1)
      .map((wallet: Wallet) => wallet.address);
    return { success: true, wallets: oneOneWallets };
  } catch (e) {
    return { success: false, wallets: [] };
  }
};

const getSafeSetupParams = (owners: string[], threshold: number, network: NetworkNumber) => [
  owners as `0x${string}`[],
  BigInt(threshold),
  ZERO_ADDRESS as `0x${string}`,
  '0x',
  getSafeFallbackHandlerAddress(network) as `0x${string}`,
  ZERO_ADDRESS as `0x${string}`,
  BigInt(0),
  SAFE_REFUND_RECEIVER as `0x${string}`,
];

const _predictSafeAddress = async (
  rpcUrl: string,
  network: NetworkNumber,
  setupArgs: string,
  saltNonce: string,
) => {
  const provider = getViemProvider(rpcUrl, network);
  const safeProxyFactoryAddress = getSafeFactoryAddress(network);
  const safeProxyFactoryContract = SafeFactoryContract(provider, network);
  const masterCopyAddress = getSafeWalletSingletonAddress(network);

  const proxyCreationCode = await safeProxyFactoryContract.read.proxyCreationCode();

  // @ts-ignore
  const initCodeHash = keccak256(
    encodePacked(['bytes', 'bytes'], [proxyCreationCode, masterCopyAddress.slice(2).padStart(64, '0') as `0x${string}`]), 'bytes',
  ) as string;

  const salt = keccak256(
    encodePacked(
      ['bytes', 'uint256'],
      [keccak256(setupArgs as `0x${string}`), BigInt(saltNonce)],
    ),
  );

  return getCreate2Address(
    {
      bytecodeHash: initCodeHash as `0x${string}`,
      from: safeProxyFactoryAddress,
      salt,
    },
  );
};

export const predictSafeAddress = async (owner: string, rpcUrl: string, network: NetworkNumber): Promise<string> => {
  const provider = getViemProvider(rpcUrl, network);

  const threshold = 1;
  const owners = [owner];
  const setupParams = getSafeSetupParams(owners, threshold, network);
  const setupParamsEncoded = encodeFunctionData({
    abi: getConfigContractAbi('Safe130'),
    functionName: 'setup',
    // @ts-ignore
    args: setupParams,
  });
  const oneOfOneWalletsCount = (await getSafeWallets(owner, network)).wallets.length;
  const failAfter = 10;
  for (let nonce = oneOfOneWalletsCount + 1; nonce < oneOfOneWalletsCount + failAfter + 1; nonce += 1) {
    const salt = `${SALT_PREFIX}${nonce}`;
    const predictedAddr = await _predictSafeAddress(rpcUrl, network, setupParamsEncoded, salt);
    const bytecode = await provider.getCode({ address: predictedAddr });
    if (!bytecode) {
      // safe does not exist
      return predictedAddr;
    }
  }

  return '';
};