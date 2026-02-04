import 'dotenv/config';

import {
  exchange, NetworkNumber,
} from '../src';

const { assert } = require('chai');


describe('Exchange', () => {
  let rpcUrl: string;

  before(async () => {
    rpcUrl = process.env.RPC || '';
  });

  it('can fetch exchange best price for sUSDe to USDtb', async function () {
    this.timeout(10000);
    const network = NetworkNumber.Eth;

    const price = await exchange.getBestPrice('sUSDe', 'USDtb', '10000', '0x21dC459fbA0B1Ea037Cd221D35b928Be1C26141a', network);
    console.log('Best price data:', price);
  });

  it('can fetch exchange order for sUSDe to USDtb', async function () {
    this.timeout(10000);
    const network = NetworkNumber.Eth;

    const priceData = await exchange.getBestPrice('sUSDe', 'USDtb', '10000', '0x21dC459fbA0B1Ea037Cd221D35b928Be1C26141a', network);
    const order = await exchange.getExchangeOrder('sUSDe', 'USDtb', '10000', '0x21dC459fbA0B1Ea037Cd221D35b928Be1C26141a', priceData.priceWithFee, network);
    console.log('Exchange order data:', order);
  });
});
