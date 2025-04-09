import { useQuery } from '@tanstack/react-query';
import { erc20Abi, zeroAddress } from 'viem';
import { chainIdToName, wrappedTokensByChain } from '~/components/Aggregator/constants';
import { getBalance, readContract } from 'wagmi/actions';
import { config } from '~/components/WalletProvider';

type Balances = Record<string, any>;

function scramble(str: string) {
	return str.split('').reduce((a, b) => {
		return a + String.fromCharCode(b.charCodeAt(0) + 2);
	}, '');
}

async function getTokensBalancesAndPrices(address:string, chainId:any, chainName:string){
	const balances: any = await fetch(
		`https://peluche.llamao.fi/balances?addresses=${address}&chainId=${chainId}&type=erc20`,
		{
			headers:{
				"x-api-key": scramble('_RqMaPV5)37j3HUOp41RbJrqOoq4wi6eB_J64fjiLrsKL?hhe_h_r0wh7fgEOh_d')
			}
		}
	).then((r) => r.json());

	const gasToken = chainName + ":" + zeroAddress
	const tokensToPrice:string[] = balances.balances.filter(b=>b.whitelist).map(a=>chainName + ":" + a.address).concat(gasToken)
	const pricePromises:any[] = []
	for(let i=0; i<tokensToPrice.length; i+=100){
		pricePromises.push(fetch(`https://coins.llama.fi/prices/current/${
			tokensToPrice.slice(i, i+100).join(',')
		}`).then((r) => r.json()))
	}

	const prices = (await Promise.all(pricePromises)).reduce((all, prom)=>({
		...all,
		...prom.coins
	}), {})
	
	return {balances, prices}
}

const getBalances = async (address, chainId): Promise<Balances> => {
	if (!address || !chainId) return {};

	try {
		const chainName = chainIdToName(chainId)

		const [{balances, prices}, gasBalance, wrappedTokenBalance] = await Promise.all([
			getTokensBalancesAndPrices(address, chainId, chainName!).catch(() => {
				return {balances: { balances: [] }, prices: { coins: {} }}
			}),
			getBalance(config, {
				address: address as `0x${string}`,
				chainId
			}).catch(e=>null),
			wrappedTokensByChain[chainId] ? readContract(config, {
				address: wrappedTokensByChain[chainId] as `0x${string}`,
				abi: erc20Abi,
				functionName: 'balanceOf',
				args: [address as `0x${string}`],
				chainId
			}).catch(e=>null) : null
		])

		const finalBalances = balances.balances.concat([{
			total_amount: gasBalance?.value?.toString(),
			address: zeroAddress
		}]).reduce((all: Balances, t: any) => {
			const price = prices[`${chainName}:${t.address}`] ?? {}
			all[t.address.toLowerCase()] = {
				decimals: price.decimals,
				symbol: price.symbol ?? 'UNKNOWN',
				price: price.price,
				amount: t.total_amount,
				balanceUSD: price.price !== undefined && t.total_amount != null ? price.price*t.total_amount/(10**price.decimals) : 0
			};
			return all;
		}, {});

		if (wrappedTokenBalance){
			const price = prices[`${chainName}:${zeroAddress}`] ?? {}
			finalBalances[wrappedTokensByChain[chainId].toLowerCase()] = {
				decimals:  price.decimals,
				symbol: `W${price.symbol}`,
				price: price.price,
				amount: wrappedTokenBalance.toString(),
				balanceUSD: price.price !== undefined ? price.price*Number(wrappedTokenBalance)/(10**price.decimals) : 0
			}
		}

		return finalBalances
	} catch(e) {
		console.log(`Couldn't find balances for ${chainId}:${address}`, e)
		return {};
	}
};

export const useTokenBalances = (address, chain) => {
	return useQuery<Balances>({
		queryKey: ['balances', address, chain],
		queryFn: () => getBalances(address, chain),
		staleTime: 60 * 1000,
		refetchInterval: 60 * 1000
	});
};
