import {
  helpers, markets, morphoBlue, MorphoBlueVersions, NetworkNumber,
} from '@defisaver/positions-sdk';
import Dec from 'decimal.js';
import { assetAmountInEth } from '@defisaver/tokens';
import {
  AssetData, MarketData, SupportedMarkets,
} from '../types';
import { getViemProvider } from '../services/viem';

const getMaxLeverage = (collateralFactor: string) => new Dec(1)
  .div(new Dec(1).sub(collateralFactor))
  .toDP(2).toString();

const scaleMaxLeverage = (leverage: number) => leverage * 0.9;

const getLevApy = (leverage: number, supplyAsset: AssetData, borrowAsset: AssetData) => {
  const supplyRate = new Dec(supplyAsset.supplyRate).add(supplyAsset.supplyIncentives.reduce((acc, curr) => acc.add(curr.apy), new Dec(0)));
  const borrowRate = new Dec(borrowAsset.borrowRate).add(borrowAsset.borrowIncentives.reduce((acc, curr) => acc.add(curr.apy), new Dec(0)));

  return new Dec(leverage).mul(supplyRate)
    .sub(new Dec(leverage).sub(1).mul(borrowRate))
    .toDP(4)
    .toString();
};

const formatAssetsData = (assetsData: Record<string, any>): Record<string, AssetData> => {
  const formattedData: Record<string, any> = {};
  Object.entries(assetsData).forEach(([assetSymbol, assetData]) => {
    formattedData[assetSymbol] = {
      symbol: assetData.symbol,
      address: assetData.address,
      supplyRate: assetData.supplyRate,
      borrowRate: assetData.borrowRate,
      supplyIncentives: assetData.supplyIncentives,
      borrowIncentives: assetData.borrowIncentives,
      isDebtAsset: assetData.canBeBorrowed,
    };
  });
  return formattedData;
};

export const getMorphoMarketData = async (market: SupportedMarkets, rpcUrl: string, network: NetworkNumber): Promise<MarketData> => {
  const provider = getViemProvider(rpcUrl, network);

  const morphoMarket = markets.MorphoBlueMarkets(network)[MorphoBlueVersions.MorphoBlueSUSDeUSDtb_915];
  const [marketData, { reallocatableLiquidity: availableLiquidityWei }] = await Promise.all([
    morphoBlue._getMorphoBlueMarketData(provider, network, morphoMarket),
    helpers.morphoBlueHelpers.getReallocatableLiquidity(morphoMarket.marketId, network),
  ]);
  const maxLeverageFactor = getMaxLeverage(marketData.lltv);
  const scaledMaxLeverage = scaleMaxLeverage(parseFloat(maxLeverageFactor));
  const assetsData = formatAssetsData(marketData.assetsData);

  const availableLiquidity = assetAmountInEth(availableLiquidityWei, 'USDtb');
  const leftToBorrowGlobal = new Dec(marketData.assetsData.USDtb.totalSupply || '0').sub(marketData.assetsData.USDtb.totalBorrow || '0').toString();
  const leftToBorrowGlobalAdjusted = new Dec(availableLiquidity).add(leftToBorrowGlobal).toString();

  return {
    market,
    maxLeverage: scaledMaxLeverage,
    assetsData,
    maxApy: getLevApy(scaledMaxLeverage, assetsData.sUSDe, assetsData.USDtb),
    leftToBorrowGlobal: leftToBorrowGlobalAdjusted,
    lltv: marketData.lltv,
    rate: marketData.oracle,
  };
};

export const getMorphoNetApy = (marketData: MarketData, leverage: number) => {
  const supplyAsset = Object.values(marketData.assetsData).find((asset) => !asset.isDebtAsset);
  const borrowAsset = Object.values(marketData.assetsData).find((asset) => asset.isDebtAsset);

  return getLevApy(leverage, supplyAsset!, borrowAsset!);
};
