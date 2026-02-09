import { AaveVersions, markets, NetworkNumber } from '@defisaver/positions-sdk';
import { Client } from 'viem';
import Dec from 'decimal.js';
import { assetAmountInEth, getAssetInfo } from '@defisaver/tokens';
import { AaveV3ViewContract } from '../contracts';

const getAvailableLiqForAssetV3 = async (asset: string, network: NetworkNumber, provider: Client) => {
  const market = markets.AaveMarkets(network)[AaveVersions.AaveV3];
  const _address = getAssetInfo(asset, network).address;

  const loanInfoContract = AaveV3ViewContract(provider, network);
  const marketAddress = market.providerAddress;
  const loanInfo = await loanInfoContract.read.getFullTokensInfo([marketAddress, [_address as `0x${string}`]]);

  if (!loanInfo[0].isFlashLoanEnabled) {
    return '0';
  }
  return assetAmountInEth(loanInfo[0].availableLiquidity.toString(), asset);
};

export const useAaveV3ForFl = async (
  amount: string | number,
  asset: string,
  network: NetworkNumber,
  provider: Client,
): Promise<boolean> => {
  try {
    const availableLiq = await getAvailableLiqForAssetV3(asset, network, provider);

    return new Dec(availableLiq).gt(amount);
  } catch {
    return false;
  }
};