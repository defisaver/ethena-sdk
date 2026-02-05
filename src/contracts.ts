import { getContract, Client } from 'viem';
import { EthAddress, HexString, NetworkNumber } from '@defisaver/positions-sdk';
import * as configRaw from './config/contracts';

export type ConfigKey = keyof typeof configRaw;

declare type ContractConfig = {
  abi: any[],
  networks: Partial<Record<NetworkNumber, Network>>,
};
declare type Network = {
  createdBlock?: number,
  address: string,
  oldVersions?: Record<string, { address: EthAddress, abi: any[] }>,
};
// @ts-ignore
const contractConfig:Record<ConfigKey, ContractConfig> = configRaw;

export const getConfigContractAddress = (name: ConfigKey, network: NetworkNumber): HexString => {
  const networkData = contractConfig[name].networks[network];
  const latestAddress = networkData?.address || '';
  return latestAddress as HexString;
};

export const getConfigContractAbi = <TKey extends ConfigKey>(name: TKey): typeof configRaw[TKey]['abi'] => {
  const latestAbi = contractConfig[name].abi;
  return latestAbi as unknown as typeof configRaw[TKey]['abi'];
};

export const createContractFromConfigFunc = <TKey extends ConfigKey>(name: TKey, _address?: HexString) => (client: Client, network: NetworkNumber) => {
  const address = (_address || getConfigContractAddress(name, network));
  const abi = getConfigContractAbi(name) as typeof configRaw[TKey]['abi'];
  return getContract({
    address,
    abi,
    client,
  });
};

export const Safe130Contract = createContractFromConfigFunc('Safe130');
export const SafeFactoryContract = createContractFromConfigFunc('SafeProxyFactory130');
export const MorphoManagerContract = createContractFromConfigFunc('MorphoManager');
export const DFSSafeFactoryContract = createContractFromConfigFunc('DFSSafeFactory');

export const getSafeWalletContract = (client: Client, address: HexString) => {
  const abi = getConfigContractAbi('Safe130') as typeof configRaw['Safe130']['abi'];
  return getContract({
    address,
    abi,
    client,
  });
};

export const getERC20Contract = (client: Client, address: HexString) => {
  const abi = getConfigContractAbi('ERC20') as typeof configRaw['ERC20']['abi'];
  return getContract({
    address,
    abi,
    client,
  });
};

export const getSafeWalletSingletonAddress = (network?: NetworkNumber) => getConfigContractAddress('Safe130', network || NetworkNumber.Eth);

export const getSafeFactoryAddress = (network?: NetworkNumber) => getConfigContractAddress('SafeProxyFactory130', network || NetworkNumber.Eth);

export const getSafeFallbackHandlerAddress = (network?: NetworkNumber) => getConfigContractAddress('SafeFallbackHandler130', network || NetworkNumber.Eth);