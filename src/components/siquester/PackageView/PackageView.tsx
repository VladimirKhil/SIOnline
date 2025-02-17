import React from 'react';
import { useAppSelector } from '../../../state/hooks';
import { Package, Question, Round, Theme } from '../../../model/siquester/package';

import './PackageView.scss';
import localization from '../../../model/resources/localization';

const PackageView: React.FC = () => {
	const siquester = useAppSelector(state => state.siquester);
	const { pack } = siquester;
	const [roundIndex, setRoundIndex] = React.useState(0);
	const [item, setItem] = React.useState<Package | Round | Theme | Question | null>(null);

	if (!pack) {
		return <div>Loading...</div>;
	}

	const round = pack.rounds[roundIndex];

	function getItemView(item: Package | Round | Theme | Question | null): React.ReactNode {
		if (!item) {
			return null;
		}

		if ('rounds' in item) { // Package
			return (
				<div className='packageView__package__info'>

				</div>
			);
		}

		if ('themes' in item) { // Round
			const round = item as Round;

			return (
				<div className='packageView__round__info'>
					<div className='packageView__round__info__name'>{round.name}</div>
					<div className='packageView__round__info__type'>{round.type}</div>
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

					{theme.info?.authors
						? <>
							<label className='header'>{localization.authors}</label>

							{theme.info?.authors?.map((author, ai) => (
								<input aria-label='author' key={ai} className='packageView__theme__info__author' value={author.name} readOnly />
							))}
						</> : null}

					{theme.info?.sources
						? <>
							<label className='header' htmlFor='sources'>{localization.sources}</label>

							{theme.info?.sources?.map((source, si) => (
								<input id='sources' key={si} className='packageView__theme__info__source' value={source.value} readOnly />
							))}
						</> : null}

					{theme.info?.comments
						? <>
							<label className='header' htmlFor='comments'>{localization.comments}</label>
							<input id='comments' type='text' className='packageView__theme__info__comments' value={theme.info.comments} readOnly />
						</> : null}
				</div>
			);
		}

		return (
			<div className='packageView__question__info'>

			</div>
		);
	}

	return (
		<div className='packageView'>
			<div className='packageView__structure'>
				<div className='packageView__package'>{pack.name}</div>

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
									className={`packageView__question ${item === question ? 'selected' : ''}`}
									onClick={() => setItem(question)}>
									{question.price}
								</div>
							))}
						</div>
					))}
				</div> : null}
			</div>

			<div className='packageView__object'>
				{getItemView(item)}
			</div>
		</div>
	);
};

export default PackageView;