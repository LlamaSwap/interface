export const mockFetch = ({ isNodeFetch = false } = {}) => {
	if (isNodeFetch) global.fetch = require('node-fetch');
	else global.fetch = jest.fn();
	const mockedFetch = global.fetch as jest.Mock<any>;
	return mockedFetch;
};

export const setupFetchMocks = ({
	quoteData = {},
	spenderData = {},
	swapData = {},
	encodedData = {},
	gasPriceResponse = {},
	mockedFetch
}) => {
	mockedFetch.mockImplementation((url) => {
		if (url.includes('quote')) {
			return Promise.resolve({
				json: () => quoteData
			});
		}

		if (url.includes('spender')) {
			return Promise.resolve({
				json: () => spenderData
			});
		}

		if (url.includes('swap')) {
			if (swapData !== null) {
				return Promise.resolve({
					json: () => swapData
				});
			} else {
				return Promise.resolve({});
			}
		}

		if (url.includes('gas-price')) {
			return Promise.resolve({
				json: () => gasPriceResponse
			});
		}
		if (url.includes('encode')) {
			return Promise.resolve({ json: () => encodedData });
		}

		if (url.includes('https://api.hashflow.com/taker/v2/rfq')) {
			return Promise.resolve({
				json: () => swapData
			});
		}

		return Promise.reject(new Error('Unknown URL'));
	});
};
