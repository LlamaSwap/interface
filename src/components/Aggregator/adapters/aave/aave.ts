import { sendTx } from '../../utils/sendTx';
import { ethers, Signer } from 'ethers';
import { Interface } from 'ethers/lib/utils.js';
import { providers } from '../../rpcs';
import abi from './abi.json';
import { Underline } from 'react-feather';

export const chainToId = {
	ethereum: 1,
	bsc: 56,
	polygon: 137,
	optimism: 10,
	arbitrum: 42161,
	gnosis: 100,
	avax: 43114,
	base: 8453,
	scroll: 534352,
	metis: 1088
};

export const name = 'aave';
export const token = 'aave';
export const referral = false;

type Token = {
	address: string;
	underlying: string;
	underlyingAToken: string;
};

// inlining pairs so we don't need npm dependencies
// it might make sense to provide an api in a next iteration
// helperscript to generate the pairs
// console.log(
// 	JSON.stringify(
// 		tokenlist.tokens
// 			.filter((t) => t.tags.includes('stataToken'))
// 			.reduce((acc, token) => {
// 				if (!acc[token.chainId]) acc[token.chainId] = [];
// 				acc[token.chainId].push({
// 					address: token.address,
// 					underlying: token.extensions.underlying,
// 					underlyingAToken: token.extensions.underlyingAToken
// 				});
// 				return acc;
// 			}, {} as Record<number, Token[]>)
// 	)
// );
const pairs: Record<number, Token[]> = {
	'1': [
		{
			address: '0x252231882FB38481497f3C767469106297c8d93b',
			underlying: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
			underlyingAToken: '0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8'
		},
		{
			address: '0x322AA5F5Be95644d6c36544B6c5061F072D16DF5',
			underlying: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
			underlyingAToken: '0x0B925eD163218f6662a35e0f0371Ac234f9E9371'
		},
		{
			address: '0x73edDFa87C71ADdC275c2b9890f5c3a8480bC9E6',
			underlying: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
			underlyingAToken: '0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c'
		},
		{
			address: '0xaf270C38fF895EA3f95Ed488CEACe2386F038249',
			underlying: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
			underlyingAToken: '0x018008bfb33d285247A21d44E50697654f754e63'
		},
		{
			address: '0x862c57d48becB45583AEbA3f489696D22466Ca1b',
			underlying: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
			underlyingAToken: '0x23878914EFE38d27C4D67Ab83ed1b93A74D4086a'
		},
		{
			address: '0xDBf5E36569798D1E39eE9d7B1c61A7409a74F23A',
			underlying: '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',
			underlyingAToken: '0x3Fe6a295459FAe07DF8A0ceCC36F37160FE86AA9'
		},
		{
			address: '0xEE66abD4D0f9908A48E08AE354B0f425De3e237E',
			underlying: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
			underlyingAToken: '0xd4e245848d6E1220DBE62e155d89fa327E43CB06'
		},
		{
			address: '0x848107491E029AFDe0AC543779c7790382f15929',
			underlying: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
			underlyingAToken: '0xb82fa9f31612989525992FCfBB09AB22Eff5c85A'
		},
		{
			address: '0x00F2a835758B33f3aC53516Ebd69f3dc77B0D152',
			underlying: '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8',
			underlyingAToken: '0x0C0d01AbF3e6aDfcA0989eBbA9d6e85dD58EaB1E'
		}
	],
	'10': [
		{
			address: '0x6dDc64289bE8a71A707fB057d5d07Cc756055d6e',
			underlying: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
			underlyingAToken: '0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE'
		},
		{
			address: '0x39BCf217ACc4Bf2fCaF7BC8800E69D986912c75e',
			underlying: '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6',
			underlyingAToken: '0x191c10Aa4AF7C30e871E70C95dB0E4eb77237530'
		},
		{
			address: '0x9F281eb58fd98ad98EDe0fc4C553AD4D73e7Ca2C',
			underlying: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
			underlyingAToken: '0x625E7708f30cA75bfd92586e17077590C60eb4cD'
		},
		{
			address: '0x6d998FeEFC7B3664eaD09CAf02b5a0fc2E365F18',
			underlying: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
			underlyingAToken: '0x078f358208685046a11C85e8ad32895DED33A249'
		},
		{
			address: '0x98d69620C31869fD4822ceb6ADAB31180475FD37',
			underlying: '0x4200000000000000000000000000000000000006',
			underlyingAToken: '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8'
		},
		{
			address: '0x035c93db04E5aAea54E6cd0261C492a3e0638b37',
			underlying: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
			underlyingAToken: '0x6ab707Aca953eDAeFBc4fD23bA73294241490620'
		},
		{
			address: '0xae0Ca1B1Bc6cac26981B5e2b9c40f8Ce8A9082eE',
			underlying: '0x76FB31fb4af56892A25e32cFC43De717950c9278',
			underlyingAToken: '0xf329e36C7bF6E5E86ce2150875a84Ce77f477375'
		},
		{
			address: '0x3A956E2Fcc7e71Ea14b0257d40BEbdB287d19652',
			underlying: '0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9',
			underlyingAToken: '0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97'
		},
		{
			address: '0xd4F1Cf9A038269FE8F03745C2875591Ad6438ab1',
			underlying: '0x4200000000000000000000000000000000000042',
			underlyingAToken: '0x513c7E3a9c69cA3e22550eF58AC1C0088e918FFf'
		},
		{
			address: '0xb972abef80046A57409e37a7DF5dEf2638917516',
			underlying: '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb',
			underlyingAToken: '0xc45A479877e1e9Dfe9FcD4056c699575a1045dAA'
		},
		{
			address: '0x84648dc3Cefb601bc28a49A07a1A8Bad04D30Ad3',
			underlying: '0xc40F949F8a4e094D1b49a23ea9241D289B7b2819',
			underlyingAToken: '0x8Eb270e296023E9D92081fdF967dDd7878724424'
		},
		{
			address: '0x60495bC8D8Baf7E866888ecC00491e37B47dfF24',
			underlying: '0xdFA46478F9e5EA86d57387849598dbFB2e964b02',
			underlyingAToken: '0x8ffDf2DE812095b1D19CB146E4c004587C0A0692'
		},
		{
			address: '0xf9ce3c97b4b54F3D16861420f4816D9f68190B7B',
			underlying: '0x9Bcef72be871e61ED4fBbc7630889beE758eb81D',
			underlyingAToken: '0x724dc807b04555b71ed48a6896b6F41593b8C637'
		},
		{
			address: '0x4DD03dfD36548C840B563745e3FBeC320F37BA7e',
			underlying: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
			underlyingAToken: '0x38d693cE1dF5AaDF7bC62595A37D667aD57922e5'
		}
	],
	'56': [
		{
			address: '0x3854354CE3681da1D7F550073061E92a4a7d1B27',
			underlying: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
			underlyingAToken: '0x4199CC1F5ed0d796563d7CcB2e036253E2C18281'
		},
		{
			address: '0x436baCb4C66583de4Cb16e13a1A0D9A3075DE425',
			underlying: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
			underlyingAToken: '0x9B00a09492a626678E5A3009982191586C444Df9'
		},
		{
			address: '0x1F66b530084079d35478A069d9c4424F9c9C320c',
			underlying: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
			underlyingAToken: '0x56a7ddc4e848EbF43845854205ad71D5D5F72d3D'
		},
		{
			address: '0x52077433fB7053D747E2846aD0C18ff5015C368E',
			underlying: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
			underlyingAToken: '0x2E94171493fAbE316b6205f1585779C887771E2F'
		},
		{
			address: '0x3906cDdfb781f02B21f21BD81ed7Fd8DC37075E1',
			underlying: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
			underlyingAToken: '0x00901a076785e0906d1028c7d6372d247bec7d61'
		},
		{
			address: '0x0471D185cc7Be61E154277cAB2396cD397663da6',
			underlying: '0x55d398326f99059fF775485246999027B3197955',
			underlyingAToken: '0xa9251ca9DE909CB71783723713B21E4233fbf1B1'
		},
		{
			address: '0x4d074aAa0821073dA827f7bf6a02cF905b394ed0',
			underlying: '0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409',
			underlyingAToken: '0x75bd1A659bdC62e4C313950d44A2416faB43E785'
		}
	],
	'100': [
		{
			address: '0xD843FB478c5aA9759FeA3f3c98D467e2F136190a',
			underlying: '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1',
			underlyingAToken: '0xa818F1B57c201E092C4A2017A91815034326Efd1'
		},
		{
			address: '0xECfD0638175e291BA3F784A58FB9D38a25418904',
			underlying: '0x6C76971f98945AE98dD7d4DFcA8711ebea946eA6',
			underlyingAToken: '0x23e4E76D01B2002BE436CE8d6044b0aA2f68B68a'
		},
		{
			address: '0x2D737e2B0e175f05D0904C208d6C4e40da570f65',
			underlying: '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb',
			underlyingAToken: '0xA1Fa064A85266E2Ca82DEe5C5CcEC84DF445760e'
		},
		{
			address: '0x270bA1f35D8b87510D24F693fcCc0da02e6E4EeB',
			underlying: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
			underlyingAToken: '0xc6B7AcA6DE8a6044E0e32d0c841a89244A10D284'
		},
		{
			address: '0x7f0EAE87Df30C468E0680c83549D0b3DE7664D4B',
			underlying: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
			underlyingAToken: '0xd0Dd6cEF72143E22cCED4867eb0d5F2328715533'
		},
		{
			address: '0x8418D17640a74F1614AC3E1826F29e78714488a1',
			underlying: '0xcB444e90D8198415266c6a2724b7900fb12FC56E',
			underlyingAToken: '0xEdBC7449a9b594CA4E053D9737EC5Dc4CbCcBfb2'
		},
		{
			address: '0xf3f45960f8dE00D8ED614D445a5a268c6F6Dec4f',
			underlying: '0xaf204776c7245bF4147c2612BF6e5972Ee483701',
			underlyingAToken: '0x7a5c3860a77a8DC1b225BD46d0fb2ac1C6D191BC'
		}
	],
	'137': [
		{
			address: '0x83c59636e602787A6EEbBdA2915217B416193FcB',
			underlying: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
			underlyingAToken: '0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE'
		},
		{
			address: '0x37868a45c6741616F9E5a189dC0481AD70056B6a',
			underlying: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39',
			underlyingAToken: '0x191c10Aa4AF7C30e871E70C95dB0E4eb77237530'
		},
		{
			address: '0x1017F4a86Fc3A3c824346d0b8C5e96A5029bDAf9',
			underlying: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
			underlyingAToken: '0x625E7708f30cA75bfd92586e17077590C60eb4cD'
		},
		{
			address: '0xbC0f50CCB8514Aa7dFEB297521c4BdEBc9C7d22d',
			underlying: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
			underlyingAToken: '0x078f358208685046a11C85e8ad32895DED33A249'
		},
		{
			address: '0xb3D5Af0A52a35692D3FcbE37669b3B8C31dddE7D',
			underlying: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
			underlyingAToken: '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8'
		},
		{
			address: '0x87A1fdc4C726c459f597282be639a045062c0E46',
			underlying: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
			underlyingAToken: '0x6ab707Aca953eDAeFBc4fD23bA73294241490620'
		},
		{
			address: '0xCA2E1E33E5BCF4978E2d683656E1f5610f8C4A7E',
			underlying: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
			underlyingAToken: '0xf329e36C7bF6E5E86ce2150875a84Ce77f477375'
		},
		{
			address: '0x98254592408E389D1dd2dBa318656C2C5c305b4E',
			underlying: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
			underlyingAToken: '0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97'
		},
		{
			address: '0x4356941463eD4d75381AC23C9EF799B5d7C52AD8',
			underlying: '0x172370d5Cd63279eFa6d502DAB29171933a610AF',
			underlyingAToken: '0x513c7E3a9c69cA3e22550eF58AC1C0088e918FFf'
		},
		{
			address: '0xe3eDe71d32240b7EC355F0e5DD1131BBe029F934',
			underlying: '0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a',
			underlyingAToken: '0xc45A479877e1e9Dfe9FcD4056c699575a1045dAA'
		},
		{
			address: '0x123319636A6a9c85D9959399304F4cB23F64327e',
			underlying: '0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7',
			underlyingAToken: '0x8Eb270e296023E9D92081fdF967dDd7878724424'
		},
		{
			address: '0x1a8969FD39AbaF228e690B172C4C3Eb7c67F95E1',
			underlying: '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3',
			underlyingAToken: '0x8ffDf2DE812095b1D19CB146E4c004587C0A0692'
		},
		{
			address: '0x73B788ACA5f4F0EeB3c6Da453cDf31041a77b36D',
			underlying: '0x85955046DF4668e1DD369D2DE9f3AEB98DD2A369',
			underlyingAToken: '0x724dc807b04555b71ed48a6896b6F41593b8C637'
		},
		{
			address: '0x02E26888Ed3240BB38f26A2adF96Af9B52b167ea',
			underlying: '0xE111178A87A3BFf0c8d18DECBa5798827539Ae99',
			underlyingAToken: '0x38d693cE1dF5AaDF7bC62595A37D667aD57922e5'
		},
		{
			address: '0xD992DaC78Ef3F34614E6a7d325b7b6A320FC0AB5',
			underlying: '0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c',
			underlyingAToken: '0x6533afac2E7BCCB20dca161449A13A32D391fb00'
		},
		{
			address: '0xd3eb8796Ed36f58E03B7b4b5AD417FA74931d2c4',
			underlying: '0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4',
			underlyingAToken: '0x8437d7C167dFB82ED4Cb79CD44B7a32A1dd95c77'
		},
		{
			address: '0x8486B49433cCed038b51d18Ae3772CDB7E31CA5e',
			underlying: '0xa3Fa99A148fA48D14Ed51d610c367C61876997F1',
			underlyingAToken: '0xeBe517846d0F36eCEd99C735cbF6131e1fEB775D'
		},
		{
			address: '0x867A180B7060fDC27610dC9096E93534F638A315',
			underlying: '0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4',
			underlyingAToken: '0xEA1132120ddcDDA2F119e99Fa7A27a0d036F7Ac9'
		},
		{
			address: '0xbcDd5709641Af4BE99b1470A2B3A5203539132Ec',
			underlying: '0xfa68FB4628DFF1028CFEc22b4162FCcd0d45efb6',
			underlyingAToken: '0x80cA0d8C38d2e2BcbaB66aA1648Bd1C7160500FE'
		},
		{
			address: '0x5274453F4CD5dD7280011a1Cca3B9e1b78EC59A6',
			underlying: '0x03b54A6e9a984069379fae1a4fC4dBAE93B3bCCD',
			underlyingAToken: '0xf59036CAEBeA7dC4b86638DFA2E3C97dA9FcCd40'
		},
		{
			address: '0x2dCa80061632f3F87c9cA28364d1d0c30cD79a19',
			underlying: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
			underlyingAToken: '0xA4D94019934D8333Ef880ABFFbF2FDd611C762BD'
		}
	],
	'1088': [
		{
			address: '0x66a2E4cff95BDE6403Ed5541B396aA0B171e5509',
			underlying: '0x4c078361FC9BbB78DF910800A991C7c3DD2F6ce0',
			underlyingAToken: '0x85ABAdDcae06efee2CB5F75f33b6471759eFDE24'
		},
		{
			address: '0x5DE732A094A0ceF0eBFEcF0A916bDAB29650a784',
			underlying: '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',
			underlyingAToken: '0x7314Ef2CA509490f65F52CC8FC9E0675C66390b8'
		},
		{
			address: '0xb24451C231C6e6A60aC46f45E98a267caae898f4',
			underlying: '0xEA32A96608495e54156Ae48931A7c20f0dcc1a21',
			underlyingAToken: '0x885C8AEC5867571582545F894A5906971dB9bf27'
		},
		{
			address: '0xAAea6F041425B813760dA201d08d46487034A266',
			underlying: '0xbB06DCA3AE6887fAbF931640f67cab3e3a16F4dC',
			underlyingAToken: '0xd9fa75D14c26720d5ce7eE2530793a823e8f07b9'
		},
		{
			address: '0x2f1606864d6322c54b50a1762D4a1ca67f42d23d',
			underlying: '0x420000000000000000000000000000000000000A',
			underlyingAToken: '0x8acAe35059C9aE27709028fF6689386a44c09f3a'
		}
	],
	'8453': [
		{
			address: '0x468973e3264F2aEba0417A8f2cD0Ec397E738898',
			underlying: '0x4200000000000000000000000000000000000006',
			underlyingAToken: '0xD4a0e0b9149BCee3C920d2E00b5dE09138fd8bb7'
		},
		{
			address: '0x16A004065dfb11276DcB29Dc03fb8A85f9A43C6e',
			underlying: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
			underlyingAToken: '0xcf3D55c10DB69f28fD1A75Bd73f3D8A2d9c595ad'
		},
		{
			address: '0x6fCe2756794128B1771324caA860965801DCbCdB',
			underlying: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
			underlyingAToken: '0x0a1d576f3eFeF75b330424287a95A366e8281D54'
		},
		{
			address: '0x4EA71A20e655794051D1eE8b6e4A3269B13ccaCc',
			underlying: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
			underlyingAToken: '0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB'
		}
	],
	'42161': [
		{
			address: '0xc91c5297d7E161aCC74b482aAfCc75B85cc0bfeD',
			underlying: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
			underlyingAToken: '0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE'
		},
		{
			address: '0x27dE098EF2772386cBCf1a4c8BEb886368b7F9a9',
			underlying: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
			underlyingAToken: '0x191c10Aa4AF7C30e871E70C95dB0E4eb77237530'
		},
		{
			address: '0x0Bc9E52051f553E75550CA22C196bf132c52Cf0B',
			underlying: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
			underlyingAToken: '0x625E7708f30cA75bfd92586e17077590C60eb4cD'
		},
		{
			address: '0x32B95Fbe04e5a51cF99FeeF4e57Cf7e3FC9c5A93',
			underlying: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
			underlyingAToken: '0x078f358208685046a11C85e8ad32895DED33A249'
		},
		{
			address: '0x352F3475716261dCC991Bd5F2aF973eB3D0F5878',
			underlying: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
			underlyingAToken: '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8'
		},
		{
			address: '0xb165a74407fE1e519d6bCbDeC1Ed3202B35a4140',
			underlying: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
			underlyingAToken: '0x6ab707Aca953eDAeFBc4fD23bA73294241490620'
		},
		{
			address: '0x1C0c8EcED17aE093b3C1a1a8fFeBE2E9513a9346',
			underlying: '0xba5DdD1f9d7F570dc94a51479a000E3BCE967196',
			underlyingAToken: '0xf329e36C7bF6E5E86ce2150875a84Ce77f477375'
		},
		{
			address: '0x9a40747BE51185A416B181789B671E78a8d045dD',
			underlying: '0xD22a58f79e9481D1a88e00c343885A588b34b68B',
			underlyingAToken: '0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97'
		},
		{
			address: '0x7775d4Ae4Dbb79a624fB96AAcDB8Ca74F671c0DF',
			underlying: '0x5979D7b546E38E414F7E9822514be443A4800529',
			underlyingAToken: '0x513c7E3a9c69cA3e22550eF58AC1C0088e918FFf'
		},
		{
			address: '0xB4a0a2692D82301703B27082Cda45B083F68CAcE',
			underlying: '0x3F56e0c36d275367b8C502090EDF38289b3dEa0d',
			underlyingAToken: '0xc45A479877e1e9Dfe9FcD4056c699575a1045dAA'
		},
		{
			address: '0x68235105d6d33A19369D24b746cb7481FB2b34fd',
			underlying: '0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8',
			underlyingAToken: '0x8Eb270e296023E9D92081fdF967dDd7878724424'
		},
		{
			address: '0xDbB6314b5b07E63B7101844c0346309B79f8C20A',
			underlying: '0x93b346b6BC2548dA6A1E7d98E9a421B42541425b',
			underlyingAToken: '0x8ffDf2DE812095b1D19CB146E4c004587C0A0692'
		},
		{
			address: '0x7CFaDFD5645B50bE87d546f42699d863648251ad',
			underlying: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
			underlyingAToken: '0x724dc807b04555b71ed48a6896b6F41593b8C637'
		},
		{
			address: '0x89AEc2023f89E26Dbb7eaa7a98fe3996f9d112A8',
			underlying: '0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F',
			underlyingAToken: '0x38d693cE1dF5AaDF7bC62595A37D667aD57922e5'
		},
		{
			address: '0x9b5637d7952BC9fa2D693aAE51f3103760Bf2693',
			underlying: '0x912CE59144191C1204E64559FE8253a0e49E6548',
			underlyingAToken: '0x6533afac2E7BCCB20dca161449A13A32D391fb00'
		}
	],
	'43114': [
		{
			address: '0x02F3f6c8A432C1e49f3359d7d36887C25d8A5888',
			underlying: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
			underlyingAToken: '0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE'
		},
		{
			address: '0x8B773Ab77Dff01985D438961dBCE58382a70cA52',
			underlying: '0x5947BB275c521040051D82396192181b413227A3',
			underlyingAToken: '0x191c10Aa4AF7C30e871E70C95dB0E4eb77237530'
		},
		{
			address: '0xC509aB7bB4eDbF193b82264D499a7Fc526Cd01F4',
			underlying: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
			underlyingAToken: '0x625E7708f30cA75bfd92586e17077590C60eb4cD'
		},
		{
			address: '0xE3C0f42EAF1a4BFe37CbA105e5463564BA7730aE',
			underlying: '0x50b7545627a5162F82A992c33b87aDc75187B218',
			underlyingAToken: '0x078f358208685046a11C85e8ad32895DED33A249'
		},
		{
			address: '0xf8E24175D01653fd6AA203C2C17B1e4Dd1CA2731',
			underlying: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
			underlyingAToken: '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8'
		},
		{
			address: '0x5525Ee69BC1e354B356864187De486fab5AD67d7',
			underlying: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
			underlyingAToken: '0x6ab707Aca953eDAeFBc4fD23bA73294241490620'
		},
		{
			address: '0xac0746AfD13DEbe2a43a6c8745Fb83Fd2A2909cA',
			underlying: '0x63a72806098Bd3D9520cC43356dD78afe5D386D9',
			underlyingAToken: '0xf329e36C7bF6E5E86ce2150875a84Ce77f477375'
		},
		{
			address: '0x6A02C7a974F1F13A67980C80F774eC1d2eD8f98d',
			underlying: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
			underlyingAToken: '0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97'
		},
		{
			address: '0x4F059cA8a2a5BF8895Ee731f2E901cCB769FB95f',
			underlying: '0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE',
			underlyingAToken: '0x513c7E3a9c69cA3e22550eF58AC1C0088e918FFf'
		},
		{
			address: '0xA3c2ffE702F4cD265B2249AB5f84Fab81FFf6c73',
			underlying: '0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64',
			underlyingAToken: '0xc45A479877e1e9Dfe9FcD4056c699575a1045dAA'
		},
		{
			address: '0x08cC59E51BB0Bc322B4D251f7262dB864d6150ce',
			underlying: '0x5c49b268c9841AFF1Cc3B0a418ff5c3442eE3F3b',
			underlyingAToken: '0x8Eb270e296023E9D92081fdF967dDd7878724424'
		},
		{
			address: '0x34d768cc830c32DcD743321c09A2A702651bF9a2',
			underlying: '0x152b9d0FdC40C096757F570A51E494bd4b943E50',
			underlyingAToken: '0x8ffDf2DE812095b1D19CB146E4c004587C0A0692'
		}
	],
	'534352': [
		{
			address: '0x6b9DfaC194fa78a1882680E2cE19194D006AeEfd',
			underlying: '0x5300000000000000000000000000000000000004',
			underlyingAToken: '0xf301805bE1Df81102C957f6d4Ce29d2B8c056B2a'
		},
		{
			address: '0x9fA123bC7E6b61cC8a9D893673a4C6E5392FF4A7',
			underlying: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4',
			underlyingAToken: '0x1D738a3436A8C49CefFbaB7fbF04B660fb528CbD'
		},
		{
			address: '0x6e368c4dBf083e18a29aE63FC06AF9deDb3242F0',
			underlying: '0xf610A9dfB7C89644979b4A0f27063E9e7d7Cda32',
			underlyingAToken: '0x5B1322eeb46240b02e20062b8F0F9908d525B09c'
		}
	]
};

type Quote = {
	to: string;
	amount: string;
	toUnderlying?: boolean;
	fromUnderlying?: boolean;
	swapSide: SwapSide;
};

enum SwapSide {
	DEPOSIT,
	REDEEM
}

const stata = new Interface(abi);

export async function getQuote(chain: string, from: string, to: string, amount: string) {
	const chainId = chainToId[chain];
	const fromToken = pairs[chainId].find((token) => token.address.toLowerCase() === from.toLowerCase());
	const toToken = pairs[chainId].find((token) => token.address.toLowerCase() === to.toLowerCase());
	// no stata token
	if (!fromToken && !toToken) return null;
	const swapSide = fromToken ? SwapSide.REDEEM : SwapSide.DEPOSIT;
	let amountOut, estimatedGas, toUnderlying, fromUnderlying;
	if (swapSide === SwapSide.REDEEM) {
		const stataToken = new ethers.Contract(from, abi, providers[chain]);
		const toAToken = fromToken.underlyingAToken.toLowerCase() === to.toLowerCase();
		toUnderlying = fromToken.underlying.toLowerCase() === to.toLowerCase();
		// only direct redemptions are supported
		if (!toAToken && !toUnderlying) return null;
		amountOut = await stataToken.previewRedeem(amount);
		estimatedGas = toAToken ? 100_000 : 250_000;
	} else {
		const stataToken = new ethers.Contract(to, abi, providers[chain]);
		const fromAToken = toToken.underlyingAToken.toLowerCase() === from.toLowerCase();
		fromUnderlying = toToken.underlying.toLowerCase() === from.toLowerCase();
		// only direct deposits are supported
		if (!fromAToken && !fromUnderlying) return null;
		amountOut = await stataToken.previewDeposit(amount);
		estimatedGas = fromAToken ? 100_000 : 250_000;
	}
	return {
		amountReturned: amountOut,
		estimatedGas: estimatedGas,
		tokenApprovalAddress: swapSide === SwapSide.DEPOSIT ? to : undefined,
		rawQuote: { to, amount, toUnderlying, fromUnderlying, swapSide } as Quote
	};
}

export async function swap({ signer, rawQuote, chain }: { signer: Signer; rawQuote: Quote; chain: string }) {
	const from = await signer.getAddress();
	const txObject = {
		from: from,
		to: rawQuote.to,
		data:
			rawQuote.swapSide === SwapSide.DEPOSIT
				? stata.encodeFunctionData('deposit(uint256, address, uint16, bool)', [
						rawQuote.amount,
						from,
						0,
						rawQuote.fromUnderlying
				  ])
				: stata.encodeFunctionData('redeem(uint256, address, address, bool)', [
						rawQuote.amount,
						from,
						from,
						rawQuote.toUnderlying
				  ]),
		value: 0
	};
	const gasPrediction = await signer.estimateGas(txObject);
	const tx = await sendTx(signer, chain, {
		...txObject,
		gasLimit: gasPrediction.mul(12).div(10).add(86000)
	});
	return tx;
}
