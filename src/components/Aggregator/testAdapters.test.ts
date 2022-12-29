import { chainsMap } from "./constants";
import { adapters, getAllChains } from "./router";
import { getTokenList } from "./getTokenList"
import { BigNumber, ethers } from "ethers";
import { redirectQuoteReq } from "./adapters/utils";
import { nativeTokens } from './nativeTokens';

/*
Test matrix
    - All chains
    - With wallet connected and without
    - Tokens and native gas coin

Checks:
    - Output amount is similar to other aggregators
    - Gas cost is not too low
*/

// Ghetto-mutex for rate limiting since we are testing 2*3*24 = 144 combinations
const locks = [] as ((value: unknown) => void)[];
function getLock() {
    return new Promise((resolve) => {
        locks.push(resolve);
    });
}
function releaseLock() {
    const firstLock = locks.shift();
    if (firstLock !== undefined) {
        firstLock(null);
    }
}
const CONCURRENT_TESTS = 5;

export async function testAdapters(addTest: (test: any) => void) {
    const allChains = getAllChains().map(c => c.value)
    const allTokenlists = (await getTokenList()).props.tokenlist
    setTimeout(() => new Array(CONCURRENT_TESTS).fill(null).map(releaseLock), 1e3); // Release locks in 1 sec
    await Promise.all(allChains.map(async chain => {
        const tokenlist = allTokenlists[chainsMap[chain]];
        if (tokenlist === undefined) {
            console.warn(`There's no tokenlist for ${chain}`)
            return
        }
        const [_maybeNativeToken, token1, token2] = tokenlist;
        const nativeToken = nativeTokens.find(t => t.chainId === chainsMap[chain])
        const tokenCombinations = [
            // [from, to]
            [nativeToken, token1],
            [token2, nativeToken],
            [token1, token2]
        ]
        await Promise.all(tokenCombinations.map(async tokens => {
            const fromAddresses = [
                ethers.constants.AddressZero,
                "0x000000000000000000000000000000000000dEaD", // Just used as a random address that has tokens (so we dont get balance errors)
            ]
            await Promise.all(fromAddresses.map(async userAddress => {
                await getLock()
                const amount = "100" + "000000000000000000" //100e18 -> 100 tokens
                const fromToken = tokens[0]
                const toToken = tokens[1]
                const extra = {
                    gasPriceData: {
                        gasPrice: BigNumber.from("0x05d21dba00") // for yield yak, hardcoded to 25 nAVAX which was avax's gas price when I write this
                    },
                    userAddress,
                    amount, // idk why this is here lol
                    fromToken,
                    toToken,
                    slippage: 1,
                    isPrivacyEnabled: false,
                }
                const prices = (await Promise.all(adapters
                    .filter((adap) => adap.chainToId[chain] !== undefined)
                    .map(async adapter => {
                        const testParams = { 
                            chain, 
                            from: fromToken.symbol, 
                            to: toToken.symbol,
                            userAddress: userAddress === ethers.constants.AddressZero,
                            privacy: extra.isPrivacyEnabled,
                            adapter:adapter.name,
                        }
                        try {
                            let price
                            if (extra.isPrivacyEnabled) {
                                price = await redirectQuoteReq(adapter.name, chain, fromToken.address, toToken.address, amount, extra);
                            } else {
                                price = await adapter.getQuote(chain, fromToken.address, toToken.address, amount, {
                                    ...extra
                                });
                            }
                            if(Number(price.estimatedGas)<1000 && adapter.name !== "CowSwap"){
                                addTest({...testParams, price, success: "gas"})
                            }
                            return { price, adapter: adapter.name, testParams }
                        } catch (e) {
                            addTest({...testParams, success: "x"})
                            console.error(`Failed to get data for ${adapter.name} on ${chain}`)
                        }
                    })
                )).filter(p=>p!==undefined)
                const reportUnder = (property:string)=>{
                    if(prices.length<2) return
                    const sorted = prices.sort((a,b)=>b.price[property] - a.price[property])
                    const mid = Math.round(prices.length/2)
                    const median = Number(sorted[mid].price[property])
                    prices.forEach(p=>{
                        if(property === "estimatedGas" && p.adapter === "CowSwap") return
                        const value = Number(p.price[property])
                        if(value < 0.8 * median){
                            addTest({...p.testParams, success: property, value, median, drop: 100*(median-value)/median})
                        }
                    })
                }
                reportUnder("amountReturned")
                reportUnder("estimatedGas")
                releaseLock()
            }))
        }))
    }))
}