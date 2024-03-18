export const normalizeTokens = (t0 = '0', t1 = '0') => {
	if (!t0 || !t1) return null;

	return Number(t0) < Number(t1) ? [t0.toLowerCase(), t1.toLowerCase()] : [t1.toLowerCase(), t0.toLowerCase()];
};
