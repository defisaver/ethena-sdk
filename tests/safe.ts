import 'dotenv/config';
import {
  safe, NetworkNumber,
} from '../src';

const { assert } = require('chai');


describe('Safe', () => {
  let rpcUrl: string;

  before(async () => {
    rpcUrl = process.env.RPC || '';
  });

  it('can fetch user safes', async function () {
    this.timeout(10000);
    const network = NetworkNumber.Eth;

    const safes = await safe.getSafeWallets('0x21dC459fbA0B1Ea037Cd221D35b928Be1C26141a', network);
  });

  it('can predict user safe', async function () {
    this.timeout(10000);
    const network = NetworkNumber.Eth;

    const predicted = await safe.predictSafeAddress('0x21dC459fbA0B1Ea037Cd221D35b928Be1C26141a', rpcUrl, network);
    console.log('Predicted safe address:', predicted);
  });
});
