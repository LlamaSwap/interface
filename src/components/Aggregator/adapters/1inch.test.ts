import { approvalAddress, chainToId } from './1inch';
import fetch from 'node-fetch';

export async function testApprovalAddresses() {
	await Promise.all(
		Object.keys(chainToId).map(async (chain) => {
			const { address: tokenApprovalAddress } = await fetch(
				`https://api-defillama.1inch.io/v4.0/${chainToId[chain]}/approve/spender`,
				{
					headers: { 'auth-key': process.env.INCH_API_KEY! }
				}
			).then((r) => r.json());
			if (tokenApprovalAddress !== approvalAddress(chain)) {
				console.log(`Address for ${chain} is wrong`);
			}
		})
	);
}
testApprovalAddresses();
