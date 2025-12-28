import React from 'react';
import { useAppSelector } from '../../../state/hooks';
import { useDispatch } from 'react-redux';
import { Package, Question, Round, Theme, RoundTypes } from '../../../model/siquester/package';
import localization from '../../../model/resources/localization';
import { navigate } from '../../../utils/Navigator';
import Path from '../../../model/enums/Path';
import {
	savePackage,
	setCurrentItem,
	selectCurrentItem,
	loadPackageStatistics,
	togglePackageStats,
	addRound,
	addTheme,
	addQuestion
} from '../../../state/siquesterSlice';
import PackageItem from './components/PackageItem';
import RoundItem from './components/RoundItem';
import ThemeItem from './components/ThemeItem';
import QuestionItem from './components/QuestionItem';
import MediaView from './components/MediaView/MediaView';

import './PackageView.scss';
import exitImg from '../../../../assets/images/exit.png';
import editImg from '../../../../assets/images/edit.png';

enum Mode { Rounds, Questions, Media }

const PackageView: React.FC = () => {
	const appDispatch = useDispatch();
	const siquester = useAppSelector(state => state.siquester);
	const { zip, pack, packageStats, packageTopLevelStats, packageStatsLoading, showPackageStats } = siquester;
	const currentItem = useAppSelector(selectCurrentItem);
	const [roundIndex, setRoundIndex] = React.useState(0);
	const [mode, setMode] = React.useState(Mode.Questions);
	const [isEditMode, setIsEditMode] = React.useState(false);
	const roundsContainerRef = React.useRef<HTMLDivElement>(null);
	const [isScrollable, setIsScrollable] = React.useState(false);

	const checkScrollable = React.useCallback(() => {
		if (roundsContainerRef.current) {
			const { scrollWidth, clientWidth } = roundsContainerRef.current;
			setIsScrollable(scrollWidth > clientWidth);
		}
	}, []);

	React.useEffect(() => {
		checkScrollable();
		window.addEventListener('resize', checkScrollable);
		return () => window.removeEventListener('resize', checkScrollable);
	}, [checkScrollable]);

	const scrollRounds = (direction: 'left' | 'right') => {
		if (roundsContainerRef.current) {
			const scrollAmount = 150;
			roundsContainerRef.current.scrollBy({
				left: direction === 'left' ? -scrollAmount : scrollAmount,
				behavior: 'smooth'
			});
		}
	};

	if (!zip || !pack) {
		return <div>Loading...</div>;
	}

	const onExit = () => appDispatch(navigate({ navigation: { path: Path.SIQuester }, saveState: true }));

	const onSave = () => {
		appDispatch(savePackage());
	};

	const onLoadStatistics = () => {
		if (packageStats) {
			appDispatch(togglePackageStats());
		} else {
			appDispatch(loadPackageStatistics());
		}
	};

	const hasPackageStats = packageStats && Object.keys(packageStats).length > 0;

	const round = pack.rounds[roundIndex];
	const isThemeList = round?.type === RoundTypes.Final;

	function getQuestionDisplay(price: number): string {
		return price > -1 ? price.toString() : ' ';
	}

	function getItemView(item: Package | Round | Theme | Question): React.ReactNode {
		if ('rounds' in item) { // Package
			return <PackageItem item={item as Package} isEditMode={isEditMode} />;
		}

		if ('themes' in item) { // Round
			return <RoundItem item={item as Round} isEditMode={isEditMode} />;
		}

		if ('questions' in item) { // Theme
			return <ThemeItem item={item as Theme} isEditMode={isEditMode} />;
		}

		// Question
		return <QuestionItem item={item as Question} isEditMode={isEditMode} />;
	}

	function getModeLabel(): string {
		switch (mode) {
			case Mode.Questions:
				return localization.questions;
			case Mode.Rounds:
				return localization.rounds;
			case Mode.Media:
				return localization.media;
			default:
				return localization.questions;
		}
	}

	function switchMode() {
		switch (mode) {
			case Mode.Questions:
				setMode(Mode.Rounds);
				break;

			case Mode.Rounds:
				setMode(Mode.Media);
				break;

			case Mode.Media:
				setMode(Mode.Questions);
				break;

			default:
				setMode(Mode.Questions);
		}
	}

	function toggleEditMode() {
		setIsEditMode(!isEditMode);
	}

	function getQuestionStatsKey(ri: number, ti: number, qi: number): string {
		return `${ri}:${ti}:${qi}`;
	}

	function getQuestionStats(ri: number, ti: number, qi: number): { triesPercent: number; rightPercent: number } | null {
		if (!packageStats || !showPackageStats) {
			return null;
		}

		const key = getQuestionStatsKey(ri, ti, qi);
		const stats = packageStats[key];

		if (!stats || stats.playerSeenCount === 0) {
			return null;
		}

		const totalTries = stats.correctCount + stats.wrongCount;
		const triesPercent = Math.round((stats.answeredCount / stats.shownCount) * 100);
		const rightPercent = totalTries > 0 ? Math.round((stats.correctCount / totalTries) * 100) : 0;

		return { triesPercent, rightPercent };
	}

	function getQuestionsView(packageData: Package): React.ReactNode {
		return <>
			<div className='packageView__rounds-wrapper'>
				{isScrollable && (
					<button
						type='button'
						className='packageView__rounds-nav packageView__rounds-nav--left'
						onClick={() => scrollRounds('left')}
						aria-label='Scroll left'>
						&#8249;
					</button>
				)}
				<div className='packageView__rounds' ref={roundsContainerRef}>
					{packageData.rounds.map((roundData, ri) => (
						<div
							key={ri}
							className={`packageView__round ${ri === roundIndex ? 'selected' : ''}`}
							onClick={() => { setRoundIndex(ri); appDispatch(setCurrentItem({ isPackageSelected: false })); }}
							title={roundData.name}>
							{roundData.name}
						</div>
					))}
				</div>
				{isScrollable && (
					<button
						type='button'
						className='packageView__rounds-nav packageView__rounds-nav--right'
						onClick={() => scrollRounds('right')}
						aria-label='Scroll right'>
						&#8250;
					</button>
				)}
			</div>

			{round ? <div className='packageView__table'>
				{round.themes.map((theme, ti) => (
					<div key={ti} className='packageView__theme'>
						<div className={`packageView__theme__name ${currentItem === theme ? 'selected' : ''}`} onClick={() => {
							appDispatch(setCurrentItem({ roundIndex, themeIndex: ti }));
						}}>
							{theme.name}
						</div>

						{theme.questions.map((question, qi) => {
							const stats = getQuestionStats(roundIndex, ti, qi);
							return (
								<div
									key={qi}
									className={`packageView__question
										${currentItem === question ? 'selected' : ''}
										${isThemeList ? 'wide' : ''}`}
									onClick={() => {
										appDispatch(setCurrentItem({ roundIndex, themeIndex: ti, questionIndex: qi }));
									}}>
									<span className='packageView__question__price'>
										{isThemeList ? localization.question : getQuestionDisplay(question.price)}
									</span>
									{stats && (
										<span className='packageView__question__stats'>
											<span className='tries' title={localization.answerTries}>{stats.triesPercent}%</span>
											<span className='right' title={localization.rightAnswers}>{stats.rightPercent}%</span>
										</span>
									)}
								</div>
							);
						})}
						{isEditMode && (
							<button
								type='button'
								className='packageView__add-button packageView__add-button--question'
								onClick={() => {
									const theme = round.themes[ti];
									const questionsCount = theme.questions.length;
									let newPrice = 100;
									
									if (questionsCount > 0) {
										const lastQuestion = theme.questions[questionsCount - 1];
										const lastPrice = lastQuestion.price > 0 ? lastQuestion.price : 100;
										
										if (questionsCount > 1) {
											// Calculate difference between last two questions
											const prevQuestion = theme.questions[questionsCount - 2];
											const prevPrice = prevQuestion.price > 0 ? prevQuestion.price : 100;
											const difference = lastPrice - prevPrice;
											newPrice = lastPrice + difference;
										} else {
											// Only one question exists, add 100
											newPrice = lastPrice + 100;
										}
									}
									
									appDispatch(addQuestion({ roundIndex, themeIndex: ti, price: newPrice }));
								}}
								title='Add question'>
								+
							</button>
						)}
					</div>
				))}
				{isEditMode && (
					<button
						type='button'
						className='packageView__add-button packageView__add-button--theme'
						onClick={() => appDispatch(addTheme({ roundIndex }))}
						title='Add theme'>
						+
					</button>
				)}
			</div> : null}
		</>;
	}

	function getRoundsView(packageData: Package): React.ReactNode {
		return <div className='packageView__roundInfo'>
			{packageData.rounds.map((roundData, ri) => (
				<div
					key={ri}
					className={`packageView__roundInfo__round ${currentItem === roundData ? 'selected' : ''}`}
					onClick={() => {
						appDispatch(setCurrentItem({ roundIndex: ri }));
					}}>
					{roundData.name}
				</div>
			))}
			{isEditMode && (
				<button
					type='button'
					className='packageView__add-button packageView__add-button--round'
					onClick={() => appDispatch(addRound())}
					title='Add round'>
					+
				</button>
			)}
		</div>;
	}

	function getContentView(packageData: Package): React.ReactNode {
		switch (mode) {
			case Mode.Questions:
				return getQuestionsView(packageData);
			case Mode.Rounds:
				return getRoundsView(packageData);
			case Mode.Media:
				return zip ? <MediaView zip={zip} /> : <div>No package loaded</div>;
			default:
				return getQuestionsView(packageData);
		}
	}

	return (
		<div className='packageView'>
			<div className='packageView__structure'>
				<header className='packageView__header'>
					<button
						type='button'
						className='standard imageButton welcomeExit'
						onClick={onExit}
						title={localization.exit}>
						<img src={exitImg} alt='Exit' />
					</button>

					<button
						type='button'
						className='standard imageButton'
						onClick={onSave}
						title={localization.savePackage}>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path
								d="M19 21H5C3.89 21 3 20.11 3 19V5C3 3.89 3.89 3 5 3H16L21 8V19C21 20.11 20.11 21 19 21Z"
								stroke="currentColor"
								strokeWidth="2"
								fill="none"/>
							<path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" fill="none"/>
							<path d="M7 3V8H15" stroke="currentColor" strokeWidth="2" fill="none"/>
						</svg>
					</button>

					<button
						type='button'
						className={`standard imageButton ${isEditMode ? 'editActive' : ''}`}
						onClick={toggleEditMode}
						title={localization.enableEditMode}>
						<img src={editImg} alt='Edit' />
					</button>

					<button
						type='button'
						className={`standard imageButton statistics ${packageStatsLoading ? 'loading' : ''} ${showPackageStats && hasPackageStats ? 'active' : ''}`}
						onClick={onLoadStatistics}
						disabled={packageStatsLoading || (packageStats !== undefined && !hasPackageStats)}
						title={localization.downloadPackageStatistics}>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M4 20H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
							<path d="M4 16V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
							<path d="M9 16V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
							<path d="M14 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
							<path d="M19 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
						</svg>
					</button>

					<button
						type='button'
						className='standard imageButton modes'
						title={localization.viewMode}
						onClick={switchMode}>
						{getModeLabel()}
					</button>

					<div
						className={`packageView__package ${currentItem === pack ? 'selected' : ''}`}
						onClick={() => {
							appDispatch(setCurrentItem({ isPackageSelected: true }));
						}}
						title={pack.name}>
						{pack.name}
					</div>
				</header>

				{showPackageStats && packageTopLevelStats && (
					<div className='packageView__statsBar'>
						{localization.completedGames
							.replace('{0}', packageTopLevelStats.completedGameCount.toString())
							.replace('{1}', packageTopLevelStats.startedGameCount.toString())
							.replace('{2}', packageTopLevelStats.startedGameCount > 0
								? Math.round((packageTopLevelStats.completedGameCount / packageTopLevelStats.startedGameCount) * 100).toString()
								: '0')}
					</div>
				)}

				{isEditMode && (
					<div className='packageView__disclaimer'>
						{localization.editModeDisclaimer}
					</div>
				)}

				{getContentView(pack)}
			</div>

			{currentItem && mode !== Mode.Media ? <div className='packageView__object'>
				{getItemView(currentItem)}
			</div> : null}
		</div>
	);
};

export default PackageView;