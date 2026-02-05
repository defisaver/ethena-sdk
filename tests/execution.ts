import 'dotenv/config';

import { MorphoBlueVersions } from '@defisaver/positions-sdk';
import { createWalletClient, http, parseGwei } from 'viem';
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
    const userAddress = '0x21dC459fbA0B1Ea037Cd221D35b928Be1C26141a';
    // @ts-ignore
    const account = privateKeyToAccount(process.env.PRIVATE_KEY);

    const client = createWalletClient({
      account,
      chain: mainnet,
      transport: http(rpcUrl),
    });

    const {
      requests: {
        authRequest, createAndExecuteRequest, createEthCallRequest, createWithSignatureEthCallRequest,
      }, recipe, shouldCreateSafeWallet, isAuthorized, safeAddress,
    } = await execution.getRequests(SupportedMarkets.MorphoBlueSUSDeUSDtb_915, userAddress, rpcUrl, network);

    const getApprovalTxParams = await execution.getApprovalTxParams(rpcUrl, network, 'sUSDe', '100', safeAddress, userAddress);
    // const approvalResponse = await client.sendTransaction({
    //   ...getApprovalTxParams,
    //   maxFeePerGas: parseGwei('20'),
    //   maxPriorityFeePerGas: parseGwei('3'),
    //   chainId: mainnet.id,
    //   // @ts-ignore
    //   gas: 1000000,
    // });

    const authMessage = await authRequest.getParams({
      rpcUrl, network, userAddress, safeAddress,
    });
    console.log('Auth message:', authMessage);
    const authSignature = await account.signTypedData(authMessage);
    // console.log('Auth message signature:', authSignature);

    if (shouldCreateSafeWallet) {
      const executeMessage = await createAndExecuteRequest.getParams({
        rpcUrl, network, userAddress, safeAddress, recipeGetter: () => recipe(MorphoBlueVersions.MorphoBlueSUSDeUSDtb_915, network, '100', '20', userAddress),
      });
      console.log('Execute message:', executeMessage);
      const createSignature = await account.signTypedData(executeMessage);
      //   console.log('Create and execute message signature:', createSignature);

      const createTxParams = await createWithSignatureEthCallRequest.getParams({
        rpcUrl, network, userAddress, safeAddress, createSignature, createTxData: executeMessage.message,
      });
      console.log('Create with signature eth call transaction parameters:', createTxParams);
      const test = await client.sendTransaction({
        ...createTxParams,
        maxFeePerGas: parseGwei('20'),
        maxPriorityFeePerGas: parseGwei('3'),
        chainId: mainnet.id,
        gas: 1000000,
      });
      console.log('Transaction response:', test);
    } else {
      const createTxParams = await createEthCallRequest.getParams({
        rpcUrl, network, userAddress, safeAddress, recipeGetter: () => recipe(MorphoBlueVersions.MorphoBlueSUSDeUSDtb_915, network, '100', '20', userAddress),
      });
      const test = await client.sendTransaction({
        ...createTxParams,
        maxFeePerGas: parseGwei('20'),
        maxPriorityFeePerGas: parseGwei('3'),
        chainId: mainnet.id,
        gas: 1000000,
      });
      console.log('Transaction response:', test);
    }
  });
});
