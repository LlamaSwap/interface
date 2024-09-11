import { estimateGas, sendTransaction } from 'wagmi/actions';
import { config } from '~/components/WalletProvider';

export async function sendTx(txObject: any) {
	if (txObject.data === '0x' || typeof txObject.to !== 'string') {
		throw new Error('Malformed tx'); // Should never happen
	}
	if (txObject.gasLimit === undefined) {
		const gasPrediction = await estimateGas(config, txObject);
		console.log({ gasPrediction });
		txObject.gasLimit = (gasPrediction * 14n) / 10n; // Increase gas +40%
	}
	return sendTransaction(config, txObject);
}
