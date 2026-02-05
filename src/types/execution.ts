import { NetworkNumber } from '@defisaver/positions-sdk';
import { Recipe } from '@defisaver/sdk';

export enum RequestType {
  Signature = 'Signature',
  EthCall = 'EthCall',
}

export interface Request<T> {
  type: RequestType;
  getParams: (params: T) => Promise<any>;
}

export interface SafeTxData {
  to: string;
  value: string;
  data: string;
  operation: number;
  safeTxGas: number;
  baseGas: number;
  gasPrice: number;
  gasToken: string;
  refundReceiver: string;
  nonce: number;
}

export interface RequestCommonParams {
  rpcUrl: string;
  network: NetworkNumber;
  userAddress: string;
  safeAddress: string;
}

export interface CreateAndExecuteAdditionaPrams extends RequestCommonParams {
  recipeGetter: () => Promise<Recipe>;
}

export interface CreateWithSignatureEthCallParams extends RequestCommonParams {
  createSignature: any;
  createTxData: SafeTxData;
}

export interface CreateEthCallParams extends RequestCommonParams {
  recipeGetter: () => Promise<Recipe>;
}

export type AuthRequest = Request<RequestCommonParams>;
export type CreateAndExecuteRequest = Request<CreateAndExecuteAdditionaPrams>;
export type CreateWithSignatureEthCallRequest = Request<CreateWithSignatureEthCallParams>;
export type CreateEthCallRequest = Request<CreateEthCallParams>;
