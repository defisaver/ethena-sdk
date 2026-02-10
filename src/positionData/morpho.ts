import Dec from 'decimal.js';
import { assetAmountInEth, assetAmountInWei, getAssetInfo } from '@defisaver/tokens';
import {
  helpers, markets, MMUsedAssets, morphoBlue, MorphoBlueVersions, NetworkNumber,
} from '@defisaver/positions-sdk';
import {
  AssetData, FlashloanSource, MarketData, PositionData,
} from '../types';
import { getViemProvider } from '../services/viem';
import { getBestPrice } from '../exchange';
import { flProtocolAndFeeFor } from '../flashloan';
import { addToObjectIf } from '../services/utils';

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
    rate: oracle, assetsData, lltv,
  } = marketData;
  const supplyAsset: AssetData = Object.values(assetsData).find((asset) => !asset.isDebtAsset)!;
  const borrowAsset: AssetData = Object.values(assetsData).find((asset) => asset.isDebtAsset)!;
  const debtAmount = new Dec(leverage)
    .times(supplyAmount).minus(supplyAmount).times(oracle)
    .toString();
  const suppliedInDebtAsset = new Dec(supplyAmount).times(oracle).toString();
  const borrowLimit = new Dec(suppliedInDebtAsset).mul(lltv).toString();
  const useFlashloan = new Dec(borrowLimit).lte(debtAmount);

  const debtAmountWei = assetAmountInWei(debtAmount, borrowAsset.symbol);
  const [
    { priceWithFee, source },
    { protocol: flProtocol, feeMultiplier, flFee },
    { reallocatableLiquidity, targetBorrowUtilization },
    morphoMarketData,
  ] = await Promise.all([
    getBestPrice(borrowAsset.symbol, supplyAsset.symbol, debtAmountWei, userAddress, network),
    useFlashloan ? flProtocolAndFeeFor(debtAmount, borrowAsset.symbol, network, provider) : Promise.resolve({ protocol: FlashloanSource.NONE, feeMultiplier: '1', flFee: '0' }),
    helpers.morphoBlueHelpers.getReallocatableLiquidity(morphoMarket.marketId, network),
    morphoBlue._getMorphoBlueMarketData(provider, network, morphoMarket),
  ]);

  const { totalSupply, totalBorrow } = morphoMarketData.assetsData[borrowAsset.symbol];
  const totalSupplyInWei = assetAmountInWei(totalSupply || '0', borrowAsset.symbol);
  const totalBorrowInWei = assetAmountInWei(totalBorrow || '0', borrowAsset.symbol);
  const liquidityToAllocateInWei = helpers.morphoBlueHelpers.getLiquidityToAllocate(debtAmountWei, totalBorrowInWei, totalSupplyInWei, targetBorrowUtilization, reallocatableLiquidity);
  const liquidityToAllocate = assetAmountInEth(liquidityToAllocateInWei, borrowAsset.symbol);

  const leveragedAmount = new Dec(debtAmount).times(priceWithFee);
  const collIncrease = new Dec(supplyAmount).plus(leveragedAmount).toString();

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

  let borrowRate;
  let supplyRate;

  try {
    const actions = [
      {
        action: 'borrow',
        amount: debtAmount,
        asset: borrowAsset.symbol,
      },
      {
        action: 'collateral',
        amount: liquidityToAllocate,
        asset: borrowAsset.symbol,
      },
    ];
    const { borrowRate: _borrowRate, supplyRate: _supplyRate } = await helpers.morphoBlueHelpers.getApyAfterValuesEstimation(
      morphoMarket,
      actions,
      provider,
      network,
    );
    borrowRate = _borrowRate;
    supplyRate = _supplyRate;
  } catch (e) {
    console.error('Error getting APY after values estimation', e);
  }

  const afterAssetsData = {
    ...morphoMarketData.assetsData,
    [borrowAsset.symbol]: {
      ...morphoMarketData.assetsData[borrowAsset.symbol],
      totalBorrow: new Dec(morphoMarketData.assetsData[borrowAsset.symbol].totalBorrow || '0').add(debtAmount).toString(),
      ...addToObjectIf(!!supplyRate, { supplyRate }),
      ...addToObjectIf(!!borrowRate, { borrowRate }),
    },
  };

  const aggregatedPosition = helpers.morphoBlueHelpers.getMorphoBlueAggregatedPositionData({ usedAssets, assetsData: afterAssetsData, marketInfo: morphoMarketData });
  return {
    flashloanInfo: {
      protocol: flProtocol,
      useFlashloan,
      feeMultiplier,
      flFee,
    },
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