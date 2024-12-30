import { IToken } from '~/types';
import { useGetRoutes } from './useGetRoutes';

const USDT_ON_ALL_CHAINS = {
	'1': '0xdac17f958d2ee523a2206206994597c13d831ec7',
	'10': '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
	'25': '0x66e428c3f67a68878562e79a0234c1f83c208770',
	'40': '0x975ed13fa16857e83e7c493c7741d556eaad4a3f',
	'42': '0x07de306ff27a2b630b1141956844eb1552b956b5',
	'56': '0x55d398326f99059ff775485246999027b3197955',
	'65': '0xe579156f9decc4134b5e3a30a24ac46bb8b01281',
	'66': '0x382bb369d343125bfb2117af9c149795c6c65c50',
	'97': '0x337610d27c682e347c9cd60bd4b3b107c9d34ddd',
	'100': '0x4ecaba5870353805a9f068101a40e0f32ed605c6',
	'106': '0xb44a9b6905af7c801311e8f4e76932ee959c663c',
	'122': '0xfadbbf8ce7d5b7041be672561bba99f79c532e10',
	'137': '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
	'250': '0xcc1b99ddac1a33c201a742a1851662e87bc7f22c',
	'288': '0x5de1677344d3cb0d7d465c10b72a8f60699c062d',
	'324': '0x493257fd37edb34451f62edf8d2a0c418852ba4c',
	'369': '0x0cb6f5a34ad42ec934882a05265a7d5f59b51a2f',
	'1101': '0x1e4a5963abfd975d8c9021ce480b42188849d41d',
	'1116': '0x900101d06a7426441ae63e9ab3b9b0f63be145f1',
	'1284': '0x8e70cd5b4ff3f62659049e74b6649c6603a0e594',
	'5000': '0x201eba5cc46d216ce6dc03f6a759e8e766e956ae',
	'7700': '0xd567b3d7b8fe3c79a1ad8da978812cfc4fa05e75',
	'8453': '0xfde4c96c8593536e31f229ea8f37b2ada2699bb2',
	'11235': '0x5ad523d94efb56c400941eb6f34393b84c75ba39',
	'34443': '0xf0f161fda2712db8b566946122a5af183995e2ed',
	'42161': '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
	'42170': '0x52484e1ab2e2b22420a25c20fa49e173a26202cd',
	'42220': '0x88eec49252c8cbc039dcdb394c0c2ba2f1637ea0',
	'42262': '0xfffd69e757d8220cea60dc80b9fe1a30b58c94f3',
	'43114': '0xde3a24028580884448a5397872046a019649b084',
	'56288': '0x1e633dcd0d3d349126983d58988051f7c62c543d',
	'59144': '0xa219439258ca9da29e9cc4ce5596924745e12b93',
	'80001': '0x3813e82e6f7098b9583fc0f33a962d02018b6803',
	'534352': '0xf55bec9cafdbe8730f096aa55dad6d22d44099df',
	'2046399126': '0x1c0491e3396ad6a35f061c62387a95d7218fc515'
};

export interface IGetListRoutesProps {
	chain?: {
		id: any;
		value: string;
		label: string;
		chainId: number;
		logoURI?: string | null | undefined;
	} | null;
	chainId?: string | null;
	to?: IToken | null;
	extra?: any | null;
	disabledAdapters?: Array<string>;
	customRefetchInterval?: number;
}

export const useGetRateOfPricing = ({ chain, to, ...props }: IGetListRoutesProps) => {
	const data = useGetRoutes({
		chain: chain?.value,
		from: chain && USDT_ON_ALL_CHAINS[chain.chainId],
		to: to?.value,
		amount: String(1 * 10 ** 6),
		disabledAdapters: props.disabledAdapters,
		extra: { ...props.extra, amount: '1', fromToken: chain && USDT_ON_ALL_CHAINS[chain.chainId], toToken: to?.value }
	});
    
	const price =
		to && data.data?.[0]?.price?.amountReturned ? data.data[0].price.amountReturned / 10 ** to.decimals : null;

	return price ? Number((1 / price).toFixed(2)) : null;
};

