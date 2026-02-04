import Dec from 'decimal.js';
import BN from 'bn.js';
import { NetworkNumber } from '@defisaver/positions-sdk';
import { assetAmountInWei, getAssetInfo } from '@defisaver/tokens';
import { OffchainExchanges, PriceData } from '../types';
import {
  DFS_API_URL, SLIPPAGE_PERCENT, STABLE_PAIR_FEE_DIVIDER, ZERO_ADDRESS,
} from '../constants';

const getOffchainEmptyData = (source: OffchainExchanges | 'None' = 'None'): PriceData => ({
  wrapper: ZERO_ADDRESS,
  to: ZERO_ADDRESS,
  allowanceTarget: ZERO_ADDRESS,
  price: '0',
  priceWithFee: '0',
  protocolFee: '0',
  data: '0x00',
  value: '0',
  gas: '0',
  source,
});

const parsePriceWithDecimals = (price: string, fromDecimals: number, toDecimals: number) => new Dec(price)
  .div(10 ** toDecimals)
  .div(10 ** (18 - fromDecimals))
  .toString();

const formatPriceWithDecimalForContract = (price: string, fromDecimals: number, toDecimals: number) => new Dec(price)
  .mul(10 ** toDecimals)
  .mul(10 ** (18 - fromDecimals))
  .floor()
  .toString();

const includeFeeInPrice = (price: string, from: string, to: string, fee: string) => {
  if (from === to) return price;
  return new Dec(price).mul(new Dec(1).sub(fee)).toString();
};

const excludeFeeFromPrice = (price: string, from: string, to: string, fee: string) => {
  if (from === to) return price;
  return new Dec(price).mul(new Dec(1).add(fee)).toString();
};

const parseOffchainPrice = (
  fromTokenSymbol: string,
  fromTokenDecimals: number,
  toTokenSymbol: string,
  toTokenDecimals: number,
  amount: string,
  feeDecimal: string,
): string => {
  const _price = parsePriceWithDecimals(amount, fromTokenDecimals, toTokenDecimals);
  return includeFeeInPrice(_price, fromTokenSymbol, toTokenSymbol, feeDecimal);
};

const getFeeDecimal = () => new Dec(1).div(STABLE_PAIR_FEE_DIVIDER).toString();

export const numStringToBytes = (num: number) => {
  const bn = new BN(num.toString()).toTwos(256);
  return bn.toString(16);
};

const getPriceFromServer = async (fromAsset: string, toAsset: string, amount: string, userAddress: string, network: NetworkNumber = NetworkNumber.Eth, infoOnly: boolean = true) => {
  const fromAssetData = getAssetInfo(fromAsset, network);
  const toAssetData = getAssetInfo(toAsset, network);
  const feeDecimal = getFeeDecimal();
  const excludedSources = ['Balancer_V2', 'Beethovenx'];

  const allSources = Object.values(OffchainExchanges);

  try {
    const res = await fetch(`${DFS_API_URL}/api/exchange/get-best-price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fromAsset: fromAssetData.address,
        fromAssetDecimals: fromAssetData.decimals,
        fromAssetSymbol: fromAssetData.symbol,
        toAsset: toAssetData.address,
        toAssetDecimals: toAssetData.decimals,
        toAssetSymbol: toAssetData.symbol,
        sources: [...allSources.map(s => s.toLowerCase())],
        chainId: network,
        amount,
        excludedSources,
        infoOnly,
        takerAddress: userAddress,
        account: userAddress,
        noFee: false,
        feeDecimal,
        // temporary fix for paraswap until old exchange service is removed
        shouldFormatParaswapPrice: true,
      }),
    });

    if (!res.ok) throw new Error(await res.text());
    const data = (await res.json());

    const formattedData: PriceData[] = data.map((d: any, i: number) => {
      const source = allSources[i];
      if (typeof d === 'string') return getOffchainEmptyData(source);
      return {
        wrapper: d.wrapper || ZERO_ADDRESS,
        to: d.to || ZERO_ADDRESS,
        allowanceTarget: d.allowanceTarget || ZERO_ADDRESS,
        protocolFee: d.protocolFee || '0',
        data: d.data || '0x00',
        value: d.value || '0',
        gas: d.gas || '0',
        source: allSources[i],
        price: d.price,
        priceWithFee: +(d.price || '0') > 0
          ? parseOffchainPrice(fromAssetData.symbol, fromAssetData.decimals, toAssetData.symbol, toAssetData.decimals, d.price, feeDecimal)
          : '0',
      };
    }).filter((d: PriceData) => d.wrapper !== ZERO_ADDRESS && d.price !== '0').sort((a: PriceData, b: PriceData) => (new Dec(a.price).gt(b.price) ? -1 : 1));

    return formattedData;
  } catch {
    return allSources.map(source => getOffchainEmptyData(source));
  }
};

export const getBestPrice = async (fromAsset: string, toAsset: string, amount: string, userAddress: string, network: NetworkNumber = NetworkNumber.Eth): Promise<PriceData> => {
  try {
    const formattedData: PriceData[] = await getPriceFromServer(fromAsset, toAsset, amount, userAddress, network);

    return formattedData[0] || getOffchainEmptyData();
  } catch (e) {
    console.error('Error fetching best price:', e);
    return getOffchainEmptyData();
  }
};

export const getExchangeOrder = async (fromAsset: string, toAsset: string, amount: string, userAddress: string, minPrice: string, network: NetworkNumber = NetworkNumber.Eth) => {
  const fromAssetData = getAssetInfo(fromAsset, network);
  const toAssetData = getAssetInfo(toAsset, network);
  const feeDecimal = getFeeDecimal();

  const offchainQuotes: PriceData[] = await getPriceFromServer(fromAsset, toAsset, amount, userAddress, network, false);

  const formattedOffchainQuotes = offchainQuotes.map((quote) => ({
    source: quote.source,
    price: quote.priceWithFee,
    wrapper: quote.wrapper,
    wrapperData: quote.data,
    offchainData: quote,
  }));

  const bestQuote = formattedOffchainQuotes[0];
  const { offchainData, source, price } = bestQuote;

  const minPriceFormatted = new Dec(excludeFeeFromPrice(minPrice, fromAssetData.address, toAssetData.address, feeDecimal))
    .mul(100 - SLIPPAGE_PERCENT)
    .div(100)
    .toString();
  const minPriceForContract = formatPriceWithDecimalForContract(minPriceFormatted, fromAssetData.decimals, toAssetData.decimals);

  const offchainDataArray = [
    offchainData.wrapper,
    offchainData.to,
    offchainData.allowanceTarget,
    offchainData.price,
    offchainData.protocolFee,
    offchainData.data,
  ];

  const value = offchainData.protocolFee;

  const wrapper = ZERO_ADDRESS;
  const wrapperData = `0x${numStringToBytes(Math.floor(Date.now() / 1000))}`;
  const amountWei = assetAmountInWei(amount, fromAsset).toString();

  if (offchainData.data === '0x00') throw new Error('Offchain data is empty');

  return {
    orderData: [
      fromAssetData.address,
      toAssetData.address,
      amountWei,
      '0',
      minPriceForContract,
      STABLE_PAIR_FEE_DIVIDER,
      '0x0000000000000000000000000000000000000000', // set by contract
      wrapper,
      wrapperData,
      offchainDataArray,
    ],
    value,
    source,
    price,
  };
};