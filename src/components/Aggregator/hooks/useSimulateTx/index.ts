import { useQueries, UseQueryOptions } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { erc20ABI } from 'wagmi';
import { IRoute } from '~/queries/useGetRoutes';
import { ABI } from './abi';

const traceRpcs = {
	// https://docs.blastapi.io/blast-documentation/trace-api
	ethereum: 'https://eth-mainnet.blastapi.io/cfee5a54-245d-411b-ba94-da15d5437e88',
	bsc: 'https://bsc-mainnet.blastapi.io/cfee5a54-245d-411b-ba94-da15d5437e88',
	gnosis: 'https://gnosis-mainnet.blastapi.io/cfee5a54-245d-411b-ba94-da15d5437e88',
	// moonbeam: 'https://moonbeam.blastapi.io/cfee5a54-245d-411b-ba94-da15d5437e88', // we don't support it
	moonriver: 'https://moonriver.blastapi.io/cfee5a54-245d-411b-ba94-da15d5437e88',
	//palm: 'https://palm-mainnet.blastapi.io/cfee5a54-245d-411b-ba94-da15d5437e88', // we don't support it
	polygon: 'https://polygon.llamarpc.com'
};

const balanceContract = {
	ethereum: '0xEC4f843FF28BD18988b78c0d327A814edb5c25A0',
	polygon: '0x912E2E7B65C4a7CF568F23D73aa3D226BdC3DE1A',
	bsc: '0xEAFf422A8575aAE37DF4eA3252D6eC601537c236',
	moonriver: '0x3a0973a70c45790b96F6e87442eba2BD3E6CdFab',
	gnosis: '0xd78309257d63b60Db3247e1650735CbB37268132'
	// moonbeam: '0x3a0973a70c45790b96F6e87442eba2BD3E6CdFab'
};

export const simulateTx = async ({ route, token, userAddress, chain, balance, toToken }) => {
	if (!Number.isFinite(balance) || balance < +route.fromAmount) return null;

	try {
		const provider = new ethers.providers.JsonRpcProvider(traceRpcs[chain]);

		const tokenContract = new ethers.Contract(token, erc20ABI, provider);
		const toTokenContract = new ethers.Contract(toToken, erc20ABI, provider);
		const nativeBalanceContract = new ethers.Contract(balanceContract[chain], ABI.getBalance, provider);

		const tx = route?.tx;
		const isNative = token === ethers.constants.AddressZero;
		const isToNative = toToken === ethers.constants.AddressZero;
		try {
			const approveTx = isNative
				? null
				: {
						...(await tokenContract.populateTransaction.approve(
							route.price.tokenApprovalAddress,
							'0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
						)),
						from: userAddress
				  };
			const balanceOfTx = isToNative
				? { ...(await nativeBalanceContract.populateTransaction.balanceOf(userAddress)) }
				: { ...(await toTokenContract.populateTransaction.balanceOf(userAddress)) };
			const callParams = [
				[balanceOfTx, approveTx, tx, balanceOfTx].filter(Boolean).map((txData, i) => [
					{
						from: userAddress,
						to: txData.to,
						data: txData.data,
						...(isNative && i === 1 ? { value: '0x' + BigNumber(route.fromAmount).toString(16) } : {})
					},
					['trace']
				]),
				'latest'
			];
			const res = await provider.send('trace_callMany', callParams);
			const swapTx = res[res.length - 2];
			const prevBalance = res[0];
			const afterBalance = res[res.length - 1];
			const outputAmount = BigNumber(afterBalance.output).minus(prevBalance.output);

			return {
				gas: (Number(swapTx.trace[0].result.gasUsed) + 21e3).toString(), // ignores calldata and accesslist costs
				isFailed: swapTx.trace[0]?.error === 'Reverted' || outputAmount.lte(0),
				aggGas: route.price?.estimatedGas,
				name: route.name,
				estimatedOutput: outputAmount.toString()
			};
		} catch (e) {
			console.log(e);
			return null;
		}
	} catch (ee) {
		console.log(ee);
	}
};

type EstimationRes = Awaited<ReturnType<typeof simulateTx>>;

export const useSimulateTx = ({
	routes,
	token,
	userAddress,
	chain,
	balance,
	isOutput,
	toToken,
	isRouteLoaded
}: {
	routes: Array<IRoute>;
	token: string;
	userAddress: string;
	chain: string;
	balance: number;
	isOutput: boolean;
	toToken: string;
	isRouteLoaded: boolean;
}) => {
	const res = useQueries({
		queries: routes
			.filter((route) => !!route?.tx?.to)
			.map<UseQueryOptions<Awaited<ReturnType<typeof simulateTx>>>>((route) => {
				return {
					queryKey: ['simulateTx', route.name, chain, route?.tx?.data, balance, toToken],
					queryFn: () => simulateTx({ route, token, userAddress, chain, balance, toToken }),
					enabled:
						traceRpcs[chain] !== undefined &&
						(chain === 'polygon' && isOutput ? false : true) &&
						!!userAddress &&
						isRouteLoaded // TODO: figure out why it doesn't work
				};
			})
	});

	const data =
		res
			?.filter((r) => r.status === 'success' && !!r.data && r.data.gas)
			.reduce((acc, r) => ({ ...acc, [r.data.name]: r.data }), {} as Record<string, EstimationRes>) ?? {};
	return {
		isLoading: res.some((r) => r.status === 'loading') || traceRpcs[chain] === undefined,
		data
	};
};
