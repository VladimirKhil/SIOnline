import React from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../../state/hooks';
import { NumberSet, ContentParam, Question, InfoOwner, SelectionMode } from '../../../../model/siquester/package';
import localization from '../../../../model/resources/localization';
import {
	updateQuestionProperty,
	updateQuestionParam,
	updateQuestionRightAnswer,
	updateQuestionWrongAnswer,
	setCurrentItem,
	findItemIndices,
	updateInfoProperty
} from '../../../../state/siquesterSlice';
import MediaItem from '../../MediaItem/MediaItem';
import ScreensView from '../../ScreensView/ScreensView';

interface QuestionItemProps {
	item: Question;
	isEditMode: boolean;
}

const QuestionItem: React.FC<QuestionItemProps> = ({ item, isEditMode }) => {
	const dispatch = useDispatch();
	const pack = useAppSelector(state => state.siquester.pack);
	const question = item;
	const indices = findItemIndices(pack || null, item);
	const { answerOptions } = question.params;

	function getSetAnswererSelect(setAnswererSelect: SelectionMode): string {
		switch (setAnswererSelect) {
			case 'any': return localization.setAnswererSelectAny;
			case 'exceptCurrent': return localization.setAnswererSelectExceptCurrent;
			default: return setAnswererSelect;
		}
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
				dispatch(updateInfoProperty({
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
				dispatch(updateInfoProperty({
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
				dispatch(updateInfoProperty({
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

	const handleQuestionChange = (property: 'price' | 'type', value: string | number) => {
		if (isEditMode && indices.roundIndex !== undefined && indices.themeIndex !== undefined && indices.questionIndex !== undefined) {
			dispatch(updateQuestionProperty({ 
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
			dispatch(updateQuestionParam({ 
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
			dispatch(updateQuestionRightAnswer({ 
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
			dispatch(updateQuestionWrongAnswer({ 
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
				<button
					type='button'
					className='standard'
					onClick={() => dispatch(setCurrentItem({ isPackageSelected: false }))}
				>
					{localization.close}
				</button>
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
};

export default QuestionItem;
