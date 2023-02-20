import { BigNumber, ethers } from "ethers";
import { providers } from "../../rpcs";
import { sendTx } from "../../utils/sendTx";
import { encode } from "./encode";

export const name = 'LlamaZip';
export const token = 'none';

export const chainToId = {
  optimism: '0x6f9d14Cf4A06Dd9C70766Bd161cf8d4387683E1b',
};

// https://docs.uniswap.org/contracts/v3/reference/deployments
const quoter = {
  optimism: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
}

const weth = {
  optimism: "0x4200000000000000000000000000000000000006"
}

// Smaller token first, addresses always in lowercase
const pairs = {
  "0x4200000000000000000000000000000000000006": {
    ["0x7F5c764cBc14f9669B88837ca1490cCa17c31607".toLowerCase()]: {
      fee: "500",
      pairId: "0",
    },
    ["0x4200000000000000000000000000000000000042".toLowerCase()]: {
      fee: "3000",
      pairId: "1",
    },
    // pool 3 is ignored because we already have one with same tokens
    ["0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4".toLowerCase()]: {
      fee: "3000",
      pairId: "5",
    },
    ["0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1".toLowerCase()]: {
      fee: "3000",
      pairId: "6",
    },
  },
  "0x4200000000000000000000000000000000000042": {
    ["0x7F5c764cBc14f9669B88837ca1490cCa17c31607".toLowerCase()]: {
      fee: "3000",
      pairId: "2",
    },
  },
  ["0x7F5c764cBc14f9669B88837ca1490cCa17c31607".toLowerCase()]: {
    ["0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1".toLowerCase()]: {
      fee: "100",
      pairId: "4",
    },
  }
}

function normalize(token:string, weth:string){
  return (token === ethers.constants.AddressZero ? weth : token).toLowerCase()
}

// https://docs.uniswap.org/sdk/v3/guides/quoting
export async function getQuote(chain: string, from: string, to: string, amount: string, extra: any) {
  if (to.toLowerCase() === weth[chain].toLowerCase()) {
    return {} // We don't support swaps to WETH
  }
  const provider = providers[chain];
  const quoterContract = new ethers.Contract(quoter[chain], 
    ["function quoteExactInputSingle(address tokenIn,address tokenOut,uint24 fee,uint256 amountIn,uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)"],
    provider);

  const tokenFrom = normalize(from, weth[chain]);
  const tokenTo = normalize(to, weth[chain]);

  const token0isTokenIn = BigNumber.from(tokenFrom).lt(tokenTo)
  const pair = pairs[token0isTokenIn?tokenFrom:tokenTo]?.[token0isTokenIn?tokenTo:tokenFrom]
  if(pair === undefined){
    return {}
  }

  const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
    tokenFrom,
    tokenTo,
    pair.fee,
    amount,
    0
  )

  const inputIsETH = from === ethers.constants.AddressZero;
  const calldata = encode(pair.pairId, token0isTokenIn, quotedAmountOut, extra.slippage ?? '0.5', inputIsETH, false, amount)
  if (calldata.length > (256 / 4 + 2)) {
    return {} // LlamaZip doesn't support calldata that's bigger than one EVM word
  }

  return {
    amountReturned: quotedAmountOut.toString(),
    estimatedGas: 200e3.toString(), // random approximation
    rawQuote: {
      tx: {
        to: chainToId[chain],
        data: calldata,
        ...(inputIsETH ? { value: amount } : {}),
      }
    },
    tokenApprovalAddress: chainToId[chain],
    logo: 'https://raw.githubusercontent.com/DefiLlama/memes/master/bussin.jpg'
  };
}

export async function swap({ signer, rawQuote, chain }) {
  const fromAddress = await signer.getAddress();
	const tx = await sendTx(signer, chain, {
		from: fromAddress,
		to: rawQuote.tx.to,
		data: rawQuote.tx.data,
		value: rawQuote.tx.value,
	});
	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.tx?.data;

export const getTx = ({ rawQuote }) => rawQuote?.tx;
