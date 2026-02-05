import { NetworkNumber } from '@defisaver/positions-sdk';
import { encodeAbiParameters, getAbiItem } from 'viem';
import { DFSSafeFactoryContract, getConfigContractAddress, MorphoManagerContract } from '../contracts';
import { getViemProvider } from '../services/viem';
import {
  AuthRequest, CreateAndExecuteRequest, CreateEthCallRequest, RequestType, SafeTxData,
} from '../types';
import {
  getNextNonce, getSafeSalt, getSafeSetupParamsEncoded, predictSafeAddress,
} from '../safe';
import { morphoBlueLevCreateRecipe } from '../recipes';
import { SAFE_REFUND_RECEIVER, ZERO_ADDRESS } from '../constants';

const morphoAuthSignature: AuthRequest = {
  type: RequestType.Signature,
  getParams: async ({
    rpcUrl, network, userAddress, safeAddress,
  }) => {
    const provider = getViemProvider(rpcUrl, network);
    const managerContract = MorphoManagerContract(provider, network);
    const nonce = await managerContract.read.nonce([userAddress as `0x${string}`]);
    const tenMinutes = 1000 * 60 * 10;
    const deadline = Date.now() + tenMinutes;

    return {
      types: {
        EIP712Domain: [
          { name: 'verifyingContract', type: 'address' },
          { name: 'chainId', type: 'uint256' },
        ],
        Authorization: [
          { name: 'authorizer', type: 'address' },
          { name: 'authorized', type: 'address' },
          { name: 'isAuthorized', type: 'bool' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
      domain: {
        chainId: network,
        verifyingContract: managerContract.address,
      },
      primaryType: 'Authorization',
      message: {
        authorizer: userAddress,
        authorized: safeAddress,
        isAuthorized: true,
        nonce: +nonce.toString(),
        deadline,
      },
    };
  },
};

const createAndExecuteSignature: CreateAndExecuteRequest = {
  type: RequestType.Signature,
  getParams: async ({
    rpcUrl, network, userAddress, safeAddress, recipeGetter,
  }) => {
    const recipe = await recipeGetter();
    const executeParams = recipe.encodeForDsProxyCall()[1];

    const safeTx: SafeTxData = {
      to: recipe.recipeExecutorAddress,
      value: '0',
      data: executeParams,
      operation: 1,
      safeTxGas: 0,
      baseGas: 0,
      gasPrice: 0,
      gasToken: ZERO_ADDRESS,
      refundReceiver: SAFE_REFUND_RECEIVER,
      nonce: 0,
    };

    return {
      types: {
        EIP712Domain: [
          { name: 'verifyingContract', type: 'address' },
          { name: 'chainId', type: 'uint256' },
        ],
        SafeTx: [
          { type: 'address', name: 'to' },
          { type: 'uint256', name: 'value' },
          { type: 'bytes', name: 'data' },
          { type: 'uint8', name: 'operation' },
          { type: 'uint256', name: 'safeTxGas' },
          { type: 'uint256', name: 'baseGas' },
          { type: 'uint256', name: 'gasPrice' },
          { type: 'address', name: 'gasToken' },
          { type: 'address', name: 'refundReceiver' },
          { type: 'uint256', name: 'nonce' },
        ],
      },
      domain: {
        chainId: network,
        verifyingContract: safeAddress,
      },
      primaryType: 'SafeTx',
      message: safeTx,
    };
  },
};

const createTx: CreateEthCallRequest = {
  type: RequestType.EthCall,
  getParams: async ({
    rpcUrl, network, userAddress, safeAddress, createSignature, createTxData,
  }) => {
    const provider = getViemProvider(rpcUrl, network);
    const contract = DFSSafeFactoryContract(provider, network);
    const method = 'createSafeAndExecute';

    const singletonAddress = getConfigContractAddress('Safe130', network);
    const setupParamsEncoded = getSafeSetupParamsEncoded([userAddress], 1, network);
    const salt = await getSafeSalt(userAddress, rpcUrl, network);

    const safeCreationParams = [
      singletonAddress,
      setupParamsEncoded,
      salt,
    ];

    const data = Object.values(createTxData);
    data[data.length - 1] = createSignature;

    const methodParams = [safeCreationParams, data];

    const encodedMethod = encodeAbiParameters(
      getAbiItem({ abi: contract.abi, name: method })?.inputs || [],
      // @ts-ignore
      methodParams,
    );

    const txParams = {
      from: userAddress,
      to: contract.address,
      value: 0,
      data: encodedMethod,
      gas: 0,
    };

    return txParams;
  },
};

export const getMorphoRequests = async (userAddress: string, rpcUrl: string, network: NetworkNumber) => ({
  requests: {
    authRequest: morphoAuthSignature,
    createAndExecuteRequest: createAndExecuteSignature,
    createEthCallRequest: createTx,
  },
  recipe: morphoBlueLevCreateRecipe,
  safeAddress: await predictSafeAddress(userAddress, rpcUrl, network),
});