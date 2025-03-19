import React from 'react';
import { useAppSelector } from '../../../state/hooks';
import { useDispatch } from 'react-redux';
import { ContentParam, InfoOwner, Package, Question, Round, Theme, SelectionMode, NumberSetParam, NumberSet, ContentItem } from '../../../model/siquester/package';
import localization from '../../../model/resources/localization';
import { navigate } from '../../../utils/Navigator';
import Path from '../../../model/enums/Path';
import MediaItem from '../MediaItem/MediaItem';
import JSZip from 'jszip';

import './PackageView.scss';
import exitImg from '../../../../assets/images/exit.png';

enum Mode { Rounds, Questions }

const PackageView: React.FC = () => {
	const appDispatch = useDispatch();
	const siquester = useAppSelector(state => state.siquester);
	const { zip, pack } = siquester;
	const [roundIndex, setRoundIndex] = React.useState(0);
	const [item, setItem] = React.useState<Package | Round | Theme | Question | null>(null);
	const [screenIndex, setScreenIndex] = React.useState(0);
	const [mode, setMode] = React.useState(Mode.Questions);

	if (!zip || !pack) {
		return <div>Loading...</div>;
	}

	const onExit = () => appDispatch(navigate({ navigation: { path: Path.SIQuester }, saveState: true }));

	const round = pack.rounds[roundIndex];
	const isThemeList = round?.type === 'final';

	function getRoundType(type: string): string {
		switch (type) {
			case 'standart': case '': return localization.roundTypeTable;
			case 'final': return localization.themeList;
			default: return type;
		}
	}

	function getLanguage(language: string): string {
		switch (language) {
			case 'ru-RU': return localization.languageRu;
			case 'en-US': return localization.languageEn;
			default: return language;
		}
	}

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
			case 'noRisk': return localization.questionTypeNoRisk;
			case 'secret': return localization.questionTypeSecret;
			case 'secretPublicPrice': return localization.questionTypeSecretPublicPrice;
			case 'secretNoQuestion': return localization.questionTypeSecretNoQuestion;
			case 'forAll': return localization.questionTypeForAll;
			case 'stakeAll': return localization.questionTypeStakeAll;
			default: return type;
		}
	}

	function getInfo(infoOwner: InfoOwner): React.ReactNode {
		return <>
			{infoOwner.info?.authors && infoOwner.info.authors.length > 0
				? <>
					<label className='header'>{localization.authors}</label>

					{infoOwner.info?.authors?.map((author, ai) => (
						<input aria-label='author' key={ai} className='packageView__info__author' value={author.name} readOnly />
					))}
				</> : null}

			{infoOwner.info?.sources && infoOwner.info.sources.length > 0
				? <>
					<label className='header' htmlFor='sources'>{localization.sources}</label>

					{infoOwner.info?.sources?.map((source, si) => (
						<input id='sources' key={si} className='packageView__info__source' value={source.value} readOnly />
					))}
				</> : null}

			{infoOwner.info?.comments && infoOwner.info.comments.length > 0
				? <>
					<label className='header' htmlFor='comments'>{localization.comments}</label>
					<textarea id='comments' className='packageView__info__comments' value={infoOwner.info.comments} readOnly />
				</> : null}
		</>;
	}

	function getItemView(item: Package | Round | Theme | Question): React.ReactNode {
		if ('rounds' in item) { // Package
			const pack = item as Package;

			return (
				<div className='info packageView__package__info'>
					<header>
						<div className='main__header'>{localization.package}</div>
						<button type='button' className='standard' onClick={() => setItem(null)}>{localization.close}</button>
					</header>

					<section className='info__content'>
						<label htmlFor='name' className='header'>{localization.name}</label>
						<input id='name' type='text' className='packageView__package__info__name' value={pack.name} readOnly />

						{pack.logo
							? <div className='packageView__package__logo__host'>
								<MediaItem src={pack.logo.substring(1)} type='image' isRef={true} />
							</div>
							: null}

						<label htmlFor='date' className='header'>{localization.date}</label>
						<input id='date' type='text' className='packageView__package__info__date' value={pack.date} readOnly />

						<label htmlFor='language' className='header'>{localization.language}</label>

						<input
							id='language'
							type='text'
							className='packageView__package__info__language'
							value={getLanguage(pack.language)}
							readOnly />

						<label htmlFor='publisher' className='header'>{localization.publisher}</label>
						<input id='publisher' type='text' className='packageView__package__info__publisher' value={pack.publisher} readOnly />

						<label htmlFor='restriction' className='header'>{localization.restriction}</label>
						<input id='restriction' type='text' className='packageView__package__info__restriction' value={pack.restriction} readOnly />

						<label htmlFor='difficulty' className='header'>{localization.difficulty}</label>
						<input id='difficulty' type='text' className='packageView__package__info__difficulty' value={pack.difficulty} readOnly />

						{pack.tags.length > 0
							? <>
								<label className='header'>{localization.tags}</label>

								{pack.tags.map((tag, ti) => (
									<input aria-label='tag' key={ti} className='packageView__package__info__tag' value={tag.value} readOnly />
								))}
							</> : null}

						{getInfo(pack)}
					</section>
				</div>
			);
		}

		if ('themes' in item) { // Round
			const round = item as Round;

			return (
				<div className='info packageView__round__info'>
					<header>
						<div className='main__header'>{localization.round}</div>
						<button type='button' className='standard' onClick={() => setItem(null)}>{localization.close}</button>
					</header>

					<section className='info__content'>
						<label htmlFor='name' className='header'>{localization.name}</label>
						<input id='name' type='text' className='packageView__round__info__name' value={round.name} readOnly />

						<label htmlFor='type' className='header'>{localization.type}</label>
						<input id='type' type='text' className='packageView__round__info__type' value={getRoundType(round.type)} readOnly />

						{getInfo(round)}
					</section>
				</div>
			);
		}

		if ('questions' in item) { // Theme
			const theme = item as Theme;

			return (
				<div className='info'>
					<header>
						<div className='main__header'>{localization.theme}</div>
						<button type='button' className='standard' onClick={() => setItem(null)}>{localization.close}</button>
					</header>

					<label htmlFor='name' className='header'>{localization.name}</label>
					<input id='name' type='text' className='packageView__theme__info__name' value={theme.name} readOnly />

					{getInfo(theme)}
				</div>
			);
		}

		const question = item as Question;
		const { answerOptions } = question.params;

		const screens = [];
		const items = [];

		if (question.params.question) {
			for (let i = 0; i < question.params.question.items.length; i++) {
				const contentItem = question.params.question.items[i];
				items.push(contentItem);

				if (contentItem.waitForFinish) {
					screens.push([...items]);
					items.length = 0;
				}
			}
		}

		if (items.length > 0) {
			screens.push([...items]);
		}

		const screen = screens[screenIndex];

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

		function getContentItem(contentItem: ContentItem): React.ReactNode {
			switch (contentItem.type) {
				case 'text': return contentItem.value;
				case 'image': return <MediaItem src={contentItem.value} type='image' isRef={contentItem.isRef} />;
				case 'audio': return <MediaItem src={contentItem.value} type='audio' isRef={contentItem.isRef} />;
				case 'video': return <MediaItem src={contentItem.value} type='video' isRef={contentItem.isRef} />;
				default: return null;
			}
		}

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
						<input id='price' type='text' className='packageView__question__info__price' value={question.price} readOnly />

						{question.type
							? <>
								<label htmlFor='type' className='header'>{localization.type}</label>

								<input
									id='type'
									type='text'
									className='packageView__question__type'
									value={getQuestionTypeName(question.type)}
									readOnly />
							</>
						: null}

						{question.params.answerType
							? <>
								<label htmlFor='answerType' className='header'>{localization.answerType}</label>
								<input id='answerType' type='text' value={question.params.answerType} readOnly />
							</>
						: null}

						{question.params.theme
							? <>
								<label htmlFor='theme' className='header'>{localization.theme}</label>
								<input id='theme' type='text' value={question.params.theme} readOnly />
							</>
						: null}

						{question.params.selectionMode
							? <>
								<label htmlFor='selectionMode' className='header'>{localization.selectionMode}</label>
								<input id='selectionMode' type='text' value={getSetAnswererSelect(question.params.selectionMode)} readOnly />
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

								<div className='packageView__question__screens'>
									{screens.map((_, si) => (
										<div
											className={`packageView__question__screen ${screenIndex === si ? 'selected' : ''}`}
											key={si}
											onClick={() => setScreenIndex(si)}>
											{si + 1}
										</div>
									))}
								</div>

								{screen && screen.length > 0
									? <div className='packageView__question__current__screen'>
										{screen.map((contentItem, ci) => <div
											className='packageView__question__content__item__host'
											key={contentItem.value}>
												{getContentItem(contentItem)}
											</div>)}
									</div>
									: null}

								{question.params.answer
									? <>
										<label htmlFor='name' className='header'>{localization.answer}</label>

										{question.params.answer.items.map((item, ii) => (
											<input
												aria-label='content'
												key={ii}
												className='packageView__theme__info__author'
												value={item.value}
												readOnly />
										))}
									</>
								: null}

								{answerOptions
									? <>
										<label htmlFor='name' className='header'>{localization.answerOptions}</label>

										{Object.keys(answerOptions).map((key, ii) => {
											const option = answerOptions[key] as ContentParam;

											return (
												<div className='packageView__answer__option__host'>
													<div className='packageView__answer__option__label'>{key}</div>

													<input
														aria-label='content'
														key={ii}
														className='packageView__answer__option'
														value={option.items[0].value}
														readOnly />
												</div>
											);
										})}
									</>
								: null}

								<label htmlFor='name' className='header'>{localization.rightAnswers}</label>

								{question.right.answer.map((answer, ri) => (
									<input aria-label='author' key={ri} className='packageView__theme__info__author' value={answer} readOnly />
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
												readOnly />
										))}
									</>
								: null}
							</>
							: null
						}
						</>
						: null
						}

					{getInfo(question)}
				</section>
			</div>
		);
	}

	function switchMode() {
		setMode(mode === Mode.Questions ? Mode.Rounds : Mode.Questions);
	}

	function getQuestionsView(pack: Package): React.ReactNode {
		return <>
			<div className='packageView__rounds'>
				{pack.rounds.map((round, ri) => (
					<div
						key={ri}
						className={`packageView__round ${ri === roundIndex ? 'selected' : ''}`}
						onClick={() => { setRoundIndex(ri); setItem(null); }}>
						{round.name}
					</div>
				))}
			</div>

			{round ? <div className='packageView__table'>
				{round.themes.map((theme, ti) => (
					<div key={ti} className='packageView__theme'>
						<div className={`packageView__theme__name ${item === theme ? 'selected' : ''}`} onClick={() => setItem(theme)}>
							{theme.name}
						</div>

						{theme.questions.map((question, qi) => (
							<div
								key={qi}
								className={`packageView__question
									${item === question ? 'selected' : ''}
									${isThemeList ? 'wide' : ''}`}
								onClick={() => { setItem(question); setScreenIndex(0); }}>
								{isThemeList ? localization.question : (question.price > -1 ? question.price : ' ')}
							</div>
						))}
					</div>
				))}
			</div> : null}
		</>;
	}

	function getRoundsView(pack: Package): React.ReactNode {
		return <div className='packageView__roundInfo'>
			{pack.rounds.map((round, ri) => (
				<div
					key={ri}
					className={`packageView__roundInfo__round ${item === round ? 'selected' : ''}`}
					onClick={() => setItem(round)}>
					{round.name}
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