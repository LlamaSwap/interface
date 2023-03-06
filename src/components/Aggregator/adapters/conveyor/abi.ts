export const ABI = [
	{
		inputs: [{ internalType: 'address', name: '_weth', type: 'address' }],
		stateMutability: 'nonpayable',
		type: 'constructor'
	},
	{
		inputs: [
			{ internalType: 'uint256', name: 'amountOut', type: 'uint256' },
			{ internalType: 'uint256', name: 'expectedAmountOut', type: 'uint256' }
		],
		name: 'InsufficientOutputAmount',
		type: 'error'
	},
	{
		inputs: [],
		name: 'CONVEYOR_SWAP_EXECUTOR',
		outputs: [{ internalType: 'address', name: '', type: 'address' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [],
		name: 'WETH',
		outputs: [{ internalType: 'address', name: '', type: 'address' }],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'address', name: 'tokenIn', type: 'address' },
			{ internalType: 'uint256', name: 'amountIn', type: 'uint256' },
			{ internalType: 'address', name: 'tokenOut', type: 'address' },
			{ internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
			{
				components: [
					{ internalType: 'address', name: 'tokenInDestination', type: 'address' },
					{
						components: [
							{ internalType: 'address', name: 'target', type: 'address' },
							{ internalType: 'bytes', name: 'callData', type: 'bytes' }
						],
						internalType: 'struct ConveyorSwapAggregator.Call[]',
						name: 'calls',
						type: 'tuple[]'
					}
				],
				internalType: 'struct ConveyorSwapAggregator.SwapAggregatorMulticall',
				name: 'swapAggregatorMulticall',
				type: 'tuple'
			}
		],
		name: 'swap',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'address', name: 'tokenOut', type: 'address' },
			{ internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
			{
				components: [
					{ internalType: 'address', name: 'tokenInDestination', type: 'address' },
					{
						components: [
							{ internalType: 'address', name: 'target', type: 'address' },
							{ internalType: 'bytes', name: 'callData', type: 'bytes' }
						],
						internalType: 'struct ConveyorSwapAggregator.Call[]',
						name: 'calls',
						type: 'tuple[]'
					}
				],
				internalType: 'struct ConveyorSwapAggregator.SwapAggregatorMulticall',
				name: 'swapAggregatorMulticall',
				type: 'tuple'
			}
		],
		name: 'swapExactEthForToken',
		outputs: [],
		stateMutability: 'payable',
		type: 'function'
	},
	{
		inputs: [
			{ internalType: 'address', name: 'tokenIn', type: 'address' },
			{ internalType: 'uint256', name: 'amountIn', type: 'uint256' },
			{ internalType: 'uint256', name: 'amountOutMin', type: 'uint256' },
			{
				components: [
					{ internalType: 'address', name: 'tokenInDestination', type: 'address' },
					{
						components: [
							{ internalType: 'address', name: 'target', type: 'address' },
							{ internalType: 'bytes', name: 'callData', type: 'bytes' }
						],
						internalType: 'struct ConveyorSwapAggregator.Call[]',
						name: 'calls',
						type: 'tuple[]'
					}
				],
				internalType: 'struct ConveyorSwapAggregator.SwapAggregatorMulticall',
				name: 'swapAggregatorMulticall',
				type: 'tuple'
			}
		],
		name: 'swapExactTokenForEth',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{ stateMutability: 'payable', type: 'receive' }
];
