import { ethers } from 'ethers';
import { keccak256 } from 'ethers/lib/utils';

export const DAI_LIKE_PERMIT = keccak256(
	ethers.utils.toUtf8Bytes('Permit(address holder,address spender,uint256 nonce,uint256 expiry,bool allowed)')
);

export const EIP2612_PERMIT = keccak256(
	ethers.utils.toUtf8Bytes('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)')
);

export const EIP2612_PERMIT_NO_NONCE = keccak256(
	ethers.utils.toUtf8Bytes('Permit(address owner,address spender,uint256 value,uint256 deadline)')
);

export const PERMIT_TYPES = {
	[DAI_LIKE_PERMIT]: {
		Permit: [
			{ name: 'holder', type: 'address' },
			{ name: 'spender', type: 'address' },
			{ name: 'nonce', type: 'uint256' },
			{ name: 'expiry', type: 'uint256' },
			{ name: 'allowed', type: 'bool' }
		]
	},
	[EIP2612_PERMIT]: {
		Permit: [
			{ name: 'owner', type: 'address' },
			{ name: 'spender', type: 'address' },
			{ name: 'value', type: 'uint256' },
			{ name: 'nonce', type: 'uint256' },
			{ name: 'deadline', type: 'uint256' }
		]
	},
	[EIP2612_PERMIT_NO_NONCE]: {
		Permit: [
			{ name: 'owner', type: 'address' },
			{ name: 'spender', type: 'address' },
			{ name: 'value', type: 'uint256' },
			{ name: 'deadline', type: 'uint256' }
		]
	}
};

const DOMAIN_WITH_VERSION = keccak256(
	ethers.utils.toUtf8Bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')
);

const DOMAIN_NO_VERSION = keccak256(
	ethers.utils.toUtf8Bytes('EIP712Domain(string name,uint256 chainId,address verifyingContract)')
);

export const createTypedData = (typeHash, userAddress, spender, amount, nonce, deadline) => {
	if (typeHash === DAI_LIKE_PERMIT) {
		return {
			holder: userAddress,
			spender,
			nonce: nonce,
			expiry: deadline,
			allowed: true
		};
	}

	if (typeHash === EIP2612_PERMIT_NO_NONCE) {
		return {
			owner: userAddress,
			spender,
			value: amount,
			deadline
		};
	}

	return {
		owner: userAddress,
		spender,
		value: amount,
		nonce: nonce,
		deadline
	};
};

const generateVersionDomainsSeparator = (name, tokenAddress, chainId = 1) => {
	const versions = ['1', '2', '3'];
	const res: Record<string, { name: string; chainId: number; verifyingContract: string; version: string }> = {};
	versions.forEach((v) => {
		const hash = keccak256(
			ethers.utils.defaultAbiCoder.encode(
				['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
				[
					DOMAIN_WITH_VERSION,
					keccak256(ethers.utils.toUtf8Bytes(name)),
					keccak256(ethers.utils.toUtf8Bytes(v)),
					chainId,
					tokenAddress
				]
			)
		);

		res[hash] = {
			name: 'kek',
			chainId,
			verifyingContract: tokenAddress,
			version: v
		};
	});
	return res;
};

const generateNoVersionDomainSeparator = (name, tokenAddress, chainId) => {
	const hash = keccak256(
		ethers.utils.defaultAbiCoder.encode(
			['bytes32', 'bytes32', 'uint256', 'address'],
			[DOMAIN_NO_VERSION, keccak256(ethers.utils.toUtf8Bytes(name)), chainId, tokenAddress]
		)
	);

	return { [hash]: { chainId, verifyingContract: tokenAddress } };
};

export const generateDomains = (name, tokenAddress, chainId = 1) => {
	const withVersion = generateVersionDomainsSeparator(name, tokenAddress, chainId);
	const withoutVersion = generateNoVersionDomainSeparator(name, tokenAddress, chainId);

	return { ...withVersion, ...withoutVersion };
};

export const generateCallParams = (typeHash, user, spender, deadline, amount = '0') => {
	if (typeHash === EIP2612_PERMIT_NO_NONCE) return [user, spender, amount, deadline];
	if (typeHash === DAI_LIKE_PERMIT) return [user, spender, deadline];

	return [user, spender, amount, deadline];
};
