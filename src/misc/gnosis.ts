import SafeAppsSDK from '@gnosis.pm/safe-apps-sdk/dist/src/sdk';

type Opts = {
	allowedDomains?: RegExp[];
	debug?: boolean;
};

const opts: Opts = {
	allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/],
	debug: false
};

export const appsSdk = new SafeAppsSDK(opts);
