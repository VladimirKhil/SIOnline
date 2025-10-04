import React from 'react';
import { useAppSelector } from '../../../state/hooks';
import { useDispatch } from 'react-redux';
import { ContentParam, InfoOwner, Package, Question, Round, Theme, SelectionMode, NumberSet, RoundTypes } from '../../../model/siquester/package';
import localization from '../../../model/resources/localization';
import { navigate } from '../../../utils/Navigator';
import Path from '../../../model/enums/Path';
import MediaItem from '../MediaItem/MediaItem';
import ScreensView from '../ScreensView/ScreensView';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import getLanguage from '../../../utils/getLanguage';
import { 
	savePackage, 
	updatePackageProperty, 
	updateRoundProperty, 
	updateThemeProperty, 
	updateQuestionProperty,
	updateQuestionRightAnswer,
	updateQuestionWrongAnswer,
	updateInfoProperty,
	updateTag,
	updateQuestionParam
} from '../../../state/siquesterSlice';

import './PackageView.scss';
import exitImg from '../../../../assets/images/exit.png';
import editImg from '../../../../assets/images/edit.png';

enum Mode { Rounds, Questions }

const PackageView: React.FC = () => {
	const appDispatch = useDispatch();
	const siquester = useAppSelector(state => state.siquester);
	const { zip, pack } = siquester;
	const [roundIndex, setRoundIndex] = React.useState(0);
	const [item, setItem] = React.useState<Package | Round | Theme | Question | null>(null);
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

	function getRoundType(type: string): string {
		switch (type) {
			case RoundTypes.Standard: case '': return localization.roundTypeTable;
			case RoundTypes.Final: return localization.themeList;
			default: return type;
		}
	}

	function getSetAnswererSelect(setAnswererSelect: SelectionMode): string {
		switch (setAnswererSelect) {
			case 'any': return localization.setAnswererSelectAny;
			case 'exceptCurrent': return localization.setAnswererSelectExceptCurrent;
			default: return setAnswererSelect;
		}
	}

	// Helper function to find indices of the current item
	function findItemIndices(targetItem: Package | Round | Theme | Question | null): { 
		roundIndex?: number; 
		themeIndex?: number; 
		questionIndex?: number; 
	} {
		if (!targetItem || !pack) {
			return {};
		}

		if ('rounds' in targetItem) {
			// Package
			return {};
		}

		// Find the item in the package structure
		for (const [rIndex, currentRound] of pack.rounds.entries()) {
			if (currentRound === targetItem) {
				// Round
				return { roundIndex: rIndex };
			}

			for (const [tIndex, currentTheme] of currentRound.themes.entries()) {
				if (currentTheme === targetItem) {
					// Theme
					return { roundIndex: rIndex, themeIndex: tIndex };
				}

				for (const [qIndex, currentQuestion] of currentTheme.questions.entries()) {
					if (currentQuestion === targetItem) {
						// Question
						return { roundIndex: rIndex, themeIndex: tIndex, questionIndex: qIndex };
					}
				}
			}
		}

		return {};
	}

	function getQuestionTypeName(type: string): string {
		switch (type) {
			case 'simple': return localization.questionTypeSimple;
			case 'stake': return localization.questionTypeStake;
			case 'noRisk': return localization.questionTypeForYourself;
			case 'secret': return localization.questionTypeSecret;
			case 'secretPublicPrice': return localization.questionTypeSecretPublicPrice;
			case 'secretNoQuestion': return localization.questionTypeSecretNoQuestion;
			case 'forAll': return localization.questionTypeForAll;
			case 'stakeAll': return localization.questionTypeForAllWithStake;
			default: return type;
		}
	}

	function getInfo(infoOwner: InfoOwner, isEditable = false, itemIndices?: { 
		roundIndex?: number; 
		themeIndex?: number; 
		questionIndex?: number; 
	}): React.ReactNode {
		const getTargetType = (): 'package' | 'round' | 'theme' | 'question' => {
			if (typeof itemIndices?.questionIndex === 'number') return 'question';
			if (typeof itemIndices?.themeIndex === 'number') return 'theme';
			if (typeof itemIndices?.roundIndex === 'number') return 'round';
			return 'package';
		};

		const handleAuthorChange = (authorIndex: number, value: string) => {
			if (isEditable) {
				appDispatch(updateInfoProperty({
					targetType: getTargetType(),
					roundIndex: itemIndices?.roundIndex,
					themeIndex: itemIndices?.themeIndex,
					questionIndex: itemIndices?.questionIndex,
					property: 'authors',
					index: authorIndex,
					value
				}));
			}
		};

		const handleSourceChange = (sourceIndex: number, value: string) => {
			if (isEditable) {
				appDispatch(updateInfoProperty({
					targetType: getTargetType(),
					roundIndex: itemIndices?.roundIndex,
					themeIndex: itemIndices?.themeIndex,
					questionIndex: itemIndices?.questionIndex,
					property: 'sources',
					index: sourceIndex,
					value
				}));
			}
		};

		const handleCommentsChange = (value: string) => {
			if (isEditable) {
				appDispatch(updateInfoProperty({
					targetType: getTargetType(),
					roundIndex: itemIndices?.roundIndex,
					themeIndex: itemIndices?.themeIndex,
					questionIndex: itemIndices?.questionIndex,
					property: 'comments',
					value
				}));
			}
		};

		return <>
			{infoOwner.info?.authors && infoOwner.info.authors.length > 0
				? <>
					<label className='header'>{localization.authors}</label>

					{infoOwner.info?.authors?.map((author, ai) => (
						<input 
							aria-label='author' 
							key={ai} 
							className='packageView__info__author' 
							value={author.name} 
							readOnly={!isEditable}
							onChange={(e) => handleAuthorChange(ai, e.target.value)}
						/>
					))}
				</> : null}

			{infoOwner.info?.sources && infoOwner.info.sources.length > 0
				? <>
					<label className='header' htmlFor='sources'>{localization.sources}</label>

					{infoOwner.info?.sources?.map((source, si) => (
						<input 
							id='sources' 
							key={si} 
							className='packageView__info__source' 
							value={source.value} 
							readOnly={!isEditable}
							onChange={(e) => handleSourceChange(si, e.target.value)}
						/>
					))}
				</> : null}

			{infoOwner.info?.comments && infoOwner.info.comments.length > 0
				? <>
					<label className='header' htmlFor='comments'>{localization.comments}</label>
					<textarea 
						id='comments' 
						className='packageView__info__comments' 
						value={infoOwner.info.comments} 
						readOnly={!isEditable}
						onChange={(e) => handleCommentsChange(e.target.value)}
					/>
				</> : null}
		</>;
	}

	function getItemView(currentItem: Package | Round | Theme | Question): React.ReactNode {
		const indices = findItemIndices(currentItem);

		if ('rounds' in currentItem) { // Package
			const currentPack = currentItem as Package;

			return (
				<div className='info packageView__package__info'>
					<header>
						<div className='main__header'>{localization.package}</div>
						<button type='button' className='standard' onClick={() => setItem(null)}>{localization.close}</button>
					</header>

					<section className='info__content'>
						<label htmlFor='name' className='header'>{localization.name}</label>
						<input 
							id='name' 
							type='text' 
							className='packageView__package__info__name' 
							value={currentPack.name} 
							readOnly={!isEditMode}
							onChange={(e) => isEditMode && appDispatch(updatePackageProperty({ property: 'name', value: e.target.value }))}
						/>

						{currentPack.logo
							? <div className='packageView__package__logo__host'>
								<MediaItem src={currentPack.logo.substring(1)} type='image' isRef={true} />
							</div>
							: null}

						<label htmlFor='date' className='header'>{localization.date}</label>
						<input 
							id='date' 
							type='text' 
							className='packageView__package__info__date' 
							value={currentPack.date} 
							readOnly={!isEditMode}
							onChange={(e) => isEditMode && appDispatch(updatePackageProperty({ property: 'date', value: e.target.value }))}
						/>

						<label htmlFor='language' className='header'>{localization.language}</label>

						<input
							id='language'
							type='text'
							className='packageView__package__info__language'
							value={getLanguage(currentPack.language)}
							readOnly={!isEditMode}
							onChange={(e) => isEditMode && appDispatch(updatePackageProperty({ property: 'language', value: e.target.value }))}
						/>

						<label htmlFor='publisher' className='header'>{localization.publisher}</label>
						<input
							id='publisher'
							type='text'
							className='packageView__package__info__publisher'
							value={currentPack.publisher}
							readOnly={!isEditMode}
							onChange={(e) => isEditMode && appDispatch(updatePackageProperty({ property: 'publisher', value: e.target.value }))}
						/>

						<label htmlFor='restriction' className='header'>{localization.restriction}</label>
						<input
							id='restriction'
							type='text'
							className='packageView__package__info__restriction'
							value={currentPack.restriction}
							readOnly={!isEditMode}
							onChange={(e) => isEditMode && appDispatch(updatePackageProperty({ property: 'restriction', value: e.target.value }))}
						/>

						<label htmlFor='difficulty' className='header'>{localization.difficulty}</label>
						<input
							id='difficulty'
							type='number'
							className='packageView__package__info__difficulty'
							value={currentPack.difficulty}
							readOnly={!isEditMode}
							onChange={(e) => isEditMode && appDispatch(updatePackageProperty({ 
								property: 'difficulty', 
								value: parseInt(e.target.value, 10) || 0 
							}))}
						/>

						{currentPack.tags.length > 0
							? <>
								<label className='header'>{localization.tags}</label>

								{currentPack.tags.map((tag, ti) => (
									<input
										aria-label='tag'
										key={ti}
										className='packageView__package__info__tag'
										value={tag.value}
										readOnly={!isEditMode}
										onChange={(e) => isEditMode && appDispatch(updateTag({ tagIndex: ti, value: e.target.value }))}
									/>
								))}
							</> : null}

						{currentPack.contactUri
							? <>
								<label htmlFor='contactUri' className='header'>{localization.contactUri}</label>

								<input
									id='contactUri'
									type='text'
									className='packageView__package__info__contactUri'
									value={currentPack.contactUri}
									readOnly={!isEditMode}
									onChange={(e) => isEditMode && appDispatch(updatePackageProperty({ 
										property: 'contactUri', 
										value: e.target.value 
									}))}
								/>
							</> : null}

						{getInfo(currentPack, isEditMode, indices)}
					</section>
				</div>
			);
		}

		if ('themes' in currentItem) { // Round
			const currentRound = currentItem as Round;

			return (
				<div className='info packageView__round__info'>
					<header>
						<div className='main__header'>{localization.round}</div>
						<button type='button' className='standard' onClick={() => setItem(null)}>{localization.close}</button>
					</header>

					<section className='info__content'>
						<label htmlFor='name' className='header'>{localization.name}</label>
						<input 
							id='name' 
							type='text' 
							className='packageView__round__info__name' 
							value={currentRound.name} 
							readOnly={!isEditMode}
							onChange={(e) => isEditMode && indices.roundIndex !== undefined && appDispatch(updateRoundProperty({ 
								roundIndex: indices.roundIndex, 
								property: 'name', 
								value: e.target.value 
							}))}
						/>

						<label htmlFor='type' className='header'>{localization.type}</label>
						<input
							id='type'
							type='text'
							className='packageView__round__info__type'
							value={getRoundType(currentRound.type)}
							readOnly={!isEditMode}
							onChange={(e) => isEditMode && indices.roundIndex !== undefined && appDispatch(updateRoundProperty({ 
								roundIndex: indices.roundIndex, 
								property: 'type', 
								value: e.target.value 
							}))}
						/>

						{getInfo(currentRound, isEditMode, indices)}
					</section>
				</div>
			);
		}

		if ('questions' in currentItem) { // Theme
			const theme = currentItem as Theme;

			return (
				<div className='info'>
					<header>
						<div className='main__header'>{localization.theme}</div>
						<button type='button' className='standard' onClick={() => setItem(null)}>{localization.close}</button>
					</header>

					<label htmlFor='name' className='header'>{localization.name}</label>
					<input 
						id='name' 
						type='text' 
						className='packageView__theme__info__name' 
						value={theme.name} 
						readOnly={!isEditMode}
						onChange={(e) => {
							if (isEditMode && indices.roundIndex !== undefined && indices.themeIndex !== undefined) {
								appDispatch(updateThemeProperty({ 
									roundIndex: indices.roundIndex, 
									themeIndex: indices.themeIndex, 
									property: 'name', 
									value: e.target.value 
								}));
							}
						}}
					/>

					{getInfo(theme, isEditMode, indices)}
				</div>
			);
		}

		const question = currentItem as Question;
		const { answerOptions } = question.params;

		function getNumberSet(numberSet: NumberSet) {
			if (numberSet.minimum === numberSet.maximum) {
				if (numberSet.minimum === 0) {
					return <input aria-label='price' type='text' value={localization.minMaxInRound} readOnly />;
				}

				return <input aria-label='price' type='number' value={numberSet.minimum} readOnly />;
			}

			if (numberSet.step === 0 || numberSet.step === numberSet.maximum - numberSet.minimum) {
				return <>
					{localization.from}
					<input aria-label='price' type='text' value={numberSet.minimum} readOnly />
					{localization.to}
					<input aria-label='price' type='text' value={numberSet.maximum} readOnly />
				</>;
			}

			return <>
				{localization.from}
				<input aria-label='price' type='text' value={numberSet.minimum} readOnly />
				{localization.to}
				<input aria-label='price' type='text' value={numberSet.maximum} readOnly />
				{localization.withStep}
				<input aria-label='price' type='text' value={numberSet.step} readOnly />
			</>;
		}

		function getAnswerType(answerType: string): string {
			switch (answerType) {
				case 'text': return localization.text;
				case 'select': return localization.answerTypeSelect;
				default: return answerType;
			}
		}

		const handleQuestionChange = (property: 'price' | 'type', value: string | number) => {
			if (isEditMode && indices.roundIndex !== undefined && indices.themeIndex !== undefined && indices.questionIndex !== undefined) {
				appDispatch(updateQuestionProperty({ 
					roundIndex: indices.roundIndex, 
					themeIndex: indices.themeIndex, 
					questionIndex: indices.questionIndex, 
					property, 
					value 
				}));
			}
		};

		const handleQuestionParamChange = (param: string, value: string) => {
			if (isEditMode && indices.roundIndex !== undefined && indices.themeIndex !== undefined && indices.questionIndex !== undefined) {
				appDispatch(updateQuestionParam({ 
					roundIndex: indices.roundIndex, 
					themeIndex: indices.themeIndex, 
					questionIndex: indices.questionIndex, 
					param, 
					value 
				}));
			}
		};

		const handleRightAnswerChange = (answerIndex: number, value: string) => {
			if (isEditMode && indices.roundIndex !== undefined && indices.themeIndex !== undefined && indices.questionIndex !== undefined) {
				appDispatch(updateQuestionRightAnswer({ 
					roundIndex: indices.roundIndex, 
					themeIndex: indices.themeIndex, 
					questionIndex: indices.questionIndex, 
					answerIndex, 
					value 
				}));
			}
		};

		const handleWrongAnswerChange = (answerIndex: number, value: string) => {
			if (isEditMode && indices.roundIndex !== undefined && indices.themeIndex !== undefined && indices.questionIndex !== undefined) {
				appDispatch(updateQuestionWrongAnswer({ 
					roundIndex: indices.roundIndex, 
					themeIndex: indices.themeIndex, 
					questionIndex: indices.questionIndex, 
					answerIndex, 
					value 
				}));
			}
		};

		return (
			<div className='info packageView__question__info'>
				<header>
					<div className='main__header'>{localization.question}</div>
					<button type='button' className='standard' onClick={() => setItem(null)}>{localization.close}</button>
				</header>

				<section className='info__content'>
					{question.price > -1
						? <>
						<label htmlFor='price' className='header'>{localization.price}</label>
						<input 
							id='price' 
							type='number' 
							className='packageView__question__info__price' 
							value={question.price} 
							readOnly={!isEditMode}
							onChange={(e) => handleQuestionChange('price', parseInt(e.target.value, 10) || 0)}
						/>

						{question.type
							? <>
								<label htmlFor='type' className='header'>{localization.type}</label>

								<input
									id='type'
									type='text'
									className='packageView__question__type'
									value={getQuestionTypeName(question.type)}
									readOnly={!isEditMode}
									onChange={(e) => handleQuestionChange('type', e.target.value)}
								/>
							</>
						: null}

						{question.params.theme
							? <>
								<label htmlFor='theme' className='header'>{localization.theme}</label>
								<input 
									id='theme' 
									type='text' 
									value={question.params.theme} 
									readOnly={!isEditMode}
									onChange={(e) => handleQuestionParamChange('theme', e.target.value)}
								/>
							</>
						: null}

						{question.params.selectionMode
							? <>
								<label htmlFor='selectionMode' className='header'>{localization.selectionMode}</label>
								<input
									id='selectionMode'
									type='text'
									value={getSetAnswererSelect(question.params.selectionMode)}
									readOnly={!isEditMode}
									onChange={(e) => handleQuestionParamChange('selectionMode', e.target.value)}
								/>
							</>
						: null}

						{question.params.price?.numberSet
							? <>
								<label htmlFor='price' className='header'>{localization.price}</label>
								{getNumberSet(question.params.price.numberSet)}
							</>
						: null}

						{question.type !== 'secretNoQuestion'
							? <>
								<label htmlFor='name' className='header'>{localization.question}</label>

								{question.params.question ? <ScreensView 
									content={question.params.question} 
									isEditMode={isEditMode}
									roundIndex={indices.roundIndex}
									themeIndex={indices.themeIndex}
									questionIndex={indices.questionIndex}
									paramName="question"
								/> : null}

								{question.params.answer
									? <>
										<label htmlFor='name' className='header'>{localization.answer}</label>
										<ScreensView 
											content={question.params.answer} 
											isEditMode={isEditMode}
											roundIndex={indices.roundIndex}
											themeIndex={indices.themeIndex}
											questionIndex={indices.questionIndex}
											paramName="answer"
										/>
									</>
								: null}

								{question.params.answerType
									? <>
										<label htmlFor='answerType' className='header'>{localization.answerType}</label>
										<input id='answerType' type='text' value={getAnswerType(question.params.answerType)} readOnly />
									</>
								: null}

								{answerOptions
									? <>
										<label htmlFor='name' className='header'>{localization.answerOptions}</label>

										{Object.keys(answerOptions).map((key, ii) => {
											const option = answerOptions[key] as ContentParam;
											const [firstItem] = option.items || [];

											if (!firstItem) {
												return (
													<div key={key} className='packageView__answer__option__host'>
														<div className='packageView__answer__option__label'>{key}</div>
														<input
															aria-label='content'
															className='packageView__answer__option'
															value=""
															readOnly={!isEditMode} />
													</div>
												);
											}

											const renderAnswerOptionContent = () => {
												switch (firstItem.type) {
													case 'image': {
														return (
															<div className='packageView__answer__option__image'>
																<MediaItem
																	src={firstItem.value}
																	type='image'
																	isRef={firstItem.isRef}
																/>
															</div>
														);
													}

													default:
														return (
															<input
																aria-label='content'
																key={ii}
																className='packageView__answer__option'
																value={firstItem.value}
																readOnly={!isEditMode} />
														);
												}
											};

											return (
												<div key={key} className='packageView__answer__option__host'>
													<div className='packageView__answer__option__label'>{key}</div>
													{renderAnswerOptionContent()}
												</div>
											);
										})}
									</>
								: null}

								<label htmlFor='name' className='header'>{localization.rightAnswers}</label>

								{question.right.answer.map((answer, ri) => (
									<input
										aria-label='author'
										key={ri}
										className='packageView__theme__info__author'
										value={answer}
										readOnly={!isEditMode}
										onChange={(e) => handleRightAnswerChange(ri, e.target.value)}
									/>
								))}

								{question.wrong
									? <>
										<label htmlFor='name' className='header'>{localization.wrongAnswers}</label>

										{question.wrong.answer.map((answer, ri) => (
											<input
												aria-label='author'
												key={ri}
												className='packageView__theme__info__author'
												value={answer}
												readOnly={!isEditMode}
												onChange={(e) => handleWrongAnswerChange(ri, e.target.value)}
											/>
										))}
									</>
								: null}
							</>
							: null
						}
						</>
						: null
						}

					{getInfo(question, isEditMode, indices)}
				</section>
			</div>
		);
	}

	function switchMode() {
		setMode(mode === Mode.Questions ? Mode.Rounds : Mode.Questions);
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
						onClick={() => { setRoundIndex(ri); setItem(null); }}>
						{roundData.name}
					</div>
				))}
			</div>

			{round ? <div className='packageView__table'>
				{round.themes.map((theme, ti) => (
					<div key={ti} className='packageView__theme'>
						<div className={`packageView__theme__name ${item === theme ? 'selected' : ''}`} onClick={() => setItem(theme)}>
							<AutoSizedText maxFontSize={18}>{theme.name}</AutoSizedText>
						</div>

						{theme.questions.map((question, qi) => (
							<div
								key={qi}
								className={`packageView__question
									${item === question ? 'selected' : ''}
									${isThemeList ? 'wide' : ''}`}
								onClick={() => { setItem(question); }}>
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
					className={`packageView__roundInfo__round ${item === roundData ? 'selected' : ''}`}
					onClick={() => setItem(roundData)}>
					{roundData.name}
				</div>
			))}
		</div>;
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
						className='standard imageButton modes'
						title={localization.viewMode}
						onClick={switchMode}>
						{mode === Mode.Questions ? localization.questions : localization.rounds}
					</button>

					<div
						className={`packageView__package ${item === pack ? 'selected' : ''}`}
						onClick={() => { setItem(pack); }}>
						{pack.name}
					</div>
				</header>

				{mode === Mode.Questions ? getQuestionsView(pack) : getRoundsView(pack)}
			</div>

			{item ? <div className='packageView__object'>
				{getItemView(item)}
			</div> : null}
		</div>
	);
};

export default PackageView;