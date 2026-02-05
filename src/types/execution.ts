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

export interface RequestCommonParams {
  rpcUrl: string;
  network: NetworkNumber;
  userAddress: string;
  safeAddress: string;
}

export interface CreateAndExecuteAdditionaPrams extends RequestCommonParams {
  recipeGetter: () => Promise<Recipe>;
}

export type AuthRequest = Request<RequestCommonParams>;
export type CreateAndExecuteRequest = Request<CreateAndExecuteAdditionaPrams>;
