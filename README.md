### Join the community & report bugs

If you wish to report an issue, please join our [Discord](https://discord.swap.defillama.com/)

If you want to learn about LlamaSwap, read the [Twitter Thread](https://twitter.com/DefiLlama/status/1609989799653285888)

### Integration

The best way to integrate it is by just iframing our page, like this:

```html
<iframe
	title="LlamaSwap Widget"
	name="LlamaSwap Widget"
	src="https://swap.defillama.com"
	width="450px"
	height="565px"
	allow="fullscreen"
	marginwidth="0"
	marginheight="0"
	frameborder="0"
	scrolling="no"
	loading="eager"
></iframe>
```

The widget is resposive, so you can change the width and height in any way you want and the widget will adjust to fit the space. On top of that, you can customize the widget by adding the following params to the query url:

- chain: default chain (eg `chain=ethereum`)
- from: token to sell, to use the gas token for the chain use 0x0000000000000000000000000000000000000000 (eg `from=0x0000000000000000000000000000000000000000`)
- to: token to buy, to use the gas token for the chain use 0x0000000000000000000000000000000000000000 (eg `to=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48`)
- background: color of the background (eg `background=rgb(10,20,30)`)

Note: only tokens that are part of our token lists are accepted in `from` and `to`, this is to prevent scammers linking to llamaswap with fake tokens loaded (eg a fake USDC)

#### API integration

Widget integrations are preferred cause:

- Our widget handles all different dex integrations, which are quite different (cowswap requires signing a message while most others send a tx onchain)
- Our widget shows warnings for price impact and other things that could impact negatively your users
- In case there's any issue we can push a fix to everybody by just updating the site behind the iframe

But if you'd prefer to instead integrate through our API please contact @0xngmi on discord through defillama's discord and ask for an api key. We are forced to use api keys because many of the underlying aggregators have rate limits, so we have to control the volume of requests we send to them.

### Running the app locally

```
yarn install
yarn dev
```

Visit: http://localhost:3000/
