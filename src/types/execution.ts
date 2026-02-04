import { NetworkNumber } from '@defisaver/positions-sdk';

export enum RequestType {
  Signature = 'Signature',
  EthCall = 'EthCall',
}

export interface Request {
  type: RequestType;
  getParams: (rpcUrl: string, network: NetworkNumber, userAddress: string) => Promise<any>;
}
