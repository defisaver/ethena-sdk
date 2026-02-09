import 'dotenv/config';

import { MorphoBlueVersions } from '@defisaver/positions-sdk';
import { createWalletClient, http, parseGwei } from 'viem';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import {
  NetworkNumber,
  SupportedMarkets,
  execution,
  marketData,
  positionData,
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
    const selectedMarket = SupportedMarkets.MorphoBlueSUSDeUSDtb_915;
    const supplyAmount = '10';
    const exposure = 3;
    const maxFeePerGas = parseGwei('20');
    const maxPriorityFeePerGas = parseGwei('10');
    // @ts-ignore
    const account = privateKeyToAccount(process.env.PRIVATE_KEY);
    const client = createWalletClient({
      account,
      chain: mainnet,
      transport: http(rpcUrl),
    });
    const userAddress = account.address;
    console.log('User address:', account.address);

    const {
      requests: {
        authRequest, createAndExecuteRequest, createEthCallRequest, createWithSignatureEthCallRequest,
      }, recipe, shouldCreateSafeWallet, isAuthorized, safeAddress,
    } = await execution.getRequests(SupportedMarkets.MorphoBlueSUSDeUSDtb_915, userAddress, rpcUrl, network);
    console.log('Safe address:', safeAddress);

    const { txParams, isApproved } = await execution.getApprovalTxParams(rpcUrl, network, 'sUSDe', supplyAmount, safeAddress, userAddress);
    if (!isApproved) {
      await client.sendTransaction({
        ...txParams,
        maxFeePerGas,
        maxPriorityFeePerGas,
        chainId: mainnet.id,
        // @ts-ignore
        gas: 3000000,
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

    const market = await marketData.getMarketData(selectedMarket, rpcUrl, network);
    const { flashloanInfo, exchangeInfo, usedAssets } = await positionData.getResultingPosition(market, supplyAmount, exposure, '0x21dC459fbA0B1Ea037Cd221D35b928Be1C26141a', rpcUrl, network);
    const debtAmount = usedAssets.USDtb?.borrowed || '0';
    console.log('Debt amount:', debtAmount);

    const recipeGetter = () => recipe(
      MorphoBlueVersions.MorphoBlueSUSDeUSDtb_915,
      market.assetsData,
      network,
      supplyAmount,
      debtAmount,
      userAddress,
      safeAddress,
      exchangeInfo.price,
      flashloanInfo.useFlashloan,
      flashloanInfo.protocol,
      true,
      authSignature,
      deadline,
      nonce,
    );

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
        maxFeePerGas,
        maxPriorityFeePerGas,
        chainId: mainnet.id,
        gas: 3000000,
      });
    } else {
      const createTxParams = await createEthCallRequest.getParams({
        rpcUrl, network, userAddress, safeAddress, recipeGetter,
      });
      await client.sendTransaction({
        ...createTxParams,
        maxFeePerGas,
        maxPriorityFeePerGas,
        chainId: mainnet.id,
        gas: 3000000,
      });
    }
  });
});
