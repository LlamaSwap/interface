import { ethers } from 'ethers';
import { checkGnosisSafe } from '~/queries/useIsGnosisSafe';

export async function sendTx(signer: ethers.Signer, chain: string, txObject: any) {
	const address = await signer.getAddress();
	const { isGnosisSafeApp } = await checkGnosisSafe(address, chain);
	if (txObject.data === '0x' || typeof txObject.to !== 'string') {
		throw new Error('Malformed tx'); // Should never happen
	}
	if (txObject.gasLimit === undefined) {
		const gasPrediction = await signer.estimateGas(txObject);
		txObject.gasLimit = gasPrediction.mul(14).div(10); // Increase gas +40%
	}
	// return encoded tx for gnosis safe batch transaction
	if (isGnosisSafeApp) return txObject;
	return signer.sendTransaction(txObject);
}
