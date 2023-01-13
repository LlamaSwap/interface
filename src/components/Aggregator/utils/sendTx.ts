import { ethers } from "ethers";

export async function sendTx(signer:ethers.Signer, chain:string, txObject:any){
    if(txObject.data === "0x" || typeof txObject.to !== "string"){
        throw new Error("Malformed tx") // Should never happen
    }
    if(txObject.gasLimit === undefined){
        const gasPrediction = await signer.estimateGas(txObject)
        txObject.gasLimit = gasPrediction.mul(14).div(10) // Increase gas +40%
    }
    return signer.sendTransaction(txObject);
}