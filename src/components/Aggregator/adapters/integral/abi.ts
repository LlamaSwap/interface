export const ABI = [
	{ inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
	{
		anonymous: false,
		inputs: [
			{ indexed: false, internalType: 'address', name: 'token', type: 'address' },
			{ indexed: false, internalType: 'address', name: 'to', type: 'address' },
			{ indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }
		],
		name: 'Approve',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: 'address', name: 'sender', type: 'address' },
			{ indexed: false, internalType: 'address', name: 'tokenIn', type: 'address' },
			{ indexed: false, internalType: 'address', name: 'tokenOut', type: 'address' },
			{ indexed: false, internalType: 'uint256', name: 'amountIn', type: 'uint256' },
			{ indexed: false, internalType: 'uint256', name: 'amountInMax', type: 'uint256' },
			{ indexed: false, internalType: 'uint256', name: 'amountOut', type: 'uint256' },
			{ indexed: false, internalType: 'bool', name: 'wrapUnwrap', type: 'bool' },
			{ indexed: false, internalType: 'uint256', name: 'fee', type: 'uint256' },
			{ indexed: true, internalType: 'address', name: 'to', type: 'address' },
			{ indexed: false, internalType: 'address', name: 'orderContract', type: 'address' },
			{ indexed: true, internalType: 'uint256', name: 'orderId', type: 'uint256' }
		],
		name: 'Buy',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [{ indexed: false, internalType: 'address', name: 'delay', type: 'address' }],
		name: 'DelaySet',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [{ indexed: false, internalType: 'uint256', name: 'gasCost', type: 'uint256' }],
		name: 'EthTransferGasCostSet',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [{ indexed: false, internalType: 'uint256', name: 'limit', type: 'uint256' }],
		name: 'ExecutionGasLimitSet',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [{ indexed: false, internalType: 'uint256', name: 'multiplier', type: 'uint256' }],
		name: 'GasPriceMultiplierSet',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: false, internalType: 'address', name: '_factory', type: 'address' },
			{ indexed: false, internalType: 'address', name: '_delay', type: 'address' },
			{ indexed: false, internalType: 'address', name: '_weth', type: 'address' }
		],
		name: 'Initialized',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [{ indexed: false, internalType: 'address', name: 'owner', type: 'address' }],
		name: 'OwnerSet',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: false, internalType: 'address', name: 'pair', type: 'address' },
			{ indexed: false, internalType: 'bool', name: 'enabled', type: 'bool' }
		],
		name: 'PairEnabledSet',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: 'address', name: 'sender', type: 'address' },
			{ indexed: false, internalType: 'address', name: 'tokenIn', type: 'address' },
			{ indexed: false, internalType: 'address', name: 'tokenOut', type: 'address' },
			{ indexed: false, internalType: 'uint256', name: 'amountIn', type: 'uint256' },
			{ indexed: false, internalType: 'uint256', name: 'amountOut', type: 'uint256' },
			{ indexed: false, internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
			{ indexed: false, internalType: 'bool', name: 'wrapUnwrap', type: 'bool' },
			{ indexed: false, internalType: 'uint256', name: 'fee', type: 'uint256' },
			{ indexed: true, internalType: 'address', name: 'to', type: 'address' },
			{ indexed: false, internalType: 'address', name: 'orderContract', type: 'address' },
			{ indexed: true, internalType: 'uint256', name: 'orderId', type: 'uint256' }
		],
		name: 'Sell',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: false, internalType: 'address', name: 'pair', type: 'address' },
			{ indexed: false, internalType: 'uint256', name: 'fee', type: 'uint256' }
		],
		name: 'SwapFeeSet',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: false, internalType: 'address', name: 'token', type: 'address' },
			{ indexed: false, internalType: 'uint256', name: 'limit', type: 'uint256' }
		],
		name: 'TokenLimitMaxMultiplierSet',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: false, internalType: 'address', name: 'token', type: 'address' },
			{ indexed: false, internalType: 'uint256', name: 'limit', type: 'uint256' }
		],
		name: 'TokenLimitMinSet',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: false, internalType: 'address', name: 'pair', type: 'address' },
			{ indexed: false, internalType: 'uint16', name: 'tolerance', type: 'uint16' }
		],
		name: 'ToleranceSet',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: false, internalType: 'address', name: 'pair', type: 'address' },
			{ indexed: false, internalType: 'uint32', name: 'interval', type: 'uint32' }
		],
		name: 'TwapIntervalSet',
		type: 'event'
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: false, internalType: 'address', name: 'token', type: 'address' },
			{ indexed: false, internalType: 'address', name: 'to', type: 'address' },
			{ indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }
		],
		name: 'Withdraw',
		type: 'event'
	},
	{
		inputs: [
			{ internalType: 'address', name: 'token', type: 'address' },
			{ internalType: 'uint256', name: 'amount', type: 'uint256' },
			{ internalType: 'address', name: 'to', type: 'address' }
		],
		name: 'approve',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{
				components: [
					{ internalType: 'address', name: 'tokenIn', type: 'address' },
					{ internalType: 'address', name: 'tokenOut', type: 'address' },
					{ internalType: 'uint256', name: 'amountInMax', type: 'uint256' },
					{ internalType: 'uint256', name: 'amountOut', type: 'uint256' },
					{ internalType: 'bool', name: 'wrapUnwrap', type: 'bool' },
					{ internalType: 'address', name: 'to', type: 'address' },
					{ internalType: 'uint32', name: 'submitDeadline', type: 'uint32' }
				],
				internalType: 'struct ITwapRelayer.BuyParams',
				name: 'buyParams',
				type: 'tuple'
			}
		],
		name: 'buy',
		outputs: [{ internalType: 'uint256', name: 'orderId', type: 'uint256' }],
		stateMutability: 'payable',
		type: 'function'
	},
	{
		inputs: [],
		name: 'delay',
		outputs: [{ internalType: 'address', name: '', type: 'address' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [],
		name: 'ethTransferGasCost',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [],
		name: 'executionGasLimit',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [],
		name: 'factory',
		outputs: [{ internalType: 'address', name: '', type: 'address' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [],
		name: 'gasPriceMultiplier',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'address', name: 'token0', type: 'address' },
			{ internalType: 'address', name: 'token1', type: 'address' }
		],
		name: 'getPoolState',
		outputs: [
			{ internalType: 'uint256', name: 'price', type: 'uint256' },
			{ internalType: 'uint256', name: 'fee', type: 'uint256' },
			{ internalType: 'uint256', name: 'limitMin0', type: 'uint256' },
			{ internalType: 'uint256', name: 'limitMax0', type: 'uint256' },
			{ internalType: 'uint256', name: 'limitMin1', type: 'uint256' },
			{ internalType: 'uint256', name: 'limitMax1', type: 'uint256' }
		],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'address', name: 'pair', type: 'address' },
			{ internalType: 'bool', name: 'inverted', type: 'bool' }
		],
		name: 'getPriceByPairAddress',
		outputs: [
			{ internalType: 'uint8', name: 'xDecimals', type: 'uint8' },
			{ internalType: 'uint8', name: 'yDecimals', type: 'uint8' },
			{ internalType: 'uint256', name: 'price', type: 'uint256' }
		],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'address', name: 'tokenIn', type: 'address' },
			{ internalType: 'address', name: 'tokenOut', type: 'address' }
		],
		name: 'getPriceByTokenAddresses',
		outputs: [{ internalType: 'uint256', name: 'price', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'address', name: '_factory', type: 'address' },
			{ internalType: 'address', name: '_delay', type: 'address' },
			{ internalType: 'address', name: '_weth', type: 'address' }
		],
		name: 'initialize',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [],
		name: 'initialized',
		outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [{ internalType: 'address', name: '', type: 'address' }],
		name: 'isPairEnabled',
		outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
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
			{ internalType: 'address', name: 'tokenIn', type: 'address' },
			{ internalType: 'address', name: 'tokenOut', type: 'address' },
			{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }
		],
		name: 'quoteBuy',
		outputs: [{ internalType: 'uint256', name: 'amountIn', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'address', name: 'tokenIn', type: 'address' },
			{ internalType: 'address', name: 'tokenOut', type: 'address' },
			{ internalType: 'uint256', name: 'amountIn', type: 'uint256' }
		],
		name: 'quoteSell',
		outputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{
				components: [
					{ internalType: 'address', name: 'tokenIn', type: 'address' },
					{ internalType: 'address', name: 'tokenOut', type: 'address' },
					{ internalType: 'uint256', name: 'amountIn', type: 'uint256' },
					{ internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
					{ internalType: 'bool', name: 'wrapUnwrap', type: 'bool' },
					{ internalType: 'address', name: 'to', type: 'address' },
					{ internalType: 'uint32', name: 'submitDeadline', type: 'uint32' }
				],
				internalType: 'struct ITwapRelayer.SellParams',
				name: 'sellParams',
				type: 'tuple'
			}
		],
		name: 'sell',
		outputs: [{ internalType: 'uint256', name: 'orderId', type: 'uint256' }],
		stateMutability: 'payable',
		type: 'function'
	},
	{
		inputs: [{ internalType: 'address', name: '_delay', type: 'address' }],
		name: 'setDelay',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [{ internalType: 'uint256', name: 'gasCost', type: 'uint256' }],
		name: 'setEthTransferGasCost',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [{ internalType: 'uint256', name: 'limit', type: 'uint256' }],
		name: 'setExecutionGasLimit',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [{ internalType: 'uint256', name: 'multiplier', type: 'uint256' }],
		name: 'setGasPriceMultiplier',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
		name: 'setOwner',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'address', name: 'pair', type: 'address' },
			{ internalType: 'bool', name: 'enabled', type: 'bool' }
		],
		name: 'setPairEnabled',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'address', name: 'pair', type: 'address' },
			{ internalType: 'uint256', name: 'fee', type: 'uint256' }
		],
		name: 'setSwapFee',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'address', name: 'token', type: 'address' },
			{ internalType: 'uint256', name: 'multiplier', type: 'uint256' }
		],
		name: 'setTokenLimitMaxMultiplier',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'address', name: 'token', type: 'address' },
			{ internalType: 'uint256', name: 'limit', type: 'uint256' }
		],
		name: 'setTokenLimitMin',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'address', name: 'pair', type: 'address' },
			{ internalType: 'uint16', name: '_tolerance', type: 'uint16' }
		],
		name: 'setTolerance',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'address', name: 'pair', type: 'address' },
			{ internalType: 'uint32', name: 'interval', type: 'uint32' }
		],
		name: 'setTwapInterval',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [{ internalType: 'address', name: '', type: 'address' }],
		name: 'swapFee',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [{ internalType: 'address', name: '', type: 'address' }],
		name: 'tokenLimitMaxMultiplier',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [{ internalType: 'address', name: '', type: 'address' }],
		name: 'tokenLimitMin',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [{ internalType: 'address', name: '', type: 'address' }],
		name: 'tolerance',
		outputs: [{ internalType: 'uint16', name: '', type: 'uint16' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [{ internalType: 'address', name: '', type: 'address' }],
		name: 'twapInterval',
		outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [],
		name: 'weth',
		outputs: [{ internalType: 'address', name: '', type: 'address' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'address', name: 'token', type: 'address' },
			{ internalType: 'uint256', name: 'amount', type: 'uint256' },
			{ internalType: 'address', name: 'to', type: 'address' }
		],
		name: 'withdraw',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{ stateMutability: 'payable', type: 'receive' }
]
