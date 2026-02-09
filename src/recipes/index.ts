import { markets, MorphoBlueVersions, NetworkNumber } from '@defisaver/positions-sdk';
import Dec from 'decimal.js';
import dfs from '@defisaver/sdk';
import { assetAmountInWei, getAssetInfoByAddress } from '@defisaver/tokens';
import { fromHex } from 'viem';

const getRSVFromSignature = (signature: string) => {
  const r = `0x${signature.slice(2, 66)}`;
  const s = `0x${signature.slice(66, 130)}`;
  const v = fromHex(`0x${signature.slice(130)}`, 'number').toString();

  return { r, s, v };
};

export const morphoBlueLevCreateRecipe = async (
  morphoVersion: MorphoBlueVersions,
  network: NetworkNumber,
  supplyAmount: string,
  debtAmount: string,
  userAddress: string,
  safeAddress: string,
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

  const recipe = new dfs.Recipe('MorphoBlueOpenRecipe', []);

  if (authSignature) {
    const { r, s, v } = getRSVFromSignature(authSignature);
    recipe.addAction(new dfs.actions.morphoblue.MorphoBlueSetAuthWithSigAction(
      userAddress,
      safeAddress,
      true,
      nonce.toString(),
      deadline.toString(),
      v,
      r,
      s,
    ));
  }

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
  recipe.addAction(
    new dfs.actions.morphoblue.MorphoBlueBorrowAction(
      morphoMarket.loanToken,
      morphoMarket.collateralToken,
      morphoMarket.oracle,
      morphoMarket.irm,
      lltvInWei,
      debtAmountWei,
      userAddress,
      userAddress,
    ));

  return recipe;
};