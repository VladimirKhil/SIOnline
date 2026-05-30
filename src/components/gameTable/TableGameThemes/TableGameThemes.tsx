import * as React from 'react';
import { showLogo } from '../../../state/tableSlice';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';

import './TableGameThemes.scss';

const fadeDuration = 500;

function TableGameThemes(): JSX.Element {
	const gameThemes = useAppSelector((state) => state.table.gameThemes);
	const isGamePaused = useAppSelector((state) => state.room2.stage.isGamePaused);
	const appDispatch = useAppDispatch();
	const tableGameThemesRef = React.useRef<HTMLUListElement>(null);
	const timerRef = React.useRef<number | null>(null);
	const remainingAnimationTimeRef = React.useRef(0);
	const animationStartedAtRef = React.useRef<number | null>(null);
	const isFirstPauseEffectRef = React.useRef(true);

	const clearLogoTimer = () => {
		if (timerRef.current !== null) {
			window.clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	};

	const prepareAnimation = () => {
		const list = tableGameThemesRef.current;

		if (!list) {
			return;
		}

		list.style.transitionProperty = 'none';
		list.style.top = '100%';
	};

	const pauseAnimation = () => {
		const list = tableGameThemesRef.current;

		if (!list) {
			return;
		}

		if (animationStartedAtRef.current !== null) {
			const elapsedTime = Date.now() - animationStartedAtRef.current;
			remainingAnimationTimeRef.current = Math.max(0, remainingAnimationTimeRef.current - elapsedTime);
			animationStartedAtRef.current = null;
		}

		const currentTop = window.getComputedStyle(list).top;

		list.style.transitionProperty = 'none';
		list.style.top = currentTop;

		clearLogoTimer();
	};

	const resumeAnimation = () => {
		const list = tableGameThemesRef.current;

		if (!list) {
			return;
		}

		if (remainingAnimationTimeRef.current <= 0) {
			appDispatch(showLogo());
			return;
		}

		const targetTop = `-${list.clientHeight}px`;

		void list.offsetHeight;
		list.style.transitionProperty = 'top, opacity';
		list.style.transitionTimingFunction = 'linear, ease-out';
		list.style.transitionDuration = `${remainingAnimationTimeRef.current}ms, ${fadeDuration}ms`;
		list.style.top = targetTop;

		animationStartedAtRef.current = Date.now();
		clearLogoTimer();
		timerRef.current = window.setTimeout(() => {
			animationStartedAtRef.current = null;
			remainingAnimationTimeRef.current = 0;
			timerRef.current = null;
			appDispatch(showLogo());
		}, remainingAnimationTimeRef.current);
	};

	React.useEffect(() => {
		remainingAnimationTimeRef.current = (Math.max(3, gameThemes.length) + 1) * 1000;
		prepareAnimation();

		if (!isGamePaused) {
			resumeAnimation();
		}

		return () => {
			clearLogoTimer();
		};
	}, []);

	React.useEffect(() => {
		if (isFirstPauseEffectRef.current) {
			isFirstPauseEffectRef.current = false;
			return;
		}

		if (isGamePaused) {
			pauseAnimation();
		} else {
			resumeAnimation();
		}
	}, [isGamePaused]);

	return (
		<ul id="tableGameThemes" ref={tableGameThemesRef} className="tableGameThemes">
			{gameThemes.map((gameTheme, index) => <li key={index}>{gameTheme}</li>)}
		</ul>
	);
}

export default TableGameThemes;
