import { estimateGas, sendTransaction } from 'wagmi/actions';
import { config } from '../../WalletProvider';

export async function sendTx(txObject: any) {
	if (txObject.data === '0x' || typeof txObject.to !== 'string') {
		throw new Error('Malformed tx'); // Should never happen
	}
	if (txObject.gas === undefined) {
		const gasPrediction = await estimateGas(config, txObject).catch(() => null);

		if (gasPrediction) {
			txObject.gas = (gasPrediction * 14n) / 10n; // Increase gas +40%
		}
	}

	return sendTransaction(config, txObject);
}
