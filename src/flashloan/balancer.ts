import Dec from 'decimal.js';
import { NetworkNumber } from '@defisaver/positions-sdk';
import { Client } from 'viem';
import { getAssetInfo } from '@defisaver/tokens';
import { getERC20Contract } from '../contracts';

const BalancerVaultAddress = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';

export const useBalancerForFl = async (
  amount: string | number,
  asset: string,
  network: NetworkNumber,
  provider: Client,
): Promise<boolean> => {
  const _address = getAssetInfo(asset, network).address;
  const contract = getERC20Contract(provider, _address as `0x${string}`);

  const availableLiq = (await contract.read.balanceOf([BalancerVaultAddress])).toString();
  return new Dec(availableLiq).gt(amount);
};