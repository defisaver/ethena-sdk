import 'dotenv/config';

import { MorphoBlueVersions } from '@defisaver/positions-sdk';
import { createWalletClient, http, parseGwei } from 'viem';
import { providers, Wallet } from 'ethers';
import Web3 from 'web3';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import {
  NetworkNumber,
  SupportedMarkets,
  execution,
} from '../src';

const { assert } = require('chai');


describe('Execution', () => {
  let rpcUrl: string;

  before(async () => {
    rpcUrl = process.env.RPC || '';
  });

  it('can fetch morpho requests', async function () {
    this.timeout(100000);
    const network = NetworkNumber.Eth;
    // @ts-ignore
    const account = privateKeyToAccount(process.env.PRIVATE_KEY);
    const client = createWalletClient({
      account,
      chain: mainnet,
      transport: http(rpcUrl),
    });
    const userAddress = account.address;

    // const web3 = new Web3(rpcUrl);
    // const web3account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY || '');
    console.log('User address:', account.address);

    // const provider = new providers.JsonRpcProvider(rpcUrl);
    // const wallet = new Wallet(process.env.PRIVATE_KEY || '', provider);

    const {
      requests: {
        authRequest, createAndExecuteRequest, createEthCallRequest, createWithSignatureEthCallRequest,
      }, recipe, shouldCreateSafeWallet, isAuthorized, safeAddress,
    } = await execution.getRequests(SupportedMarkets.MorphoBlueSUSDeUSDtb_915, userAddress, rpcUrl, network);

    const { txParams, isApproved } = await execution.getApprovalTxParams(rpcUrl, network, 'sUSDe', '100', safeAddress, userAddress);
    if (!isApproved) {
      await client.sendTransaction({
        ...txParams,
        maxFeePerGas: parseGwei('0.1'),
        maxPriorityFeePerGas: parseGwei('0.1'),
        chainId: mainnet.id,
        // @ts-ignore
        gas: 1000000,
      });
    }

    let authSignature = '';
    let deadline = 0;
    let nonce = 0;

    if (!isAuthorized) {
      const { message: authMessage, deadline: authDeadline, nonce: authNonce } = await authRequest.getParams({
        rpcUrl, network, userAddress, safeAddress,
      });
      authSignature = await account.signTypedData(authMessage);

      deadline = authDeadline;
      nonce = authNonce;
    }

    const recipeGetter = () => recipe(MorphoBlueVersions.MorphoBlueSUSDeUSDtb_915, network, '100', '20', userAddress, safeAddress, authSignature, deadline, nonce);

    if (shouldCreateSafeWallet) {
      const { message: executeMessage } = await createAndExecuteRequest.getParams({
        rpcUrl, network, userAddress, safeAddress, recipeGetter,
      });
      const createSignature = await client.signTypedData(executeMessage);

      const createTxParams = await createWithSignatureEthCallRequest.getParams({
        rpcUrl, network, userAddress, safeAddress, createSignature, createTxData: executeMessage.message,
      });
      await client.sendTransaction({
        ...createTxParams,
        maxFeePerGas: parseGwei('0.1'),
        maxPriorityFeePerGas: parseGwei('0.1'),
        chainId: mainnet.id,
        gas: 1000000,
      });
    } else {
      const createTxParams = await createEthCallRequest.getParams({
        rpcUrl, network, userAddress, safeAddress, recipeGetter,
      });
      await client.sendTransaction({
        ...createTxParams,
        maxFeePerGas: parseGwei('0.1'),
        maxPriorityFeePerGas: parseGwei('0.1'),
        chainId: mainnet.id,
        gas: 1000000,
      });
    }
  });
});
