import { useEffect, useState } from 'react';

const useCountdown = (targetDate) => {
	const countDownDate = new Date(targetDate).getTime();

	const [countDown, setCountDown] = useState(countDownDate - new Date().getTime());

	useEffect(() => {
		const interval = setInterval(() => {
			setCountDown(countDownDate - new Date().getTime());
		}, 1000);

		return () => clearInterval(interval);
	}, [countDownDate]);

	const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

	return seconds < 0 || Number.isNaN(seconds) ? 0 : seconds;
};

export { useCountdown };
