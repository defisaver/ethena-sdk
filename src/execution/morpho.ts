import { NetworkNumber } from '@defisaver/positions-sdk';
import { encodeAbiParameters, encodeFunctionData, getAbiItem } from 'viem';
import {
  DFSSafeFactoryContract, getConfigContractAddress, getSafeWalletContract, MorphoManagerContract,
} from '../contracts';
import { getViemProvider } from '../services/viem';
import {
  AuthRequest, CreateAndExecuteRequest, CreateEthCallRequest, CreateWithSignatureEthCallRequest, RequestType, SafeTxData,
} from '../types';
import {
  getNextNonce, getSafeSalt, getSafeSetupParamsEncoded, getSafeWallets, predictSafeAddress,
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

    const message = {
      types: {
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
    return {
      message,
      deadline,
      nonce,
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

    const message = {
      types: {
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

    return {
      message,
      deadline: 0,
      nonce: 0,
    };
  },
};

const createAndExecuteTx: CreateWithSignatureEthCallRequest = {
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

    const encodedMethod = encodeFunctionData(
      {
        abi: contract.abi,
        functionName: method,
        args: [
          { singleton: singletonAddress, initializer: setupParamsEncoded, saltNonce: BigInt(salt) },
          // @ts-ignore
          { ...createTxData, signatures: createSignature },
        ],
      },
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

const createTx: CreateEthCallRequest = {
  type: RequestType.EthCall,
  getParams: async ({
    rpcUrl, network, userAddress, safeAddress, recipeGetter,
  }) => {
    const provider = getViemProvider(rpcUrl, network);
    const recipe = await recipeGetter();

    const ethValue = await recipe.getEthValue();
    const executeParams = recipe.encodeForDsProxyCall();

    const preApporvedSig = {
      id: -1,
      signature: `0x${'0'.repeat(24)}${userAddress.substring(2)}${'0'.repeat(64)}01`,
      signer: userAddress,
      sigType: 'PRE_APPROVED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const signatureV = parseInt(preApporvedSig.signature.slice(-2), 16);
    const handledSig = preApporvedSig.signature.slice(0, -2) + signatureV.toString(16).padStart(2, '0');

    const safeExecuteParams = [
      executeParams[0], // to
      ethValue, // eth value
      executeParams[1], // action/recipe/contract calldata
      1, // 1 is delegate call
      0, // safeTxGas
      0, // baseGas
      0, // gasPrice
      ZERO_ADDRESS, // gasToken
      SAFE_REFUND_RECEIVER, // refundReceiver
      handledSig,
    ];

    const contract = getSafeWalletContract(provider, safeAddress as `0x${string}`);
    const encodedMethod = encodeFunctionData(
      {
        abi: contract.abi,
        functionName: 'execTransaction',
        // @ts-ignore
        args: [...safeExecuteParams],
      },
    );

    const txParams = {
      from: userAddress,
      to: safeAddress,
      value: +ethValue,
      data: encodedMethod,
      gas: 0,
    };

    return txParams;
  },
};

export const getMorphoRequests = async (userAddress: string, rpcUrl: string, network: NetworkNumber) => {
  const safeWallets = (await getSafeWallets(userAddress, network)).wallets;
  const safeWallet = safeWallets[0] ? safeWallets[0] : await predictSafeAddress(userAddress, rpcUrl, network);

  const provider = getViemProvider(rpcUrl, network);
  const managerContract = MorphoManagerContract(provider, network);
  const isAuthorized = await managerContract.read.isAuthorized([userAddress as `0x${string}`, safeWallet as `0x${string}`]);

  const shouldCreateSafeWallet = !safeWallets[0];

  return ({
    requests: {
      authRequest: morphoAuthSignature,
      createAndExecuteRequest: createAndExecuteSignature,
      createWithSignatureEthCallRequest: createAndExecuteTx,
      createEthCallRequest: createTx,
    },
    recipe: morphoBlueLevCreateRecipe,
    safeAddress: safeWallet,
    isAuthorized,
    shouldCreateSafeWallet,
  });
};