import { markets, MorphoBlueVersions, NetworkNumber } from '@defisaver/positions-sdk';
import Dec from 'decimal.js';
import dfs from '@defisaver/sdk';
import { assetAmountInWei, getAssetInfoByAddress } from '@defisaver/tokens';

export const morphoBlueLevCreateRecipe = async (morphoVersion: MorphoBlueVersions, network: NetworkNumber, supplyAmount: string, debtAmount: string, userAddress: string) => {
  const morphoMarket = markets.MorphoBlueMarkets(network)[morphoVersion];
  const lltvInWei = new Dec(morphoMarket.lltv).mul(1e18).toString();
  const collAsset = getAssetInfoByAddress(morphoMarket.collateralToken, network);
  const debtAsset = getAssetInfoByAddress(morphoMarket.loanToken, network);
  const supplyAmountWei = assetAmountInWei(supplyAmount, collAsset.symbol);
  const debtAmountWei = assetAmountInWei(debtAmount, debtAsset.symbol);

  const actions = [
    new dfs.actions.morphoblue.MorphoBlueSupplyCollateralAction(
      morphoMarket.loanToken,
      morphoMarket.collateralToken,
      morphoMarket.oracle,
      morphoMarket.irm,
      lltvInWei,
      supplyAmountWei,
      userAddress,
      userAddress,
    ),
    new dfs.actions.morphoblue.MorphoBlueBorrowAction(
      morphoMarket.loanToken,
      morphoMarket.collateralToken,
      morphoMarket.oracle,
      morphoMarket.irm,
      lltvInWei,
      debtAmountWei,
      userAddress,
      userAddress,
    ),
  ];

  return new dfs.Recipe('MorphoBlueOpenRecipe', actions);
};