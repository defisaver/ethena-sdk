import {
  helpers, markets, MorphoBlueMarketData, MorphoBlueVersions, NetworkNumber,
} from '@defisaver/positions-sdk';
import Dec from 'decimal.js';
import dfs from '@defisaver/sdk';
import { assetAmountInWei, getAssetInfoByAddress } from '@defisaver/tokens';
import { fromHex } from 'viem';
import { AssetData, FlashloanSource } from '../types';
import { getFLAction } from '../flashloan';
import { getSellAction } from '../exchange';

const getRSVFromSignature = (signature: string) => {
  const r = `0x${signature.slice(2, 66)}`;
  const s = `0x${signature.slice(66, 130)}`;
  const v = fromHex(`0x${signature.slice(130)}`, 'number').toString();

  return { r, s, v };
};

const getReallocateAction = async (
  amountToBorrow: string,
  morphoMarket: MorphoBlueMarketData,
  assetsData: Record<string, any>,
  lltvInWei: string,
  network: NetworkNumber,
) => {
  const { vaults, withdrawals } = await helpers.morphoBlueHelpers.getReallocation(morphoMarket, assetsData, amountToBorrow, network);
  if (vaults.length === 0) return null;
  return new dfs.actions.morphoblue.MorphoBlueReallocateLiquidityAction(
    morphoMarket.loanToken,
    morphoMarket.collateralToken,
    morphoMarket.oracle,
    morphoMarket.irm,
    lltvInWei,
    vaults,
    withdrawals,
  );
};

export const morphoBlueLevCreateRecipe = async (
  morphoVersion: MorphoBlueVersions,
  assetsData: Record<string, AssetData>,
  network: NetworkNumber,
  supplyAmount: string,
  debtAmount: string,
  userAddress: string,
  safeAddress: string,
  minPrice: string,
  useFlashloan: boolean,
  flProtocol: FlashloanSource,
  usePublicAllocator: boolean,
  authSignature: string,
  deadline: number,
  nonce: number,
) => {
  const morphoMarket = markets.MorphoBlueMarkets(network)[morphoVersion];
  const lltvInWei = new Dec(morphoMarket.lltv).mul(1e18).toString();
  const collAsset = getAssetInfoByAddress(morphoMarket.collateralToken, network);
  const debtAsset = getAssetInfoByAddress(morphoMarket.loanToken, network);
  const supplyAmountWei = assetAmountInWei(supplyAmount, collAsset.symbol);
  const debtAmountWei = assetAmountInWei(debtAmount, debtAsset.symbol);

  const recipe = new dfs.Recipe('MorphoBlueEOALeveragedOpenRecipe', []);

  let authAction = null;
  if (authSignature) {
    const { r, s, v } = getRSVFromSignature(authSignature);
    authAction = new dfs.actions.morphoblue.MorphoBlueSetAuthWithSigAction(
      userAddress,
      safeAddress,
      true,
      nonce.toString(),
      deadline.toString(),
      v,
      r,
      s,
    );
  }


  let ReallocateAction = null;
  if (usePublicAllocator) ReallocateAction = await getReallocateAction(debtAmountWei, morphoMarket, assetsData, lltvInWei, network);

  if (useFlashloan) {
    if (flProtocol === FlashloanSource.NONE) throw new Error('Cannot create Morpho position, flashloan not available.');
    const { FLAction, paybackAddress } = getFLAction(flProtocol, debtAmountWei, debtAsset.symbol);
    recipe.addAction(FLAction);
    if (authAction) recipe.addAction(authAction);

    if (ReallocateAction !== null) recipe.addAction(ReallocateAction);
    recipe.addAction(new dfs.actions.basic.PullTokenAction(collAsset.address, userAddress, supplyAmountWei));
    const sellAction = await getSellAction(debtAsset.symbol, collAsset.symbol, debtAmount, userAddress, minPrice, safeAddress, safeAddress, network);
    recipe.addAction(sellAction);

    recipe.addAction(new dfs.actions.basic.SumInputsAction(supplyAmountWei, `$${recipe.actions.length}`));
    recipe.addAction(new dfs.actions.morphoblue.MorphoBlueSupplyCollateralAction(
      morphoMarket.loanToken,
      morphoMarket.collateralToken,
      morphoMarket.oracle,
      morphoMarket.irm,
      lltvInWei,
      `$${recipe.actions.length}`,
      safeAddress,
      userAddress,
    ));
    recipe.addAction(new dfs.actions.morphoblue.MorphoBlueBorrowAction(
      morphoMarket.loanToken,
      morphoMarket.collateralToken,
      morphoMarket.oracle,
      morphoMarket.irm,
      lltvInWei,
      '$1',
      userAddress,
      paybackAddress,
    ));
  } else {
    if (ReallocateAction !== null) recipe.addAction(ReallocateAction);
    recipe.addAction(new dfs.actions.morphoblue.MorphoBlueSupplyCollateralAction(
      morphoMarket.loanToken,
      morphoMarket.collateralToken,
      morphoMarket.oracle,
      morphoMarket.irm,
      lltvInWei,
      supplyAmountWei,
      userAddress,
      userAddress,
    ));
    recipe.addAction(new dfs.actions.morphoblue.MorphoBlueBorrowAction(
      morphoMarket.loanToken,
      morphoMarket.collateralToken,
      morphoMarket.oracle,
      morphoMarket.irm,
      lltvInWei,
      debtAmountWei,
      userAddress,
      safeAddress,
    ));

    const sellAction = await getSellAction(debtAsset.symbol, collAsset.symbol, debtAmount, userAddress, minPrice, safeAddress, safeAddress, network);
    recipe.addAction(sellAction);

    recipe.addAction(new dfs.actions.morphoblue.MorphoBlueSupplyCollateralAction(
      morphoMarket.loanToken,
      morphoMarket.collateralToken,
      morphoMarket.oracle,
      morphoMarket.irm,
      lltvInWei,
      `$${recipe.actions.length}`,
      safeAddress,
      userAddress,
    ));
  }

  return recipe;
};