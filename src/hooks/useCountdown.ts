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

function useCountdownFull(msTillTraget) {
	const [millisecondsTillTargetTime, setMillisecondsTillTargetTime] = useState(msTillTraget);
	const [isStarted, setStarted] = useState(false);

	useEffect(() => {
		if (isStarted) {
			setMillisecondsTillTargetTime(msTillTraget);
			const interval = setInterval(() => {
				setMillisecondsTillTargetTime((ms) => ms - 1000);
			}, 1000);

			return () => clearInterval(interval);
		}
	}, [msTillTraget]);

	const start = () => setStarted(true);

	return { countdown: getReturnValues(millisecondsTillTargetTime), start, isStarted };
}

const getReturnValues = (millisecondsTillTargetTime) => {
	const days = round(millisecondsTillTargetTime / (1000 * 60 * 60 * 24));
	const hours = round((millisecondsTillTargetTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = round((millisecondsTillTargetTime % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = round((millisecondsTillTargetTime % (1000 * 60)) / 1000);

	return { days, hours, minutes, seconds };
};

function round(value) {
	if (value > 0) {
		return Math.floor(value);
	}
	return Math.ceil(value);
}

export { useCountdown, useCountdownFull };
