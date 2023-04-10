export const ABI = {
	DAI_LIKE: [
		{
			inputs: [{ internalType: 'uint256', name: 'chainId_', type: 'uint256' }],
			payable: false,
			stateMutability: 'nonpayable',
			type: 'constructor'
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'address', name: 'src', type: 'address' },
				{ indexed: true, internalType: 'address', name: 'guy', type: 'address' },
				{ indexed: false, internalType: 'uint256', name: 'wad', type: 'uint256' }
			],
			name: 'Approval',
			type: 'event'
		},
		{
			anonymous: true,
			inputs: [
				{ indexed: true, internalType: 'bytes4', name: 'sig', type: 'bytes4' },
				{ indexed: true, internalType: 'address', name: 'usr', type: 'address' },
				{ indexed: true, internalType: 'bytes32', name: 'arg1', type: 'bytes32' },
				{ indexed: true, internalType: 'bytes32', name: 'arg2', type: 'bytes32' },
				{ indexed: false, internalType: 'bytes', name: 'data', type: 'bytes' }
			],
			name: 'LogNote',
			type: 'event'
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'address', name: 'src', type: 'address' },
				{ indexed: true, internalType: 'address', name: 'dst', type: 'address' },
				{ indexed: false, internalType: 'uint256', name: 'wad', type: 'uint256' }
			],
			name: 'Transfer',
			type: 'event'
		},
		{
			constant: true,
			inputs: [],
			name: 'DOMAIN_SEPARATOR',
			outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
			payable: false,
			stateMutability: 'view',
			type: 'function'
		},
		{
			constant: true,
			inputs: [],
			name: 'PERMIT_TYPEHASH',
			outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
			payable: false,
			stateMutability: 'view',
			type: 'function'
		},
		{
			constant: true,
			inputs: [
				{ internalType: 'address', name: '', type: 'address' },
				{ internalType: 'address', name: '', type: 'address' }
			],
			name: 'allowance',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			payable: false,
			stateMutability: 'view',
			type: 'function'
		},
		{
			constant: false,
			inputs: [
				{ internalType: 'address', name: 'usr', type: 'address' },
				{ internalType: 'uint256', name: 'wad', type: 'uint256' }
			],
			name: 'approve',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			payable: false,
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			constant: true,
			inputs: [{ internalType: 'address', name: '', type: 'address' }],
			name: 'balanceOf',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			payable: false,
			stateMutability: 'view',
			type: 'function'
		},
		{
			constant: false,
			inputs: [
				{ internalType: 'address', name: 'usr', type: 'address' },
				{ internalType: 'uint256', name: 'wad', type: 'uint256' }
			],
			name: 'burn',
			outputs: [],
			payable: false,
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			constant: true,
			inputs: [],
			name: 'decimals',
			outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
			payable: false,
			stateMutability: 'view',
			type: 'function'
		},
		{
			constant: false,
			inputs: [{ internalType: 'address', name: 'guy', type: 'address' }],
			name: 'deny',
			outputs: [],
			payable: false,
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			constant: false,
			inputs: [
				{ internalType: 'address', name: 'usr', type: 'address' },
				{ internalType: 'uint256', name: 'wad', type: 'uint256' }
			],
			name: 'mint',
			outputs: [],
			payable: false,
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			constant: false,
			inputs: [
				{ internalType: 'address', name: 'src', type: 'address' },
				{ internalType: 'address', name: 'dst', type: 'address' },
				{ internalType: 'uint256', name: 'wad', type: 'uint256' }
			],
			name: 'move',
			outputs: [],
			payable: false,
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			constant: true,
			inputs: [],
			name: 'name',
			outputs: [{ internalType: 'string', name: '', type: 'string' }],
			payable: false,
			stateMutability: 'view',
			type: 'function'
		},
		{
			constant: true,
			inputs: [{ internalType: 'address', name: '', type: 'address' }],
			name: 'nonces',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			payable: false,
			stateMutability: 'view',
			type: 'function'
		},
		{
			constant: true,
			inputs: [{ internalType: 'address', name: '', type: 'address' }],
			name: '_nonces',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			payable: false,
			stateMutability: 'view',
			type: 'function'
		},
		{
			constant: false,
			inputs: [
				{ internalType: 'address', name: 'holder', type: 'address' },
				{ internalType: 'address', name: 'spender', type: 'address' },
				{ internalType: 'uint256', name: 'nonce', type: 'uint256' },
				{ internalType: 'uint256', name: 'expiry', type: 'uint256' },
				{ internalType: 'bool', name: 'allowed', type: 'bool' },
				{ internalType: 'uint8', name: 'v', type: 'uint8' },
				{ internalType: 'bytes32', name: 'r', type: 'bytes32' },
				{ internalType: 'bytes32', name: 's', type: 'bytes32' }
			],
			name: 'permit',
			outputs: [],
			payable: false,
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			constant: false,
			inputs: [
				{ internalType: 'address', name: 'usr', type: 'address' },
				{ internalType: 'uint256', name: 'wad', type: 'uint256' }
			],
			name: 'pull',
			outputs: [],
			payable: false,
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			constant: false,
			inputs: [
				{ internalType: 'address', name: 'usr', type: 'address' },
				{ internalType: 'uint256', name: 'wad', type: 'uint256' }
			],
			name: 'push',
			outputs: [],
			payable: false,
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			constant: false,
			inputs: [{ internalType: 'address', name: 'guy', type: 'address' }],
			name: 'rely',
			outputs: [],
			payable: false,
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			constant: true,
			inputs: [],
			name: 'symbol',
			outputs: [{ internalType: 'string', name: '', type: 'string' }],
			payable: false,
			stateMutability: 'view',
			type: 'function'
		},
		{
			constant: true,
			inputs: [],
			name: 'totalSupply',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			payable: false,
			stateMutability: 'view',
			type: 'function'
		},
		{
			constant: false,
			inputs: [
				{ internalType: 'address', name: 'dst', type: 'address' },
				{ internalType: 'uint256', name: 'wad', type: 'uint256' }
			],
			name: 'transfer',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			payable: false,
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			constant: false,
			inputs: [
				{ internalType: 'address', name: 'src', type: 'address' },
				{ internalType: 'address', name: 'dst', type: 'address' },
				{ internalType: 'uint256', name: 'wad', type: 'uint256' }
			],
			name: 'transferFrom',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			payable: false,
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			constant: true,
			inputs: [],
			name: 'version',
			outputs: [{ internalType: 'string', name: '', type: 'string' }],
			payable: false,
			stateMutability: 'view',
			type: 'function'
		},
		{
			constant: true,
			inputs: [{ internalType: 'address', name: '', type: 'address' }],
			name: 'wards',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			payable: false,
			stateMutability: 'view',
			type: 'function'
		}
	],
	EIP_2612: [
		{ inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'address', name: 'owner', type: 'address' },
				{ indexed: true, internalType: 'address', name: 'spender', type: 'address' },
				{ indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' }
			],
			name: 'Approval',
			type: 'event'
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'address', name: 'delegator', type: 'address' },
				{ indexed: true, internalType: 'address', name: 'fromDelegate', type: 'address' },
				{ indexed: true, internalType: 'address', name: 'toDelegate', type: 'address' }
			],
			name: 'DelegateChanged',
			type: 'event'
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'address', name: 'delegate', type: 'address' },
				{ indexed: false, internalType: 'uint256', name: 'previousBalance', type: 'uint256' },
				{ indexed: false, internalType: 'uint256', name: 'newBalance', type: 'uint256' }
			],
			name: 'DelegateVotesChanged',
			type: 'event'
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
				{ indexed: true, internalType: 'address', name: 'newOwner', type: 'address' }
			],
			name: 'OwnershipTransferred',
			type: 'event'
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'address', name: 'from', type: 'address' },
				{ indexed: true, internalType: 'address', name: 'to', type: 'address' },
				{ indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' }
			],
			name: 'Transfer',
			type: 'event'
		},
		{
			inputs: [],
			name: 'DOMAIN_SEPARATOR',
			outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: 'owner', type: 'address' },
				{ internalType: 'address', name: 'spender', type: 'address' }
			],
			name: 'allowance',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: 'spender', type: 'address' },
				{ internalType: 'uint256', name: 'amount', type: 'uint256' }
			],
			name: 'approve',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
			name: 'balanceOf',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
			name: 'burn',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: 'account', type: 'address' },
				{ internalType: 'uint256', name: 'amount', type: 'uint256' }
			],
			name: 'burnFrom',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: 'account', type: 'address' },
				{ internalType: 'uint32', name: 'pos', type: 'uint32' }
			],
			name: 'checkpoints',
			outputs: [
				{
					components: [
						{ internalType: 'uint32', name: 'fromBlock', type: 'uint32' },
						{ internalType: 'uint224', name: 'votes', type: 'uint224' }
					],
					internalType: 'struct ERC20Votes.Checkpoint',
					name: '',
					type: 'tuple'
				}
			],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [],
			name: 'decimals',
			outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: 'spender', type: 'address' },
				{ internalType: 'uint256', name: 'subtractedValue', type: 'uint256' }
			],
			name: 'decreaseAllowance',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'address', name: 'delegatee', type: 'address' }],
			name: 'delegate',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: 'delegatee', type: 'address' },
				{ internalType: 'uint256', name: 'nonce', type: 'uint256' },
				{ internalType: 'uint256', name: 'expiry', type: 'uint256' },
				{ internalType: 'uint8', name: 'v', type: 'uint8' },
				{ internalType: 'bytes32', name: 'r', type: 'bytes32' },
				{ internalType: 'bytes32', name: 's', type: 'bytes32' }
			],
			name: 'delegateBySig',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
			name: 'delegates',
			outputs: [{ internalType: 'address', name: '', type: 'address' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'uint256', name: 'blockNumber', type: 'uint256' }],
			name: 'getPastTotalSupply',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: 'account', type: 'address' },
				{ internalType: 'uint256', name: 'blockNumber', type: 'uint256' }
			],
			name: 'getPastVotes',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
			name: 'getVotes',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: 'spender', type: 'address' },
				{ internalType: 'uint256', name: 'addedValue', type: 'uint256' }
			],
			name: 'increaseAllowance',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: '_account', type: 'address' },
				{ internalType: 'uint256', name: '_amount', type: 'uint256' }
			],
			name: 'mint',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [],
			name: 'name',
			outputs: [{ internalType: 'string', name: '', type: 'string' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
			name: 'nonces',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
			name: 'numCheckpoints',
			outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [],
			name: 'owner',
			outputs: [{ internalType: 'address', name: '', type: 'address' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: 'owner', type: 'address' },
				{ internalType: 'address', name: 'spender', type: 'address' },
				{ internalType: 'uint256', name: 'value', type: 'uint256' },
				{ internalType: 'uint256', name: 'deadline', type: 'uint256' },
				{ internalType: 'uint8', name: 'v', type: 'uint8' },
				{ internalType: 'bytes32', name: 'r', type: 'bytes32' },
				{ internalType: 'bytes32', name: 's', type: 'bytes32' }
			],
			name: 'permit',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{ inputs: [], name: 'renounceOwnership', outputs: [], stateMutability: 'nonpayable', type: 'function' },
		{
			inputs: [],
			name: 'symbol',
			outputs: [{ internalType: 'string', name: '', type: 'string' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [],
			name: 'totalSupply',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: 'to', type: 'address' },
				{ internalType: 'uint256', name: 'amount', type: 'uint256' }
			],
			name: 'transfer',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: 'from', type: 'address' },
				{ internalType: 'address', name: 'to', type: 'address' },
				{ internalType: 'uint256', name: 'amount', type: 'uint256' }
			],
			name: 'transferFrom',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
			name: 'transferOwnership',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function'
		}
	],
	EIP2612_NO_NONCE: [
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'address', name: 'owner', type: 'address' },
				{ indexed: true, internalType: 'address', name: 'spender', type: 'address' },
				{ indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' }
			],
			name: 'Approval',
			type: 'event'
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'address', name: 'authorizer', type: 'address' },
				{ indexed: true, internalType: 'bytes32', name: 'nonce', type: 'bytes32' }
			],
			name: 'AuthorizationCanceled',
			type: 'event'
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'address', name: 'authorizer', type: 'address' },
				{ indexed: true, internalType: 'bytes32', name: 'nonce', type: 'bytes32' }
			],
			name: 'AuthorizationUsed',
			type: 'event'
		},
		{
			anonymous: false,
			inputs: [{ indexed: true, internalType: 'address', name: '_account', type: 'address' }],
			name: 'Blacklisted',
			type: 'event'
		},
		{
			anonymous: false,
			inputs: [{ indexed: true, internalType: 'address', name: 'newBlacklister', type: 'address' }],
			name: 'BlacklisterChanged',
			type: 'event'
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'address', name: 'burner', type: 'address' },
				{ indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }
			],
			name: 'Burn',
			type: 'event'
		},
		{
			anonymous: false,
			inputs: [{ indexed: true, internalType: 'address', name: 'newMasterMinter', type: 'address' }],
			name: 'MasterMinterChanged',
			type: 'event'
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'address', name: 'minter', type: 'address' },
				{ indexed: true, internalType: 'address', name: 'to', type: 'address' },
				{ indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }
			],
			name: 'Mint',
			type: 'event'
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'address', name: 'minter', type: 'address' },
				{ indexed: false, internalType: 'uint256', name: 'minterAllowedAmount', type: 'uint256' }
			],
			name: 'MinterConfigured',
			type: 'event'
		},
		{
			anonymous: false,
			inputs: [{ indexed: true, internalType: 'address', name: 'oldMinter', type: 'address' }],
			name: 'MinterRemoved',
			type: 'event'
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: false, internalType: 'address', name: 'previousOwner', type: 'address' },
				{ indexed: false, internalType: 'address', name: 'newOwner', type: 'address' }
			],
			name: 'OwnershipTransferred',
			type: 'event'
		},
		{ anonymous: false, inputs: [], name: 'Pause', type: 'event' },
		{
			anonymous: false,
			inputs: [{ indexed: true, internalType: 'address', name: 'newAddress', type: 'address' }],
			name: 'PauserChanged',
			type: 'event'
		},
		{
			anonymous: false,
			inputs: [{ indexed: true, internalType: 'address', name: 'newRescuer', type: 'address' }],
			name: 'RescuerChanged',
			type: 'event'
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'address', name: 'from', type: 'address' },
				{ indexed: true, internalType: 'address', name: 'to', type: 'address' },
				{ indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' }
			],
			name: 'Transfer',
			type: 'event'
		},
		{
			anonymous: false,
			inputs: [{ indexed: true, internalType: 'address', name: '_account', type: 'address' }],
			name: 'UnBlacklisted',
			type: 'event'
		},
		{ anonymous: false, inputs: [], name: 'Unpause', type: 'event' },
		{
			inputs: [],
			name: 'CANCEL_AUTHORIZATION_TYPEHASH',
			outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [],
			name: 'DOMAIN_SEPARATOR',
			outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [],
			name: 'PERMIT_TYPEHASH',
			outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [],
			name: 'RECEIVE_WITH_AUTHORIZATION_TYPEHASH',
			outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [],
			name: 'TRANSFER_WITH_AUTHORIZATION_TYPEHASH',
			outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: 'owner', type: 'address' },
				{ internalType: 'address', name: 'spender', type: 'address' }
			],
			name: 'allowance',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: 'spender', type: 'address' },
				{ internalType: 'uint256', name: 'value', type: 'uint256' }
			],
			name: 'approve',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: 'authorizer', type: 'address' },
				{ internalType: 'bytes32', name: 'nonce', type: 'bytes32' }
			],
			name: 'authorizationState',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
			name: 'balanceOf',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'address', name: '_account', type: 'address' }],
			name: 'blacklist',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [],
			name: 'blacklister',
			outputs: [{ internalType: 'address', name: '', type: 'address' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }],
			name: 'burn',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: 'authorizer', type: 'address' },
				{ internalType: 'bytes32', name: 'nonce', type: 'bytes32' },
				{ internalType: 'uint8', name: 'v', type: 'uint8' },
				{ internalType: 'bytes32', name: 'r', type: 'bytes32' },
				{ internalType: 'bytes32', name: 's', type: 'bytes32' }
			],
			name: 'cancelAuthorization',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: 'minter', type: 'address' },
				{ internalType: 'uint256', name: 'minterAllowedAmount', type: 'uint256' }
			],
			name: 'configureMinter',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [],
			name: 'currency',
			outputs: [{ internalType: 'string', name: '', type: 'string' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [],
			name: 'decimals',
			outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: 'spender', type: 'address' },
				{ internalType: 'uint256', name: 'decrement', type: 'uint256' }
			],
			name: 'decreaseAllowance',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: 'spender', type: 'address' },
				{ internalType: 'uint256', name: 'increment', type: 'uint256' }
			],
			name: 'increaseAllowance',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'string', name: 'tokenName', type: 'string' },
				{ internalType: 'string', name: 'tokenSymbol', type: 'string' },
				{ internalType: 'string', name: 'tokenCurrency', type: 'string' },
				{ internalType: 'uint8', name: 'tokenDecimals', type: 'uint8' },
				{ internalType: 'address', name: 'newMasterMinter', type: 'address' },
				{ internalType: 'address', name: 'newPauser', type: 'address' },
				{ internalType: 'address', name: 'newBlacklister', type: 'address' },
				{ internalType: 'address', name: 'newOwner', type: 'address' }
			],
			name: 'initialize',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'string', name: 'newName', type: 'string' }],
			name: 'initializeV2',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'address', name: 'lostAndFound', type: 'address' }],
			name: 'initializeV2_1',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'address', name: '_account', type: 'address' }],
			name: 'isBlacklisted',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
			name: 'isMinter',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [],
			name: 'masterMinter',
			outputs: [{ internalType: 'address', name: '', type: 'address' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: '_to', type: 'address' },
				{ internalType: 'uint256', name: '_amount', type: 'uint256' }
			],
			name: 'mint',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'address', name: 'minter', type: 'address' }],
			name: 'minterAllowance',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [],
			name: 'name',
			outputs: [{ internalType: 'string', name: '', type: 'string' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
			name: 'nonces',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
			name: '_nonces',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [],
			name: 'owner',
			outputs: [{ internalType: 'address', name: '', type: 'address' }],
			stateMutability: 'view',
			type: 'function'
		},
		{ inputs: [], name: 'pause', outputs: [], stateMutability: 'nonpayable', type: 'function' },
		{
			inputs: [],
			name: 'paused',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [],
			name: 'pauser',
			outputs: [{ internalType: 'address', name: '', type: 'address' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: 'owner', type: 'address' },
				{ internalType: 'address', name: 'spender', type: 'address' },
				{ internalType: 'uint256', name: 'value', type: 'uint256' },
				{ internalType: 'uint256', name: 'deadline', type: 'uint256' },
				{ internalType: 'uint8', name: 'v', type: 'uint8' },
				{ internalType: 'bytes32', name: 'r', type: 'bytes32' },
				{ internalType: 'bytes32', name: 's', type: 'bytes32' }
			],
			name: 'permit',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: 'from', type: 'address' },
				{ internalType: 'address', name: 'to', type: 'address' },
				{ internalType: 'uint256', name: 'value', type: 'uint256' },
				{ internalType: 'uint256', name: 'validAfter', type: 'uint256' },
				{ internalType: 'uint256', name: 'validBefore', type: 'uint256' },
				{ internalType: 'bytes32', name: 'nonce', type: 'bytes32' },
				{ internalType: 'uint8', name: 'v', type: 'uint8' },
				{ internalType: 'bytes32', name: 'r', type: 'bytes32' },
				{ internalType: 'bytes32', name: 's', type: 'bytes32' }
			],
			name: 'receiveWithAuthorization',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'address', name: 'minter', type: 'address' }],
			name: 'removeMinter',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'contract IERC20', name: 'tokenContract', type: 'address' },
				{ internalType: 'address', name: 'to', type: 'address' },
				{ internalType: 'uint256', name: 'amount', type: 'uint256' }
			],
			name: 'rescueERC20',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [],
			name: 'rescuer',
			outputs: [{ internalType: 'address', name: '', type: 'address' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [],
			name: 'symbol',
			outputs: [{ internalType: 'string', name: '', type: 'string' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [],
			name: 'totalSupply',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			stateMutability: 'view',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: 'to', type: 'address' },
				{ internalType: 'uint256', name: 'value', type: 'uint256' }
			],
			name: 'transfer',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: 'from', type: 'address' },
				{ internalType: 'address', name: 'to', type: 'address' },
				{ internalType: 'uint256', name: 'value', type: 'uint256' }
			],
			name: 'transferFrom',
			outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
			name: 'transferOwnership',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [
				{ internalType: 'address', name: 'from', type: 'address' },
				{ internalType: 'address', name: 'to', type: 'address' },
				{ internalType: 'uint256', name: 'value', type: 'uint256' },
				{ internalType: 'uint256', name: 'validAfter', type: 'uint256' },
				{ internalType: 'uint256', name: 'validBefore', type: 'uint256' },
				{ internalType: 'bytes32', name: 'nonce', type: 'bytes32' },
				{ internalType: 'uint8', name: 'v', type: 'uint8' },
				{ internalType: 'bytes32', name: 'r', type: 'bytes32' },
				{ internalType: 'bytes32', name: 's', type: 'bytes32' }
			],
			name: 'transferWithAuthorization',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'address', name: '_account', type: 'address' }],
			name: 'unBlacklist',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{ inputs: [], name: 'unpause', outputs: [], stateMutability: 'nonpayable', type: 'function' },
		{
			inputs: [{ internalType: 'address', name: '_newBlacklister', type: 'address' }],
			name: 'updateBlacklister',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'address', name: '_newMasterMinter', type: 'address' }],
			name: 'updateMasterMinter',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'address', name: '_newPauser', type: 'address' }],
			name: 'updatePauser',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [{ internalType: 'address', name: 'newRescuer', type: 'address' }],
			name: 'updateRescuer',
			outputs: [],
			stateMutability: 'nonpayable',
			type: 'function'
		},
		{
			inputs: [],
			name: 'version',
			outputs: [{ internalType: 'string', name: '', type: 'string' }],
			stateMutability: 'view',
			type: 'function'
		}
	]
};
