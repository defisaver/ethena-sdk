import { assetAmountInWei, getAssetInfo } from '@defisaver/tokens';
import { encodeFunctionData } from 'viem';
import { getERC20Contract } from '../contracts';
import { getViemProvider } from '../services/viem';
import { NetworkNumber, SupportedMarkets } from '../types';
import { getMorphoRequests } from './morpho';

export const getRequests = async (market: SupportedMarkets, userAddress: string, rpcUrl: string, network: NetworkNumber) => {
  switch (market) {
    case SupportedMarkets.MorphoBlueSUSDeUSDtb_915: {
      return getMorphoRequests(userAddress, rpcUrl, network);
    }
    default:
      throw new Error(`Unsupported market: ${market}`);
  }
};

export const getApprovalTxParams = async (rpcUrl: string, network: NetworkNumber, asset: string, amount: string, spender: string, userAddress: string) => {
  const provider = getViemProvider(rpcUrl, network);
  const assetAddress = getAssetInfo(asset, network).address;
  const amountWei = assetAmountInWei(amount, asset);
  const erc20 = getERC20Contract(provider, assetAddress as `0x${string}`);

  const encodedMethod = encodeFunctionData(
    {
      abi: erc20.abi,
      functionName: 'approve',
      // @ts-ignore
      args: [spender, amountWei],
    },
  );

  const txParams = {
    from: userAddress,
    to: erc20.address,
    value: 0,
    data: encodedMethod,
    gas: 0,
  };

  return txParams;
};