import { BigNumber, ethers } from "ethers";
import { providers } from "../../rpcs";
import { sendTx } from "../../utils/sendTx";
import { encode } from "./encode";

export const name = 'LlamaZip';
export const token = 'none';

export const chainToId = {
  optimism: '0xF09Ea2e82EbAE3c06ECB579473748d4f27371E72',
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
  },
}

function normalize(token:string, weth:string){
  return (token === ethers.constants.AddressZero ? weth : token).toLowerCase()
}

// https://docs.uniswap.org/sdk/v3/guides/quoting
export async function getQuote(chain: string, from: string, to: string, amount: string, extra: any) {
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
  const slippage = BigNumber.from((100-Number(extra.slippage))*1e4)
  const calldata = encode(pair.pairId, token0isTokenIn, quotedAmountOut.mul(slippage).div(1e6), inputIsETH, false, amount)

  return {
    amountReturned: quotedAmountOut.toString(),
    estimatedGas: 200e3.toString(), // random approximation
    rawQuote: {
      tx: {
        to: chainToId[chain],
        data: calldata,
        ...(inputIsETH ? { value: amount } : {}),
        gasLimit: 300e3.toString()
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
		...(chain === 'optimism' && { gasLimit: rawQuote.tx.gasLimit })
	});
	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.tx?.data;

export const getTx = ({ rawQuote }) => rawQuote?.tx;