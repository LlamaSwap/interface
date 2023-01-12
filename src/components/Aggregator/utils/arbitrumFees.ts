import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { providers } from '../rpcs';

export async function applyArbitrumFees(to: string, data: string, gas: string) {
    const nodeInterface = new ethers.Contract("0x00000000000000000000000000000000000000C8",
        ["function gasEstimateL1Component(address to,bool contractCreation,bytes calldata data) external view returns (uint64 gasEstimateForL1,uint256 baseFee,uint256 l1BaseFeeEstimate)"],
        providers.arbitrum);
    const gasData = await nodeInterface.gasEstimateL1Component(to, false, data);
    gas = BigNumber(gas).plus(gasData.gasEstimateForL1.toNumber()).toFixed(0, 1);
    return gas
}