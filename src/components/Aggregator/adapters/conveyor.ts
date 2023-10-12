//Source: https://docs.conveyor.finance/api/

import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { applyArbitrumFees } from '../utils/arbitrumFees';
import { sendTx } from '../utils/sendTx';

export const name = 'Conveyor';
export const token = null;

const api = 'https://api.conveyor.finance/';
const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export const chainToId = {
    ethereum: 1,
    bsc: 56,
    polygon: 137,
    optimism: 10,
    arbitrum: 42161,
    base: 8453
};

const chainToRouter = {
    ethereum: '0x3642189b7754302df84b6f3fe1ae34d2026647a7', //https://etherscan.io/address/0x3642189b7754302df84b6f3fe1ae34d2026647a7
    bsc: '0x3642189b7754302df84b6f3fe1ae34d2026647a7', //https://bscscan.com/address/0x3642189b7754302df84b6f3fe1ae34d2026647a7
    polygon: '0x3642189b7754302df84b6f3fe1ae34d2026647a7', //https://polygonscan.com/address/0x3642189b7754302df84b6f3fe1ae34d2026647a7
    arbitrum: '0x3642189b7754302df84b6f3fe1ae34d2026647a7', //https://arbiscan.io/address/0x3642189b7754302df84b6f3fe1ae34d2026647a7
    optimism: '0x3642189b7754302df84b6f3fe1ae34d2026647a7', //https://optimistic.etherscan.io/address/0x3642189b7754302df84b6f3fe1ae34d2026647a7
    base: '0x3642189b7754302df84b6f3fe1ae34d2026647a7' //https://basescan.org/address/0x3642189b7754302df84b6f3fe1ae34d2026647a7
};

export function approvalAddress(chain: string) {
    return chainToRouter[chain];
}
export async function getQuote(chain: string, from: string, to: string, amount: string, extra) {
    const tokenFrom = from === ethers.constants.AddressZero ? nativeToken : from;
    const tokenTo = to === ethers.constants.AddressZero ? nativeToken : to;
    const receiver = extra.userAddress || ethers.constants.AddressZero;
    const tokenApprovalAddress = approvalAddress(chain);
    let payload = {
        tokenIn: tokenFrom,
        tokenOut: tokenTo,
        tokenInDecimals: extra.fromToken?.decimals,
        tokenOutDecimals: extra.toToken?.decimals,
        amountIn: amount,
        slippage: BigNumber(Number(extra.slippage) * 100).toString(),
        chainId: chainToId[chain],
        recipient: receiver,
        referrer: extra.referrer ?? '0'
    };

    const resp = await fetch(api, {
        method: 'POST',
        body: JSON.stringify(payload)
    })
        .then((r) => r.json())
        .then((r) => r.body);
    const estimatedGas = resp.tx.gas || 0;

    let gas = estimatedGas;
    if (chain === 'arbitrum') {
        gas = resp.tx.data === null ? null : await applyArbitrumFees(resp.tx.to, resp.tx.data, gas);
    }

    return {
        amountReturned: resp.info.amountOut,
        tokenApprovalAddress,
        estimatedGas: gas,
        rawQuote: {
            ...resp.tx,
            tx: {
                data: resp.tx.data,
                from: receiver,
                value: resp.tx.value,
                gasLimit: BigNumber(1.1).times(gas).toFixed(0, 1)
            }
        },
        logo: ''
    };
}

export async function swap({ signer, rawQuote, chain }) {
    const txObj = {
        from: rawQuote.tx.from,
        to: rawQuote.to,
        data: rawQuote.tx.data,
        value: rawQuote.tx.value
    };
    const tx = await sendTx(signer, chain, {
        ...txObj,
        gasLimit: rawQuote.tx.gasLimit
    });
    return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.tx?.data;

export const getTx = ({ rawQuote }) => {
    if (rawQuote === null) {
        return {};
    }
    return {
        from: rawQuote.tx.from,
        to: rawQuote.tx.to,
        data: rawQuote.tx.data,
        value: rawQuote.tx.value
    };
};
