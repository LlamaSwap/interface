import { ChevronDown } from "react-feather";
import styled from "styled-components";

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.advancedBG};
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 40px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.bg3};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.05);

  h1 {
    margin-bottom: -20px;
  }
`;

const Details = styled.details`
  flex: 1;
  font-size: 1rem;
  text-align: left;

  summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    text-align: left;
    font-size: 1.125rem;
    cursor: pointer;
    padding-bottom: 4px;
    border-bottom: 1px solid ${({ theme }) => theme.text4};
    margin-bottom: 16px;
    list-style: none;
    list-style-type: none;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  &[open] #chevron {
    transform: rotate(180deg);
  }
`;

const Description = styled.span`
  word-break: break-all;
`;

export default function FaqWrapper() {
  return (
    <Wrapper>
      <h1>FAQ</h1>

      <Details>
        <summary>
          <span>What is this?</span>
          <ChevronDown size={18} id="chevron" />
        </summary>
        <Description>
          It's an aggregator of DEX aggregators, we query the price in 1inch,
          cowswap, matcha... and then offer you the best price among all of them
        </Description>
      </Details>

      <Details>
        <summary>
          <span>Does DefiLlama take any fees?</span>
          <ChevronDown size={18} id="chevron" />
        </summary>

        <Description>
          DefiLlama takes 0 fee on swaps.
          <br />
          <br /> You'll get the exact same price swapping through DefiLlama as
          what you'd get swapping through the chosen aggregator directly.
          <br />
          <br />
          We do add our referral code to swaps tho, so, for aggregators with
          revenue sharing, they will send us part of the fee they earn. This is
          not an extra fee, you'd be charged the same fee anyway, but now a
          small part of it is shared with DefiLlama. We also integrate
          aggregators with no fee sharing the best price, and in those cases we
          don't make any money.
        </Description>
      </Details>

      <Details>
        <summary>
          <span>Is it safe?</span>
          <ChevronDown size={18} id="chevron" />
        </summary>

        <Description>
          Our aggregator uses the router contract of each aggregator, we don't
          use any contracts developed by us. Thus you inherit the same security
          you'd get by swapping directly from their UI instead of ours.
        </Description>
      </Details>

      <Details>
        <summary>
          <span>
            Will I be eligible for airdrops if I swap through DefiLlama?
          </span>
          <ChevronDown size={18} id="chevron" />
        </summary>

        <Description>
          Yes, we execute swaps directly against the router of each aggregator,
          so there's no difference between a swap executed directly from their
          UI and a swap executed from DefiLlama, thus all swaps would be as
          eligible for airdrops as swaps made through their UI in case there's a
          future airdrop.
        </Description>
      </Details>
    </Wrapper>
  );
}
