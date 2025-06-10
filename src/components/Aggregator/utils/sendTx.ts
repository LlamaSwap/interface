import { estimateGas, sendTransaction, sendCalls } from 'wagmi/actions';
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

export async function sendMultipleTxs(calls: any[]) {
	try {
		const swaptxObj = calls[calls.length - 1];

		if (swaptxObj.data === '0x' || typeof swaptxObj.to !== 'string') {
			throw new Error('Malformed tx'); // Should never happen
		}

		if (swaptxObj.gas === undefined) {
			const gasPrediction = await estimateGas(config, swaptxObj).catch(() => null);

			if (gasPrediction) {
				swaptxObj.gas = (gasPrediction * 14n) / 10n; // Increase gas +40%
			}
		}

		return sendCalls(config, { calls: calls.length === 0 ? [swaptxObj] : [calls[0], swaptxObj] });
	} catch (error) {
		console.log(error);
		throw new Error(error instanceof Error ? error.message : 'Unknown error');
	}
}
