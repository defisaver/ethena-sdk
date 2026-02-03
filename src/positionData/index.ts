import {
  MarketData, NetworkNumber, PositionData, SupportedMarkets,
} from '../types';
import { getMorphoMaxLeverageForSupplyAmount, getMorphoResultingPosition } from './morpho';

export const getMaxLeverageForSupplyAmount = (marketData: MarketData, supplyAmount: string) => {
  switch (marketData.market) {
    case SupportedMarkets.MorphoBlueSUSDeUSDtb_915: {
      return getMorphoMaxLeverageForSupplyAmount(marketData, supplyAmount);
    }
    default:
      throw new Error(`Unsupported market: ${marketData.market}`);
  }
};

export const getResultingPosition = async (marketData: MarketData, supplyAmount: string, leverage: number, rpcUrl: string, network: NetworkNumber): Promise<PositionData> => {
  switch (marketData.market) {
    case SupportedMarkets.MorphoBlueSUSDeUSDtb_915: {
      return getMorphoResultingPosition(marketData, supplyAmount, leverage, rpcUrl, network);
    }
    default:
      throw new Error(`Unsupported market: ${marketData.market}`);
  }
};