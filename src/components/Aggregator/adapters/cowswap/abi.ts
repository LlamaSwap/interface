export const ABI = {
	nativeSwap: [
		{
			inputs: [
				{
					components: [
						{ internalType: 'contract IERC20', name: 'buyToken', type: 'address' },
						{ internalType: 'address', name: 'receiver', type: 'address' },
						{ internalType: 'uint256', name: 'sellAmount', type: 'uint256' },
						{ internalType: 'uint256', name: 'buyAmount', type: 'uint256' },
						{ internalType: 'bytes32', name: 'appData', type: 'bytes32' },
						{ internalType: 'uint256', name: 'feeAmount', type: 'uint256' },
						{ internalType: 'uint32', name: 'validTo', type: 'uint32' },
						{ internalType: 'bool', name: 'partiallyFillable', type: 'bool' },
						{ internalType: 'int64', name: 'quoteId', type: 'int64' }
					],
					internalType: 'struct EthFlowOrder.Data',
					name: 'order',
					type: 'tuple'
				}
			],
			name: 'createOrder',
			outputs: [{ internalType: 'bytes32', name: 'orderHash', type: 'bytes32' }],
			stateMutability: 'payable',
			type: 'function'
		}
	],
	settlement: [
		{
			anonymous: false,
			inputs: [{ indexed: true, internalType: 'address', name: 'solver', type: 'address' }],
			name: 'Settlement',
			type: 'event'
		},
		{
			anonymous: false,
			inputs: [
				{ indexed: true, internalType: 'address', name: 'owner', type: 'address' },
				{ indexed: false, internalType: 'contract IERC20', name: 'sellToken', type: 'address' },
				{ indexed: false, internalType: 'contract IERC20', name: 'buyToken', type: 'address' },
				{ indexed: false, internalType: 'uint256', name: 'sellAmount', type: 'uint256' },
				{ indexed: false, internalType: 'uint256', name: 'buyAmount', type: 'uint256' },
				{ indexed: false, internalType: 'uint256', name: 'feeAmount', type: 'uint256' },
				{ indexed: false, internalType: 'bytes', name: 'orderUid', type: 'bytes' }
			],
			name: 'Trade',
			type: 'event'
		}
	]
};
