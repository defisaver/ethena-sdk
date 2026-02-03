import { NetworkNumber } from '@defisaver/positions-sdk';
import { MarketData, PositionData, SupportedMarkets } from '../types';
import {
  getMorphoMarketData, getMorphoNetApy,
} from './morpho';

export const getMarketData = async (market: SupportedMarkets, rpcUrl: string, network: NetworkNumber): Promise<MarketData> => {
  switch (market) {
    case SupportedMarkets.MorphoBlueSUSDeUSDtb_915: {
      return getMorphoMarketData(market, rpcUrl, network);
    }
    default:
      throw new Error(`Unsupported market: ${market}`);
  }
};

export const getNetApy = (marketData: MarketData, leverage: number) => {
  switch (marketData.market) {
    case SupportedMarkets.MorphoBlueSUSDeUSDtb_915: {
      return getMorphoNetApy(marketData, leverage);
    }
    default:
      throw new Error(`Unsupported market: ${marketData.market}`);
  }
};