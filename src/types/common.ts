import {
  IncentiveData, MMUsedAssets, MorphoBlueAggregatedPositionData, NetworkNumber,
} from '@defisaver/positions-sdk';
import { SupportedMarkets } from './markets';
import { OffchainExchanges } from './exchange';

export interface AssetData {
  symbol: string;
  address: string;
  supplyRate: string;
  borrowRate: string;
  supplyIncentives: IncentiveData[];
  borrowIncentives: IncentiveData[];
  isDebtAsset: boolean;
}

export interface MarketData {
  market: SupportedMarkets;
  maxLeverage: number;
  assetsData: Record<string, AssetData>;
  maxApy: string;
  leftToBorrowGlobal: string;
  lltv: string;
  rate: string;
}

export interface ExchangeInfo {
  price: string;
  source: OffchainExchanges | 'None';
  sellAsset: string;
  sellAmount: string;
  buyAsset: string;
  buyAmount: string;
}

export interface PositionData extends MorphoBlueAggregatedPositionData {
  usedAssets: MMUsedAssets;
  exchangeInfo: ExchangeInfo;
}

export {
  NetworkNumber,
  MMUsedAssets,
  IncentiveData,
};