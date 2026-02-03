import { NetworkNumber } from '@defisaver/positions-sdk';
import {
  createPublicClient,
  http,
} from 'viem';
import {
  arbitrum, base, mainnet, optimism, linea, plasma,
} from 'viem/chains';

export const getViemChain = (network: NetworkNumber) => {
  switch (network) {
    case NetworkNumber.Eth:
      return mainnet;
    case NetworkNumber.Opt:
      return optimism;
    case NetworkNumber.Arb:
      return arbitrum;
    case NetworkNumber.Base:
      return base;
    case NetworkNumber.Linea:
      return linea;
    case NetworkNumber.Plasma:
      return plasma;
    default:
      throw new Error(`Unsupported network: ${network}`);
  }
};

export const getViemProvider = (rpcUrl: string, network: NetworkNumber, options?: any) => createPublicClient({
  transport: http(rpcUrl),
  chain: getViemChain(network),
  ...options,
});