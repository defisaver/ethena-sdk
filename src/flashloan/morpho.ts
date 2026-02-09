import { NetworkNumber } from '@defisaver/positions-sdk';
import { assetAmountInEth, getAssetInfo } from '@defisaver/tokens';
import Dec from 'decimal.js';
import { Client } from 'viem';
import { getConfigContractAddress, getERC20Contract } from '../contracts';

const getAvailableLiqForAsset = async (asset: string, network: NetworkNumber, provider: Client) => {
  const _address = getAssetInfo(asset).address;

  const contract = getERC20Contract(provider, _address as `0x${string}`);
  const morphoFactoryAddress = getConfigContractAddress('MorphoManager', network);

  const availableLiquidity = await contract.read.balanceOf([morphoFactoryAddress]);

  return assetAmountInEth(availableLiquidity.toString(), asset);
};

export const useMorphoBlueForFl = async (
  amount: string | number,
  asset: string,
  network: NetworkNumber,
  provider: Client,
): Promise<boolean> => {
  const availableLiq = await getAvailableLiqForAsset(asset, network, provider);

  return new Dec(availableLiq).gt(amount);
};