import { NetworkNumber } from '@defisaver/positions-sdk';
import { Client } from 'viem';
import Dec from 'decimal.js';
import dfs, { Action } from '@defisaver/sdk';
import { getAssetInfo } from '@defisaver/tokens';
import { useMorphoBlueForFl } from './morpho';
import { useBalancerForFl } from './balancer';
import { useAaveV3ForFl } from './aaveV3';
import { FlashloanSource } from '../types';
import { ZERO_ADDRESS } from '../constants';

const flProtocolFor = async (
  amount: string | number, asset: string, network: NetworkNumber, provider: Client,
): Promise<FlashloanSource> => {
  if (await useMorphoBlueForFl(amount, asset, network, provider)) {
    return FlashloanSource.MORPHO;
  }

  if (await useBalancerForFl(amount, asset, network, provider)) {
    return FlashloanSource.BALANCER;
  }
  if (await useAaveV3ForFl(amount, asset, network, provider)) {
    return FlashloanSource.AAVE_V3;
  }

  return FlashloanSource.NONE;
};

export const flProtocolAndFeeFor = async (
  amount: string | number,
  asset: string,
  network: NetworkNumber,
  provider: Client,
): Promise<{
  protocol: FlashloanSource,
  feeMultiplier: string,
  flFee: string
}> => {
  const protocol = await flProtocolFor(amount, asset, network, provider);
  if (protocol === FlashloanSource.NONE) {
    return {
      protocol, feeMultiplier: '1', flFee: '0',
    };
  }

  const feeToProtocol: Record<string, string> = {
    [FlashloanSource.AAVE_V3]: '1.0005',
  };
  const feeMultiplier = feeToProtocol[protocol] || '1';
  const flFee = new Dec(feeMultiplier).minus(1).times(100).toString();

  return {
    protocol, feeMultiplier, flFee,
  };
};

export const getFLAction = (
  protocol: FlashloanSource, amount: string, asset: string,
): { FLAction: Action, paybackAddress: string, feeMultiplier: string } => {
  let FLAction;
  let feeMultiplier = '1';
  const paybackAddress = dfs.actionAddresses().FLAction as string;
  switch (protocol) {
    case FlashloanSource.AAVE_V3: {
      FLAction = new dfs.actions.flashloan.FLAction(
        new dfs.actions.flashloan.AaveV3FlashLoanAction([getAssetInfo(asset).address], [amount], ['0'], ZERO_ADDRESS, ZERO_ADDRESS, []),
      );
      feeMultiplier = '1.0005';
      break;
    }
    case FlashloanSource.BALANCER: {
      FLAction = new dfs.actions.flashloan.FLAction(
        new dfs.actions.flashloan.BalancerFlashLoanAction([getAssetInfo(asset).address], [amount], ZERO_ADDRESS, []),
      );
      break;
    }
    case FlashloanSource.MORPHO: {
      FLAction = new dfs.actions.flashloan.FLAction(
        new dfs.actions.flashloan.MorphoBlueFlashLoanAction(getAssetInfo(asset).address, amount),
      );
      break;
    }
    default:
      throw new Error('Unknown FL Action');
  }

  return { FLAction, paybackAddress, feeMultiplier };
};