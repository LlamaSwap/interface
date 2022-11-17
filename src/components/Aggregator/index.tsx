import { useEffect, useState } from 'react';
import {
  useAccount,
  useBalance,
  useFeeData,
  useNetwork,
  useSigner,
  useSwitchNetwork,
} from 'wagmi';
import { groupBy, mapValues, merge, uniqBy } from 'lodash';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { ArrowRight } from 'react-feather';
import styled, { css } from 'styled-components';
import { createFilter } from 'react-select';
import { TYPE } from '~/Theme';
import ReactSelect from '~/components/MultiSelect';
import { ButtonDark } from '~/components/ButtonStyled';
import Tooltip from '~/components/Tooltip';
import FAQs from '~/components/FAQs';
import { getAllChains, listRoutes, swap } from './router';
import { Input, TokenInput } from './TokenInput';
import { CrossIcon, GasIcon } from './Icons';
import Loader from './Loader';
import Search from './Search';
import { useTokenApprove } from './hooks';
import { capitalizeFirstLetter } from '~/utils';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Image,
  Link,
  ModalFooter,
  Heading,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import txImg from '~/public/llamanote.png';
import { chainsMap } from './constants';

/*
Integrated:
- paraswap
- 0x
- 1inch
- cowswap
- kyberswap
- firebird (https://docs.firebird.finance/developer/api-specification)
- https://openocean.finance/
- airswap
- https://app.unidex.exchange/trading
- https://twitter.com/odosprotocol
- yieldyak
- https://defi.krystal.app/

- rook
- https://rubic.exchange/ - aggregates aggregators
- https://twitter.com/RangoExchange - api key requested, bridge aggregator, aggregates aggregators on same chain
- thorswap - aggregates aggregators that we already have
- lifi
- https://twitter.com/ChainHopDEX - only has 1inch
- https://twitter.com/MayanFinance

no api:
- https://twitter.com/HeraAggregator (no api)
- slingshot (no api)
- orion protocol
- autofarm.network/swap/
- https://swapr.eth.limo/#/swap?chainId=1 - aggregates aggregators + swapr

non evm:
- jupiter (solana)
- openocean (solana)
- https://twitter.com/prism_ag (solana)
- coinhall (terra)
- https://twitter.com/tfm_com (terra)

cant integrate:
- https://twitter.com/UniDexFinance - api broken (seems abandoned)
- https://bebop.xyz/ - not live
- VaporDex - not live
- https://twitter.com/hippolabs__ - not live
- dexguru - no api
- https://wowmax.exchange/alpha/ - still beta + no api
- https://twitter.com/RBXtoken - doesnt work
- https://www.bungee.exchange/ - couldnt use it
- wardenswap - no api + sdk is closed source
- https://twitter.com/DexibleApp - not an aggregator, only supports exotic orders like TWAP, segmented order, stop loss...
*/

const Body = styled.div<{ showRoutes: boolean }>`
  display: grid;
  grid-row-gap: 16px;
  transform: translateX(180px);
  padding-bottom: 4px;

  min-width: 30rem;
  max-width: 46rem;

  box-shadow: ${({ theme }) =>
    theme.mode === 'dark'
      ? '10px 0px 50px 10px rgba(26, 26, 26, 0.9);'
      : '10px 0px 50px 10px rgba(211, 211, 211, 0.9);;'};
  padding: 16px;
  border-radius: 16px;
  text-align: left;
  transition: all 0.66s ease-out;
  animation: ${(props) =>
    props.showRoutes === true
      ? 'slide-left 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both'
      : 'none'};

  @keyframes slide-left {
    0% {
      transform: translateX(180px);
    }
    100% {
      transform: translateX(0);
    }
  }
`;

const Wrapper = styled.div`
  width: 100%;
  text-align: center;
  display: grid;
  grid-row-gap: 36px;
  margin: 10px auto 40px;

  h1 {
    font-weight: 500;
  }
`;

const idToChain = Object.entries(chainsMap).reduce(
  (acc, [key, val]) => ({ ...acc, [val]: key }),
  {}
);

const oneInchChains = {
  ethereum: 1,
  bsc: 56,
  polygon: 137,
  optimism: 10,
  arbitrum: 42161,
  avax: 43114,
  gnosis: 100,
  fantom: 250,
  klaytn: 8217,
};

const formatOptionLabel = ({ label, ...rest }) => {
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ marginLeft: '10px', color: '#ccc' }}>
        <img
          src={rest.logoURI}
          style={{
            width: 20,
            height: 20,
            marginRight: 8,
            borderRadius: '50%',
          }}
        />
      </div>
      <div>{label}</div>
    </div>
  );
};

interface Route {
  name: string;
  price: {
    amountReturned: string;
    estimatedGas: string;
    tokenApprovalAddress: string;
    logo: string;
  };
  toToken: {
    address: string;
    logoURI: string;
    symbol: string;
    decimals: string;
  };
  fromToken: Route['toToken'];
  selectedChain: string;

  setRoute: () => void;
  selected: boolean;
  index: number;
  gasUsd: number;
  amountUsd: number;
  airdrop: boolean;
  amountFrom: string;
}

const RouteWrapper = styled.div<{ selected: boolean; best: boolean }>`
  display: grid;
  grid-row-gap: 8px;
  margin-top: 16px;

  background-color: ${({ theme, selected }) =>
    theme.mode === 'dark'
      ? selected
        ? ' #161616;'
        : '#2d3039;'
      : selected
      ? ' #bec1c7;'
      : ' #dde3f3;'};
  border: ${({ theme }) =>
    theme.mode === 'dark'
      ? '1px solid #373944;'
      : '1px solid #c6cae0;'};
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;

  animation: swing-in-left-fwd 0.5s
    cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
  @keyframes swing-in-left-fwd {
    0% {
      transform: rotateX(100deg);
      transform-origin: left;
      opacity: 0;
    }
    100% {
      transform: rotateX(0);
      transform-origin: left;
      opacity: 1;
    }
  }

  &:hover {
    background-color: ${({ theme }) =>
      theme.mode === 'dark' ? '#161616;' : '#b7b7b7;;'};
  }
`;

const RouteRow = styled.div`
  display: flex;
`;

const Balance = styled.div`
  text-align: right;
  padding-right: 4px;
  text-decoration: underline;
  margin-top: 4px;
  cursor: pointer;
`;

const Route = ({
  name,
  price,
  toToken,
  setRoute,
  selected,
  index,
  gasUsd,
  amountUsd,
  airdrop,
  fromToken,
  amountFrom,
}: Route) => {
  const { isApproved } = useTokenApprove(
    fromToken?.address,
    price?.tokenApprovalAddress as `0x${string}`,
    amountFrom
  );

  if (!price.amountReturned) return null;

  const amount = +price.amountReturned / 10 ** +toToken?.decimals;
  return (
    <RouteWrapper
      onClick={setRoute}
      selected={selected}
      best={index === 0}
    >
      <RouteRow>
        <img
          src={toToken?.logoURI}
          style={{
            width: 24,
            height: 24,
            marginRight: 8,
            borderRadius: '50%',
          }}
        />
        <TYPE.heading>
          {amount.toFixed(3)}{' '}
          {Number.isFinite(+amountUsd) ? `($${amountUsd})` : null}
        </TYPE.heading>
        <div style={{ marginLeft: 'auto', display: 'flex' }}>
          {name === 'CowSwap' ? (
            <Tooltip content="Gas is taken from output amount">
              <GasIcon />{' '}
              <div style={{ marginLeft: 8 }}>
                ${gasUsd.toFixed(3)}
              </div>
            </Tooltip>
          ) : (
            <>
              <GasIcon />{' '}
              <div style={{ marginLeft: 8 }}>
                ${gasUsd.toFixed(3)}
              </div>
            </>
          )}
        </div>
      </RouteRow>

      <RouteRow>
        {toToken.symbol} via {name}
        {airdrop ? (
          <Tooltip content="This project has no token and might airdrop one in the future">
            <span style={{ marginLeft: 4 }}>🪂</span>
          </Tooltip>
        ) : null}
        {isApproved ? (
          <Tooltip content="Token is approved for this aggregator.">
            <span style={{ marginLeft: 4 }}>🔓</span>
          </Tooltip>
        ) : null}
        {index === 0 ? (
          <div style={{ marginLeft: 'auto', display: 'flex' }}>
            {' '}
            <TYPE.heading style={{ color: '#3661c4' }}>
              Best Route{' '}
            </TYPE.heading>
          </div>
        ) : null}
      </RouteRow>
    </RouteWrapper>
  );
};

const Routes = styled.div<{ show: boolean; isFirstRender: boolean }>`
  padding: 16px;
  border-radius: 16px;
  text-align: left;
  overflow-y: scroll;
  min-width: 360px;
  max-height: 444px;
  min-width: 26rem;

  box-shadow: ${({ theme }) =>
    theme.mode === 'dark'
      ? '10px 0px 50px 10px rgba(26, 26, 26, 0.9);'
      : '10px 0px 50px 10px rgba(211, 211, 211, 0.9);'};

  ${(props) =>
    !props.isFirstRender &&
    css`
      animation: ${props.show === true
        ? 'tilt-in-fwd-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;'
        : 'tilt-in-fwd-out 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse both;'};
    `}

  animation: ${(props) =>
    props.show === true
      ? 'tilt-in-fwd-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;'
      : props.isFirstRender
      ? 'tilt-in-fwd-out 0.001s cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse both;'
      : 'tilt-in-fwd-out 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse both;'};

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */

  @keyframes tilt-in-fwd-in {
    0% {
      transform: rotateY(-20deg) rotateX(35deg)
        translate(-300px, -300px) skew(35deg, -10deg);
      opacity: 0;
    }
    100% {
      transform: rotateY(0) rotateX(0deg) translate(0, 0)
        skew(0deg, 0deg);
      opacity: 1;
    }
  }

  @keyframes tilt-in-fwd-out {
    0% {
      transform: rotateY(-20deg) rotateX(35deg)
        translate(-1000px, -1000px) skew(35deg, -10deg);
      opacity: 0;
    }
    100% {
      transform: rotateY(0) rotateX(0deg) translate(0, 0)
        skew(0deg, 0deg);
      opacity: 1;
    }
  }
`;
const BodyWrapper = styled.div`
  display: flex;
  gap: 16px;
  margin: 0 auto;
`;

const TokenSelect = styled.div`
  display: grid;
  grid-column-gap: 8px;
  margin-top: 16px;
  margin-bottom: 8px;
  grid-template-columns: 5fr 1fr 5fr;
`;

export const CloseBtn = ({ onClick }) => {
  return (
    <Close onClick={onClick}>
      <CrossIcon />
    </Close>
  );
};

interface Token {
  address: string;
  logoURI: string;
  symbol: string;
  decimals: string;
  name: string;
  chainId: number;
}

export async function getTokenList() {
  const uniList = await fetch('https://tokens.uniswap.org/').then(
    (r) => r.json()
  );
  const sushiList = await fetch('https://token-list.sushi.com/').then(
    (r) => r.json()
  );
  const oneInch = await Promise.all(
    Object.values(oneInchChains).map(async (chainId) =>
      fetch(`https://tokens.1inch.io/v1.1/${chainId}`).then((r) =>
        r.json()
      )
    )
  );
  const hecoList = await fetch('https://token-list.sushi.com/').then(
    (r) => r.json()
  );
  const lifiList = await fetch('https://li.quest/v1/tokens').then(
    (r) => r.json()
  );

  const oneInchList = Object.values(oneInchChains)
    .map((chainId, i) =>
      Object.values(oneInch[i]).map((token: { address: string }) => ({
        ...token,
        chainId,
      }))
    )
    .flat();

  const tokensByChain = mapValues(
    merge(
      groupBy(
        [
          ...oneInchList,
          ...sushiList.tokens,
          ...uniList.tokens,
          ...hecoList.tokens,
        ],
        'chainId'
      ),
      lifiList.tokens
    ),
    (val) =>
      uniqBy(val, (token: Token) => token.address.toLowerCase())
  );

  return {
    props: {
      tokenlist: tokensByChain,
    },
    revalidate: 5 * 60, // 5 minutes
  };
}

const TransactionModal = ({ open, setOpen, link }) => {
  return (
    <Modal
      closeOnOverlayClick={true}
      isOpen={open}
      onClose={() => setOpen(false)}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign={'center'}>
          Transaction submitted
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Image src={txImg.src} />
        </ModalBody>
        <ModalFooter justifyContent={'center'}>
          <Link
            href={link}
            isExternal
            fontSize={'lg'}
            textAlign={'center'}
          >
            View in explorer <ExternalLinkIcon mx="2px" />
          </Link>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

const FormHeader = styled.div`
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 4px;
  padding-left: 4px;
`;

const SelectWrapper = styled.div`
  border: ${({ theme }) =>
    theme.mode === 'dark'
      ? '2px solid #373944;'
      : '2px solid #c6cae0;'};
  border-radius: 16px;
  padding: 8px;
  padding-bottom: 16px;
`;

const Close = styled.span`
  position: absolute;
  right: 16px;
  cursor: pointer;
`;

const SwapWrapper = styled.div`
  width: 100%;
  display: flex;
  & > button {
    width: 100%;
    margin-right: 4px;
  }
`;

const InputFooter = styled.div`
  display: flex;
  justify-content: space-between;
`;

export function AggregatorContainer({ tokenlist }) {
  const chains = getAllChains();

  const { data: signer } = useSigner();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const [selectedChain, setSelectedChain] = useState(chains[0]);
  const [fromToken, setFromToken] = useState(null);
  const [toToken, setToToken] = useState(null);
  const [gasTokenPrice, setGasTokenPrice] = useState(0);
  const [toTokenPrice, setToTokenPrice] = useState(0);
  const [fromTokenPrice, setFromTokenPrice] = useState(0);

  const [slippage, setSlippage] = useState('1');

  const addRecentTransaction = useAddRecentTransaction();

  const { switchNetwork } = useSwitchNetwork();

  const [amount, setAmount] = useState('10');
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txUrl, setTxUrl] = useState('');

  const amountWithDecimals = BigNumber(amount)
    .times(10 ** (fromToken?.decimals || 18))
    .toFixed();

  const balance = useBalance({
    addressOrName: address,
    token:
      fromToken?.address === ethers.constants.AddressZero
        ? undefined
        : fromToken?.address,
    watch: true,
  });

  useEffect(() => {
    const currentChain = chain?.id;
    if (currentChain)
      setSelectedChain(
        chains.find(({ value }) => chainsMap[value] === currentChain)
      );
  }, [chain]);

  useEffect(() => {
    const nativeToken =
      tokenlist[chainsMap[selectedChain.value]]?.[0] || {};
    setFromToken({
      ...nativeToken,
      value: nativeToken.address,
      label: nativeToken.symbol,
    });
  }, [selectedChain, tokenlist]);

  const [isLoading, setLoading] = useState(false);

  const [renderNumber, setRenderNumber] = useState(1);

  const { data: gasPriceData } = useFeeData({
    chainId: chainsMap[selectedChain.value],
  });

  const tokensInChain = tokenlist[
    chainsMap[selectedChain.value]
  ]?.map((token) => ({
    ...token,
    value: token.address,
    label: token.symbol,
  }));

  const setTokens = (tokens) => {
    setFromToken(tokens.token0);
    setToToken(tokens.token1);
  };

  const [route, setRoute] = useState(null);
  const [routes, setRoutes] = useState(null);

  const handleSwap = () => {
    swap({
      chain: selectedChain.value,
      from: fromToken.value,
      to: toToken.value,
      amount: amountWithDecimals,
      signer,
      slippage,
      adapter: route.name,
      rawQuote: route?.price?.rawQuote,
      tokens: { fromToken, toToken },
    }).then((res) => {
      addRecentTransaction({
        hash: res.hash,
        description: `Swap transaction using ${route.name} is sent.`,
      });
      const explorerUrl = chain.blockExplorers.default.url;
      setTxModalOpen(true);

      setTxUrl(`${explorerUrl}/tx/${res.hash}`);
    });
  };

  useEffect(() => {
    if (fromToken && toToken && amount) {
      setRoutes(null);
      setLoading(true);
      setRoute(null);
      setRenderNumber((num) => num + 1);
      listRoutes(
        selectedChain.value,
        fromToken.value,
        toToken.value,
        amountWithDecimals,
        {
          gasPriceData,
          userAddress: address,
          amount,
          fromToken,
          toToken,
          slippage,
        },
        setRoutes
      ).finally(() => setLoading(false));
    }
  }, [
    fromToken,
    toToken,
    amount,
    selectedChain,
    address,
    gasPriceData,
    slippage,
  ]);

  useEffect(() => {
    if (fromToken || toToken)
      fetch(
        `https://coins.llama.fi/prices/current/${selectedChain.value}:${toToken?.address},${selectedChain.value}:${ZERO_ADDRESS},${selectedChain.value}:${fromToken?.address}`
      )
        .then((r) => r.json())
        .then(({ coins }) => {
          setGasTokenPrice(
            coins[`${selectedChain.value}:${ZERO_ADDRESS}`]?.price
          );
          setToTokenPrice(
            coins[`${selectedChain.value}:${toToken?.address}`]?.price
          );
          setFromTokenPrice(
            coins[`${selectedChain.value}:${fromToken?.address}`]
              ?.price
          );
        });
  }, [toToken, selectedChain, fromToken]);

  const cleanState = () => {
    setRenderNumber(0);
    setFromToken(null);
    setToToken(null);
    setRoutes(null);
    setRoute(null);
    setTxUrl('');
  };

  const { isApproved, approve, approveInfinite } = useTokenApprove(
    fromToken?.address,
    route?.price?.tokenApprovalAddress,
    amountWithDecimals
  );

  const onMaxClick = () => {
    if (balance?.data?.formatted) setAmount(balance?.data?.formatted);
  };

  const onChainChange = (newChain) => {
    cleanState();
    setSelectedChain(newChain);

    switchNetwork(chainsMap[newChain.value]);
  };

  const normalizedRoutes = [...(routes || [])]
    ?.map((route) => {
      const gasUsd =
        (gasTokenPrice *
          +route.price.estimatedGas *
          +gasPriceData?.formatted?.gasPrice) /
          1e18 || 0;
      const amount =
        +route.price.amountReturned / 10 ** +toToken?.decimals;
      const amountUsd = (amount * toTokenPrice).toFixed(2);
      const netOut = +amountUsd - gasUsd;

      return { route, gasUsd, amountUsd, amount, netOut, ...route };
    })
    .filter(
      ({ fromAmount, amount: toAmount }) =>
        Number(toAmount) && amountWithDecimals === fromAmount
    )
    .sort((a, b) => b.netOut - a.netOut);

  return (
    <Wrapper>
      <Heading>Meta-Aggregator</Heading>

      <TYPE.heading>
        This product is still WIP and not ready for public release
        yet. Please expect things to break and if you find anything
        broken please let us know in the{' '}
        <a
          style={{ textDecoration: 'underline' }}
          href="http://discord.gg/buPFYXzDDd"
        >
          defillama discord
        </a>
      </TYPE.heading>

      <BodyWrapper>
        <Body showRoutes={!!routes?.length || isLoading}>
          <div>
            <FormHeader>Chain</FormHeader>
            <ReactSelect
              options={chains}
              value={selectedChain}
              onChange={onChainChange}
              formatOptionLabel={formatOptionLabel}
            />
          </div>
          <SelectWrapper>
            <FormHeader>Select Tokens</FormHeader>
            <TokenSelect>
              <ReactSelect
                options={tokensInChain}
                value={fromToken}
                onChange={setFromToken}
                formatOptionLabel={formatOptionLabel}
                filterOption={createFilter({ ignoreAccents: false })}
              />
              <div>
                <ArrowRight
                  width={24}
                  height={24}
                  display="block"
                  style={{
                    marginTop: 8,
                    marginLeft: 8,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setFromToken(toToken);
                    setToToken(fromToken);
                  }}
                />
              </div>
              <ReactSelect
                options={tokensInChain}
                value={toToken}
                onChange={setToToken}
                formatOptionLabel={formatOptionLabel}
                filterOption={createFilter({ ignoreAccents: false })}
              />
            </TokenSelect>
            <div style={{ textAlign: 'center', margin: ' 8px 16px' }}>
              <TYPE.heading>OR</TYPE.heading>
            </div>
            <Search
              tokens={tokensInChain}
              setTokens={setTokens}
              onClick={() => setRoutes(null)}
            />
          </SelectWrapper>

          <div>
            <FormHeader>Amount In</FormHeader>
            <TokenInput
              setAmount={setAmount}
              amount={amount}
              onMaxClick={onMaxClick}
            />
            <InputFooter>
              <div style={{ marginTop: 4, marginLeft: 4 }}>
                Slippage %{' '}
                <Input
                  value={slippage}
                  type="number"
                  style={{
                    width: 55,
                    height: 30,
                    display: 'inline',
                    appearance: 'textfield',
                  }}
                  onChange={(val) => {
                    if (+val.target.value < 50)
                      setSlippage(val.target.value);
                  }}
                />{' '}
                {fromTokenPrice ? (
                  <>
                    Value: ${(+fromTokenPrice * +amount).toFixed(3)}
                  </>
                ) : null}
              </div>
              {balance.isSuccess ? (
                <Balance onClick={onMaxClick}>
                  Balance: {(+balance?.data?.formatted).toFixed(3)}
                </Balance>
              ) : null}
            </InputFooter>
          </div>
          <SwapWrapper>
            {route && address ? (
              <ButtonDark
                onClick={() => {
                  if (approve) approve();

                  if (+amount > +balance?.data?.formatted) return;
                  if (isApproved) handleSwap();
                }}
              >
                {isApproved ? 'Swap' : 'Approve'}
              </ButtonDark>
            ) : null}
            {route &&
            address &&
            !isApproved &&
            ['Matcha/0x', '1inch', 'CowSwap'].includes(
              route?.name
            ) ? (
              <ButtonDark
                onClick={() => {
                  if (approveInfinite) approveInfinite();
                }}
              >
                {'Approve Infinite'}
              </ButtonDark>
            ) : null}
          </SwapWrapper>
        </Body>
        <Routes
          show={!!routes?.length || isLoading}
          isFirstRender={renderNumber === 1}
        >
          <FormHeader>
            Routes
            <CloseBtn onClick={cleanState} />{' '}
          </FormHeader>
          {!routes?.length ? <Loader loaded={!isLoading} /> : null}
          {renderNumber !== 0
            ? normalizedRoutes.map((r, i) => (
                <Route
                  {...r}
                  index={i}
                  selected={route?.name === r.name}
                  setRoute={() => setRoute(r.route)}
                  toToken={toToken}
                  amountFrom={amountWithDecimals}
                  fromToken={fromToken}
                  selectedChain={selectedChain.label}
                  gasTokenPrice={gasTokenPrice}
                  toTokenPrice={toTokenPrice}
                  gasPrice={gasPriceData?.formatted?.gasPrice}
                  key={i}
                />
              ))
            : null}
        </Routes>
      </BodyWrapper>

      <FAQs />
      <TransactionModal
        open={txModalOpen}
        setOpen={setTxModalOpen}
        link={txUrl}
      />
    </Wrapper>
  );
}
