import { SupportedMarkets } from '../types';
import { getMorphoRequests } from './morpho';

export const getRequests = (market: SupportedMarkets) => {
  switch (market) {
    case SupportedMarkets.MorphoBlueSUSDeUSDtb_915: {
      return getMorphoRequests();
    }
    default:
      throw new Error(`Unsupported market: ${market}`);
  }
};