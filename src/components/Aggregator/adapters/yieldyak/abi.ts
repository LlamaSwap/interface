export const ABI = [
	{
		inputs: [
			{ internalType: 'uint256', name: '_amountIn', type: 'uint256' },
			{ internalType: 'address', name: '_tokenIn', type: 'address' },
			{ internalType: 'address', name: '_tokenOut', type: 'address' },
			{ internalType: 'uint256', name: '_maxSteps', type: 'uint256' },
			{ internalType: 'uint256', name: '_gasPrice', type: 'uint256' }
		],
		name: 'findBestPathWithGas',
		outputs: [
			{
				components: [
					{ internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' },
					{ internalType: 'address[]', name: 'adapters', type: 'address[]' },
					{ internalType: 'address[]', name: 'path', type: 'address[]' },
					{ internalType: 'uint256', name: 'gasEstimate', type: 'uint256' }
				],
				internalType: 'struct YakRouter.FormattedOfferWithGas',
				name: '',
				type: 'tuple'
			}
		],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{
				components: [
					{ internalType: 'uint256', name: 'amountIn', type: 'uint256' },
					{ internalType: 'uint256', name: 'amountOut', type: 'uint256' },
					{ internalType: 'address[]', name: 'path', type: 'address[]' },
					{ internalType: 'address[]', name: 'adapters', type: 'address[]' }
				],
				internalType: 'struct YakRouter.Trade',
				name: '_trade',
				type: 'tuple'
			},
			{ internalType: 'address', name: '_to', type: 'address' },
			{ internalType: 'uint256', name: '_fee', type: 'uint256' }
		],
		name: 'swapNoSplit',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [
			{
				components: [
					{ internalType: 'uint256', name: 'amountIn', type: 'uint256' },
					{ internalType: 'uint256', name: 'amountOut', type: 'uint256' },
					{ internalType: 'address[]', name: 'path', type: 'address[]' },
					{ internalType: 'address[]', name: 'adapters', type: 'address[]' }
				],
				internalType: 'struct YakRouter.Trade',
				name: '_trade',
				type: 'tuple'
			},
			{ internalType: 'address', name: '_to', type: 'address' },
			{ internalType: 'uint256', name: '_fee', type: 'uint256' }
		],
		name: 'swapNoSplitFromAVAX',
		outputs: [],
		stateMutability: 'payable',
		type: 'function'
	},
	{
		inputs: [
			{
				components: [
					{ internalType: 'uint256', name: 'amountIn', type: 'uint256' },
					{ internalType: 'uint256', name: 'amountOut', type: 'uint256' },
					{ internalType: 'address[]', name: 'path', type: 'address[]' },
					{ internalType: 'address[]', name: 'adapters', type: 'address[]' }
				],
				internalType: 'struct YakRouter.Trade',
				name: '_trade',
				type: 'tuple'
			},
			{ internalType: 'address', name: '_to', type: 'address' },
			{ internalType: 'uint256', name: '_fee', type: 'uint256' }
		],
		name: 'swapNoSplitToAVAX',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	}
];
