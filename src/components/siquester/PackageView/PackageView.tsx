import React from 'react';
import { useAppSelector } from '../../../state/hooks';
import { useDispatch } from 'react-redux';
import { Package, Question, Round, Theme, RoundTypes } from '../../../model/siquester/package';
import localization from '../../../model/resources/localization';
import { navigate } from '../../../utils/Navigator';
import Path from '../../../model/enums/Path';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import {
	savePackage,
	setCurrentItem,
	selectCurrentItem
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
	const { zip, pack } = siquester;
	const currentItem = useAppSelector(selectCurrentItem);
	const [roundIndex, setRoundIndex] = React.useState(0);
	const [mode, setMode] = React.useState(Mode.Questions);
	const [isEditMode, setIsEditMode] = React.useState(false);

	if (!zip || !pack) {
		return <div>Loading...</div>;
	}

	const onExit = () => appDispatch(navigate({ navigation: { path: Path.SIQuester }, saveState: true }));

	const onSave = () => {
		appDispatch(savePackage());
	};

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
				return 'Media';
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
				setMode(Mode.Questions); //setMode(Mode.Media);
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

	function getQuestionsView(packageData: Package): React.ReactNode {
		return <>
			<div className='packageView__rounds'>
				{packageData.rounds.map((roundData, ri) => (
					<div
						key={ri}
						className={`packageView__round ${ri === roundIndex ? 'selected' : ''}`}
						onClick={() => { setRoundIndex(ri); appDispatch(setCurrentItem({ isPackageSelected: false })); }}>
						{roundData.name}
					</div>
				))}
			</div>

			{round ? <div className='packageView__table'>
				{round.themes.map((theme, ti) => (
					<div key={ti} className='packageView__theme'>
						<div className={`packageView__theme__name ${currentItem === theme ? 'selected' : ''}`} onClick={() => {
							appDispatch(setCurrentItem({ roundIndex, themeIndex: ti }));
						}}>
							<AutoSizedText maxFontSize={18}>{theme.name}</AutoSizedText>
						</div>

						{theme.questions.map((question, qi) => (
							<div
								key={qi}
								className={`packageView__question
									${currentItem === question ? 'selected' : ''}
									${isThemeList ? 'wide' : ''}`}
								onClick={() => {
									appDispatch(setCurrentItem({ roundIndex, themeIndex: ti, questionIndex: qi }));
								}}>
								{isThemeList ? localization.question : getQuestionDisplay(question.price)}
							</div>
						))}
					</div>
				))}
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

					{/* <button
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
					</button> */}

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
						}}>
						{pack.name}
					</div>
				</header>

				{getContentView(pack)}
			</div>

			{currentItem && mode !== Mode.Media ? <div className='packageView__object'>
				{getItemView(currentItem)}
			</div> : null}
		</div>
	);
};

export default PackageView;