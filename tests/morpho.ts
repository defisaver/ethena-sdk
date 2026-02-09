import 'dotenv/config';

import {
  marketData, NetworkNumber, positionData, SupportedMarkets,
} from '../src';

const { assert } = require('chai');


describe('Morpho', () => {
  let rpcUrl: string;

  before(async () => {
    rpcUrl = process.env.RPC || '';
  });

  it('can fetch morpho sUSDe/USDtb apy for 4x exposure', async function () {
    this.timeout(10000);
    const network = NetworkNumber.Eth;
    const selectedMarket = SupportedMarkets.MorphoBlueSUSDeUSDtb_915;

    const market = await marketData.getMarketData(selectedMarket, rpcUrl, network);
    const apy = marketData.getNetApy(market, 4);
  });

  it('can fetch morpho sUSDe/USDtb max exposure for 100000 supply', async function () {
    this.timeout(10000);
    const network = NetworkNumber.Eth;
    const selectedMarket = SupportedMarkets.MorphoBlueSUSDeUSDtb_915;

    const market = await marketData.getMarketData(selectedMarket, rpcUrl, network);
    const maxLeverage = positionData.getMaxLeverageForSupplyAmount(market, '100000');
  });

  it('can fetch morpho sUSDe/USDtb resulting position for 100000 supply and 4x exposure', async function () {
    this.timeout(10000);
    const network = NetworkNumber.Eth;
    const selectedMarket = SupportedMarkets.MorphoBlueSUSDeUSDtb_915;

    const market = await marketData.getMarketData(selectedMarket, rpcUrl, network);
    const position = await positionData.getResultingPosition(market, '100000', 4, '0x21dC459fbA0B1Ea037Cd221D35b928Be1C26141a', rpcUrl, network);
    console.log('Resulting position:', position);
  });
});
