import 'dotenv/config';

import { MorphoBlueVersions } from '@defisaver/positions-sdk';
import {
  NetworkNumber,
  SupportedMarkets,
  execution,
} from '../src';

const { assert } = require('chai');


describe('Execution', () => {
  let rpcUrl: string;

  before(async () => {
    rpcUrl = process.env.RPC || '';
  });

  it('can fetch morpho requests', async function () {
    this.timeout(10000);
    const network = NetworkNumber.Eth;
    const userAddress = '0x21dC459fbA0B1Ea037Cd221D35b928Be1C26141a';

    const { requests: { authRequest, createAndExecuteRequest }, recipe, safeAddress } = await execution.getRequests(SupportedMarkets.MorphoBlueSUSDeUSDtb_915, userAddress, rpcUrl, network);

    const response = await authRequest.getParams({
      rpcUrl, network, userAddress, safeAddress,
    });
    const response2 = await createAndExecuteRequest.getParams({
      rpcUrl, network, userAddress, safeAddress, recipeGetter: () => recipe(MorphoBlueVersions.MorphoBlueSUSDeUSDtb_915, network, '100', userAddress),
    });

    console.log('Auth request params:', response2);
  });
});
