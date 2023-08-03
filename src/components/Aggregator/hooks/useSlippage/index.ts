import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { abi } from './abi';
import { ceil, get, range, set } from 'lodash';

const amountPosition = {
	unoswap: 2,
	swap: '[1].5',
	uniswapV3Swap: 1,
	uniswapV3SwapTo: 3
};

const LATEST_SWAP_API = 'https://api.llama.fi/getLatestSwap/';

const getSlippage = async (tokenA: string, tokenB: string) => {
	const latestSwap = await fetch(`${LATEST_SWAP_API}?tokenA=${tokenA}&tokenB=${tokenB}`).then((r) => r.json());
	if (!latestSwap?.slippage) return null;
	console.log(latestSwap);
	const defaultSlippage = +latestSwap?.slippage;
	const slippageToTry = range(0, defaultSlippage * 2, defaultSlippage / 20).map((num) => ceil(num, 4));
	const prov = new ethers.providers.JsonRpcProvider('https://eth.llamarpc.com');
	const [_, txHash] = latestSwap.txUrl?.split('tx/');
	const tx = await prov.getTransaction(txHash);
	const iface = new ethers.utils.Interface(abi);
	const contract = new ethers.Contract(tx.to, abi, prov);

	const functionName = iface.getFunction(tx.data.slice(0, 10)).name;
	const res = await Promise.all(
		slippageToTry.map(async (slippage) => {
			const decodedArgs = iface.decodeFunctionData(tx.data.slice(0, 10), tx.data);
			const newArgs = Array.from(decodedArgs).map((arg) => (Array.isArray(arg) ? Array.from(arg) : arg));
			const amountPos = amountPosition[functionName];
			const returnAmount = get(newArgs, amountPos);

			const newAmount = returnAmount.mul(((100 + slippage) * 10000).toFixed(0)).div(1000000);

			set(newArgs, amountPos, newAmount);

			const args = await contract.populateTransaction[functionName](...newArgs);

			const newTx = {
				to: tx.to,
				data: args.data,
				from: tx.from
			};
			const result = await prov.send('trace_call', [newTx, ['trace', 'stateDiff'], tx.blockNumber - 1]);

			return [result, newAmount.toString(), returnAmount.toString()];
		})
	);

	const [trace, newReturn, prevReturn] = res.reverse().find((result) => result[0].trace[0]?.error !== 'Reverted') || [];
	const newSlippage = ceil(defaultSlippage - (newReturn / prevReturn - 1) * 100, 4); // method 1
	const maxSlippage = (defaultSlippage * newReturn) / prevReturn; // method 2
	console.log(
		{ newSlippage, maxSlippage, defaultSlippage },
		trace,
		newReturn,
		prevReturn,
		(newReturn / prevReturn - 1) * 100
	);

	console.log(res, functionName);
};

const useSlippage = (token0: string, token1: string) => {
	const res = useQuery(['slippage', token0, token1], () => getSlippage(token0, token1));

	return res;
};

export default useSlippage;
