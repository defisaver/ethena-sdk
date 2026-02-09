export const Safe130 = {
  abi: [{
    inputs: [{ internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'value', type: 'uint256' }, { internalType: 'bytes', name: 'data', type: 'bytes' }, { internalType: 'enum Enum.Operation', name: 'operation', type: 'uint8' }, { internalType: 'uint256', name: 'safeTxGas', type: 'uint256' }, { internalType: 'uint256', name: 'baseGas', type: 'uint256' }, { internalType: 'uint256', name: 'gasPrice', type: 'uint256' }, { internalType: 'address', name: 'gasToken', type: 'address' }, { internalType: 'address payable', name: 'refundReceiver', type: 'address' }, { internalType: 'bytes', name: 'signatures', type: 'bytes' }], name: 'execTransaction', outputs: [{ internalType: 'bool', name: 'success', type: 'bool' }], stateMutability: 'payable', type: 'function',
  }, {
    inputs: [{ internalType: 'address[]', name: '_owners', type: 'address[]' }, { internalType: 'uint256', name: '_threshold', type: 'uint256' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'bytes', name: 'data', type: 'bytes' }, { internalType: 'address', name: 'fallbackHandler', type: 'address' }, { internalType: 'address', name: 'paymentToken', type: 'address' }, { internalType: 'uint256', name: 'payment', type: 'uint256' }, { internalType: 'address payable', name: 'paymentReceiver', type: 'address' }], name: 'setup', outputs: [], stateMutability: 'nonpayable', type: 'function',
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

export const MorphoManager = {
  abi: [{
    inputs: [{ internalType: 'address', name: '', type: 'address' }, { internalType: 'address', name: '', type: 'address' }], name: 'isAuthorized', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function',
  }, {
    inputs: [{ internalType: 'address', name: '', type: 'address' }], name: 'nonce', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
  }],
  networks: {
    1: {
      address: '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb',
    },
  },
} as const;

export const DFSSafeFactory = {
  abi: [{ inputs: [], stateMutability: 'nonpayable', type: 'constructor' }, { inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], name: 'UnsupportedChain', type: 'error' }, {
    inputs: [{
      components: [{ internalType: 'address', name: 'singleton', type: 'address' }, { internalType: 'bytes', name: 'initializer', type: 'bytes' }, { internalType: 'uint256', name: 'saltNonce', type: 'uint256' }], internalType: 'structDFSSafeFactory.SafeCreationData', name: '_creationData', type: 'tuple',
    }, {
      components: [{ internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'value', type: 'uint256' }, { internalType: 'bytes', name: 'data', type: 'bytes' }, { internalType: 'uint8', name: 'operation', type: 'uint8' }, { internalType: 'uint256', name: 'safeTxGas', type: 'uint256' }, { internalType: 'uint256', name: 'baseGas', type: 'uint256' }, { internalType: 'uint256', name: 'gasPrice', type: 'uint256' }, { internalType: 'address', name: 'gasToken', type: 'address' }, { internalType: 'addresspayable', name: 'refundReceiver', type: 'address' }, { internalType: 'bytes', name: 'signatures', type: 'bytes' }], internalType: 'structDFSSafeFactory.SafeExecutionData', name: '_executionData', type: 'tuple',
    }],
    name: 'createSafeAndExecute',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  }, {
    inputs: [], name: 'safeFactory', outputs: [{ internalType: 'contractISafeProxyFactory', name: '', type: 'address' }], stateMutability: 'view', type: 'function',
  }],
  networks: {
    1: {
      address: '0x905ade25b1f8f39cf470e39c5a768eaf1f91fd3e',
    },
  },
} as const;

export const ERC20 = {
  abi: [{
    constant: true, inputs: [], name: 'name', outputs: [{ name: '', type: 'string' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: false, inputs: [], name: 'stop', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: false, inputs: [{ name: 'guy', type: 'address' }, { name: 'wad', type: 'uint256' }], name: 'approve', outputs: [{ name: '', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: false, inputs: [{ name: 'owner_', type: 'address' }], name: 'setOwner', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: true, inputs: [], name: 'totalSupply', outputs: [{ name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: false, inputs: [{ name: 'src', type: 'address' }, { name: 'dst', type: 'address' }, { name: 'wad', type: 'uint256' }], name: 'transferFrom', outputs: [{ name: '', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: true, inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: false, inputs: [{ name: 'guy', type: 'address' }, { name: 'wad', type: 'uint256' }], name: 'mint', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: false, inputs: [{ name: 'wad', type: 'uint256' }], name: 'burn', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: false, inputs: [{ name: 'name_', type: 'bytes32' }], name: 'setName', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: true, inputs: [{ name: 'src', type: 'address' }], name: 'balanceOf', outputs: [{ name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: true, inputs: [], name: 'stopped', outputs: [{ name: '', type: 'bool' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: false, inputs: [{ name: 'authority_', type: 'address' }], name: 'setAuthority', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: true, inputs: [], name: 'owner', outputs: [{ name: '', type: 'address' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: true, inputs: [], name: 'symbol', outputs: [{ name: '', type: 'string' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: false, inputs: [{ name: 'guy', type: 'address' }, { name: 'wad', type: 'uint256' }], name: 'burn', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: false, inputs: [{ name: 'wad', type: 'uint256' }], name: 'mint', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: false, inputs: [{ name: 'dst', type: 'address' }, { name: 'wad', type: 'uint256' }], name: 'transfer', outputs: [{ name: '', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: false, inputs: [{ name: 'dst', type: 'address' }, { name: 'wad', type: 'uint256' }], name: 'push', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: false, inputs: [{ name: 'src', type: 'address' }, { name: 'dst', type: 'address' }, { name: 'wad', type: 'uint256' }], name: 'move', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: false, inputs: [], name: 'start', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: true, inputs: [], name: 'authority', outputs: [{ name: '', type: 'address' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: false, inputs: [{ name: 'guy', type: 'address' }], name: 'approve', outputs: [{ name: '', type: 'bool' }], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    constant: true, inputs: [{ name: 'src', type: 'address' }, { name: 'guy', type: 'address' }], name: 'allowance', outputs: [{ name: '', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function',
  }, {
    constant: false, inputs: [{ name: 'src', type: 'address' }, { name: 'wad', type: 'uint256' }], name: 'pull', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function',
  }, {
    inputs: [{ name: 'symbol_', type: 'bytes32' }], payable: false, stateMutability: 'nonpayable', type: 'constructor',
  }, {
    anonymous: false, inputs: [{ indexed: true, name: 'guy', type: 'address' }, { indexed: false, name: 'wad', type: 'uint256' }], name: 'Mint', type: 'event',
  }, {
    anonymous: false, inputs: [{ indexed: true, name: 'guy', type: 'address' }, { indexed: false, name: 'wad', type: 'uint256' }], name: 'Burn', type: 'event',
  }, {
    anonymous: false, inputs: [{ indexed: true, name: 'authority', type: 'address' }], name: 'LogSetAuthority', type: 'event',
  }, {
    anonymous: false, inputs: [{ indexed: true, name: 'owner', type: 'address' }], name: 'LogSetOwner', type: 'event',
  }, {
    anonymous: true, inputs: [{ indexed: true, name: 'sig', type: 'bytes4' }, { indexed: true, name: 'guy', type: 'address' }, { indexed: true, name: 'foo', type: 'bytes32' }, { indexed: true, name: 'bar', type: 'bytes32' }, { indexed: false, name: 'wad', type: 'uint256' }, { indexed: false, name: 'fax', type: 'bytes' }], name: 'LogNote', type: 'event',
  }, {
    anonymous: false, inputs: [{ indexed: true, name: 'src', type: 'address' }, { indexed: true, name: 'guy', type: 'address' }, { indexed: false, name: 'wad', type: 'uint256' }], name: 'Approval', type: 'event',
  }, {
    anonymous: false, inputs: [{ indexed: true, name: 'src', type: 'address' }, { indexed: true, name: 'dst', type: 'address' }, { indexed: false, name: 'wad', type: 'uint256' }], name: 'Transfer', type: 'event',
  }],
} as const;

export const AaveV3View = {
  abi: [{
    inputs: [{ internalType: 'address', name: '_market', type: 'address' }, { internalType: 'address[]', name: '_tokenAddresses', type: 'address[]' }],
    name: 'getFullTokensInfo',
    outputs: [{
      components: [{ internalType: 'address', name: 'aTokenAddress', type: 'address' }, { internalType: 'address', name: 'underlyingTokenAddress', type: 'address' }, { internalType: 'uint16', name: 'assetId', type: 'uint16' }, { internalType: 'uint256', name: 'supplyRate', type: 'uint256' }, { internalType: 'uint256', name: 'borrowRateVariable', type: 'uint256' }, { internalType: 'uint256', name: 'borrowRateStable', type: 'uint256' }, { internalType: 'uint256', name: 'totalSupply', type: 'uint256' }, { internalType: 'uint256', name: 'availableLiquidity', type: 'uint256' }, { internalType: 'uint256', name: 'totalBorrow', type: 'uint256' }, { internalType: 'uint256', name: 'totalBorrowVar', type: 'uint256' }, { internalType: 'uint256', name: 'totalBorrowStab', type: 'uint256' }, { internalType: 'uint256', name: 'collateralFactor', type: 'uint256' }, { internalType: 'uint256', name: 'liquidationRatio', type: 'uint256' }, { internalType: 'uint256', name: 'price', type: 'uint256' }, { internalType: 'uint256', name: 'supplyCap', type: 'uint256' }, { internalType: 'uint256', name: 'borrowCap', type: 'uint256' }, { internalType: 'uint256', name: 'emodeCategory', type: 'uint256' }, { internalType: 'uint256', name: 'debtCeilingForIsolationMode', type: 'uint256' }, { internalType: 'uint256', name: 'isolationModeTotalDebt', type: 'uint256' }, { internalType: 'bool', name: 'usageAsCollateralEnabled', type: 'bool' }, { internalType: 'bool', name: 'borrowingEnabled', type: 'bool' }, { internalType: 'bool', name: 'stableBorrowRateEnabled', type: 'bool' }, { internalType: 'bool', name: 'isolationModeBorrowingEnabled', type: 'bool' }, { internalType: 'bool', name: 'isSiloedForBorrowing', type: 'bool' }, { internalType: 'uint256', name: 'eModeCollateralFactor', type: 'uint256' }, { internalType: 'bool', name: 'isFlashLoanEnabled', type: 'bool' }, { internalType: 'uint16', name: 'ltv', type: 'uint16' }, { internalType: 'uint16', name: 'liquidationThreshold', type: 'uint16' }, { internalType: 'uint16', name: 'liquidationBonus', type: 'uint16' }, { internalType: 'address', name: 'priceSource', type: 'address' }, { internalType: 'string', name: 'label', type: 'string' }, { internalType: 'bool', name: 'isActive', type: 'bool' }, { internalType: 'bool', name: 'isPaused', type: 'bool' }, { internalType: 'bool', name: 'isFrozen', type: 'bool' }], internalType: 'struct AaveV3View.TokenInfoFull[]', name: 'tokens', type: 'tuple[]',
    }],
    stateMutability: 'view',
    type: 'function',
  }],
  networks: {
    1: {
      address: '0xB63565026194672f1db42473CB470B570bba78ce',
    },
    10: {
      address: '0xB67979842Ec9B462e18834Aee7426ef37938A5Dd',
    },
    8453: {
      address: '0x723eE7B9D3Fc685Ebac5Ec87F4E5E20513DF975F',
    },
    42161: {
      address: '0xf9d70D3280794ffA1E1ffbFC8FAA600a2DFc1f52',
    },
    59144: {
      address: '0x1420f4977E7B71AFddccBFc6F6e1505CefdF99F0',
    },
    9745: {
      address: '0x5B0B7E38C2a8e46CfAe13c360BC5927570BeEe94',
    },
  },
} as const;