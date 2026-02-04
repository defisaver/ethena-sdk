export enum OffchainExchanges {
  ZeroX = '0x',
  Paraswap = 'Paraswap',
  Kyberswap = 'Kyberswap',
  OneInch = '1Inch',
  // Odos = 'Odos',
  Bebop = 'Bebop',
}

export interface PriceData {
  price: string;
  priceWithFee: string;
  source: OffchainExchanges | 'None';
  wrapper: string;
  to: string;
  allowanceTarget: string;
  protocolFee: string;
  data: string;
  value: string;
  gas: string;
}