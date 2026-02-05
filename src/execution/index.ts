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