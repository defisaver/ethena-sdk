import 'dotenv/config';

import {
  safe, NetworkNumber,
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

    const requests = execution.getRequests(SupportedMarkets.MorphoBlueSUSDeUSDtb_915);
    console.log('Morpho requests:', requests);
    for (const req of requests) {
      const response = await req.getParams(rpcUrl, network, '0x21dC459fbA0B1Ea037Cd221D35b928Be1C26141a');
      console.log(`Response for request ${req.type}:`, response);
    }
  });
});
