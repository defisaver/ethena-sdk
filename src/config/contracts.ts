export const Safe130 = {
  abi: [{
    inputs: [{ internalType: 'address[]', name: '_owners', type: 'address[]' }, { internalType: 'uint256', name: '_threshold', type: 'uint256' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'bytes', name: 'data', type: 'bytes' }, { internalType: 'address', name: 'fallbackHandler', type: 'address' }, { internalType: 'address', name: 'paymentToken', type: 'address' }, { internalType: 'uint256', name: 'payment', type: 'uint256' }, { internalType: 'address payable', name: 'paymentReceiver', type: 'address' }], name: 'setup', outputs: [], stateMutability: 'pure', type: 'function',
  }],
  networks: {
    1: {
      address: '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552',
    },
    10: {
      address: '0xfb1bffC9d739B8D520DaF37dF666da4C687191EA',
    },
    8453: {
      address: '0xfb1bffC9d739B8D520DaF37dF666da4C687191EA',
    },
    42161: {
      address: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',
    },
  },
} as const;

export const SafeFallbackHandler130 = {
  abi: [{ inputs: [], stateMutability: 'nonpayable', type: 'constructor' }, {
    inputs: [{ internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'value', type: 'uint256' }, { internalType: 'bytes', name: 'data', type: 'bytes' }, { internalType: 'enum Enum.Operation', name: 'operation', type: 'uint8' }], name: 'simulate', outputs: [{ internalType: 'uint256', name: 'estimate', type: 'uint256' }, { internalType: 'bool', name: 'success', type: 'bool' }, { internalType: 'bytes', name: 'returnData', type: 'bytes' }], stateMutability: 'nonpayable', type: 'function',
  }],
  networks: {
    1: {
      address: '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4',
    },
    10: {
      address: '0x017062a1dE2FE6b99BE3d9d37841FeD19F573804',
    },
    8453: {
      address: '0x017062a1dE2FE6b99BE3d9d37841FeD19F573804',
    },
    42161: {
      address: '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4',
    },
  },
} as const;

export const SafeProxyFactory130 = {
  abi: [{
    inputs: [{ internalType: 'address', name: '_singleton', type: 'address' }, { internalType: 'bytes', name: 'initializer', type: 'bytes' }, { internalType: 'uint256', name: 'saltNonce', type: 'uint256' }], name: 'createProxyWithNonce', outputs: [{ internalType: 'contract GnosisSafeProxy', name: 'proxy', type: 'address' }], stateMutability: 'nonpayable', type: 'function',
  }, {
    inputs: [], name: 'proxyCreationCode', outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }], stateMutability: 'pure', type: 'function',
  }],
  networks: {
    1: {
      address: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
    },
    10: {
      address: '0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC',
    },
    8453: {
      address: '0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC',
    },
    42161: {
      address: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2',
    },
  },
} as const;