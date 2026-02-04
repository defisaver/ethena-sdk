import { NetworkNumber } from '@defisaver/positions-sdk';
import { MorphoManagerContract } from '../contracts';
import { getViemProvider } from '../services/viem';
import { Request, RequestType } from '../types';
import { predictSafeAddress } from '../safe';

const morphoAuthSignature: Request = {
  type: RequestType.Signature,
  getParams: async (rpcUrl: string, network: NetworkNumber, userAddress: string) => {
    const provider = getViemProvider(rpcUrl, network);
    const managerContract = MorphoManagerContract(provider, network);
    const nonce = await managerContract.read.nonce([userAddress as `0x${string}`]);
    const tenMinutes = 1000 * 60 * 10;
    const deadline = Date.now() + tenMinutes;
    const safeAddress = await predictSafeAddress(userAddress, rpcUrl, network);

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

export const getMorphoRequests = () => [morphoAuthSignature];