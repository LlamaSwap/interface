import { approvalAddress, chainToId } from './1inch';
import fetch from 'node-fetch';

export async function testApprovalAddresses() {
	await Promise.all(
		Object.keys(chainToId).map(async (chain) => {
			const { address: tokenApprovalAddress } = await fetch(
				`https://api.1inch.dev/swap/v6.0/${chainToId[chain]}/approve/spender`,
				{
					headers: { 'Authorization': "Bearer " + process.env.INCH_API_KEY! }
				}
			).then((r) => r.json());
			if (tokenApprovalAddress !== approvalAddress(chain)) {
				console.log(`Address for ${chain} is wrong`);
			}
		})
	);
}
testApprovalAddresses();
