import { estimateGas, sendTransaction, sendCalls } from 'wagmi/actions';
import { config } from '../../WalletProvider';

export async function sendTx(calls: any[]) {
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

		// use sendTransaction for single tx ,so we can get the status of swap by calling waitForTransactionReceipt()
		// return type is `0x${string}`
		if (calls.length === 1) {
			return sendTransaction(config, swaptxObj);
		}

		// return type is {id: `0x${string}`}
		return sendCalls(config, { calls: calls.slice(0, -1).concat([swaptxObj]) });
	} catch (error) {
		console.log(error);
		throw new Error(error instanceof Error ? error.message : 'Unknown error');
	}
}
