import Dec from 'decimal.js';
import { assetAmountInWei, getAssetInfo } from '@defisaver/tokens';
import {
  helpers, markets, MMUsedAssets, morphoBlue, MorphoBlueVersions, NetworkNumber,
} from '@defisaver/positions-sdk';
import { AssetData, MarketData, PositionData } from '../types';
import { getViemProvider } from '../services/viem';
import { getBestPrice } from '../exchange';

const getMaxBoostUsd = (lltv: string, borrowLimit: string, debt: string, targetRatio = 1.01, bufferPercent = 1) => new Dec(targetRatio).mul(debt).sub(borrowLimit)
  .div(new Dec(lltv).sub(targetRatio).toString())
  .mul((100 - bufferPercent) / 100)
  .toString();

const getMorphoMaxLeverageBorrow = (marketData: MarketData, supplyAmount: string) => {
  const {
    lltv, rate: oracle, assetsData, leftToBorrowGlobal,
  } = marketData;

  const borrowAsset = Object.values(assetsData).find((asset) => asset.isDebtAsset);

  const maxBorrow = new Dec(supplyAmount).mul(oracle).mul(lltv).toString();

  const maxBoost = getMaxBoostUsd(lltv, maxBorrow, '0');

  return Dec.min(Dec.max(0, maxBoost), leftToBorrowGlobal).toDP(getAssetInfo(borrowAsset?.symbol).decimals).toString();
};

export const getMorphoMaxLeverageForSupplyAmount = (marketData: MarketData, supplyAmount: string) => {
  // TODO: implement FL logic
  const feeMultiplier = 1;

  const maxDebt = new Dec(getMorphoMaxLeverageBorrow(marketData, supplyAmount)).div(feeMultiplier).toString();

  const rate = new Dec(1).div(marketData.rate).toString();

  const maxLeverage = new Dec(supplyAmount).plus(new Dec(maxDebt).times(rate)).div(supplyAmount).toNumber();

  return maxLeverage;
};

export const getMorphoResultingPosition = async (marketData: MarketData, supplyAmount: string, leverage: number, userAddress: string, rpcUrl: string, network: NetworkNumber): Promise<PositionData> => {
  const provider = getViemProvider(rpcUrl, network);

  const morphoMarket = markets.MorphoBlueMarkets(network)[MorphoBlueVersions.MorphoBlueSUSDeUSDtb_915];
  const {
    rate: oracle, assetsData,
  } = marketData;
  const supplyAsset: AssetData = Object.values(assetsData).find((asset) => !asset.isDebtAsset)!;
  const borrowAsset: AssetData = Object.values(assetsData).find((asset) => asset.isDebtAsset)!;
  const debtAmount = new Dec(leverage)
    .times(supplyAmount).minus(supplyAmount).times(oracle)
    .toString();

  const debtAmountWei = assetAmountInWei(debtAmount, borrowAsset.symbol);
  const { priceWithFee, source } = await getBestPrice(borrowAsset.symbol, supplyAsset.symbol, debtAmountWei, userAddress, network);

  const leveragedAmount = new Dec(debtAmount).times(priceWithFee);
  const collIncrease = new Dec(supplyAmount).plus(leveragedAmount).toString();

  const morphoMarketData = await morphoBlue._getMorphoBlueMarketData(provider, network, morphoMarket);
  const usedAssets: MMUsedAssets = {};

  usedAssets[borrowAsset.symbol] = {
    symbol: borrowAsset.symbol,
    supplied: '0',
    borrowed: debtAmount,
    isSupplied: false,
    isBorrowed: true,
    collateral: false,
    suppliedUsd: '0',
    borrowedUsd: new Dec(debtAmount).mul(morphoMarketData.assetsData[borrowAsset.symbol].price).toString(),
  };

  usedAssets[supplyAsset.symbol] = {
    symbol: supplyAsset.symbol,
    supplied: collIncrease,
    borrowed: '0',
    isSupplied: true,
    isBorrowed: false,
    collateral: true,
    suppliedUsd: new Dec(collIncrease).mul(morphoMarketData.assetsData[supplyAsset.symbol].price).toString(),
    borrowedUsd: '0',
  };

  const aggregatedPosition = helpers.morphoBlueHelpers.getMorphoBlueAggregatedPositionData({ usedAssets, assetsData: morphoMarketData.assetsData, marketInfo: morphoMarketData });
  return {
    exchangeInfo: {
      price: priceWithFee,
      source,
      sellAsset: borrowAsset.symbol,
      sellAmount: debtAmount,
      buyAsset: supplyAsset.symbol,
      buyAmount: leveragedAmount.toString(),
    },
    usedAssets,
    ...aggregatedPosition,
  };
};