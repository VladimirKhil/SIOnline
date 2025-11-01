import React from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../../state/hooks';
import { Package, InfoOwner } from '../../../../model/siquester/package';
import localization from '../../../../model/resources/localization';
import getLanguage from '../../../../utils/getLanguage';
import {
	updatePackageProperty,
	updateTag,
	setCurrentItem,
	findItemIndices,
	updateInfoProperty
} from '../../../../state/siquesterSlice';
import MediaItem from '../../MediaItem/MediaItem';

interface PackageItemProps {
	item: Package;
	isEditMode: boolean;
}

const PackageItem: React.FC<PackageItemProps> = ({ item, isEditMode }) => {
	const dispatch = useDispatch();
	const pack = useAppSelector(state => state.siquester.pack);
	const currentPack = item;
	const indices = findItemIndices(pack || null, item);

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

	return (
		<div className='info packageView__package__info'>
			<header>
				<div className='main__header'>{localization.package}</div>
				<button
					type='button'
					className='standard'
					onClick={() => dispatch(setCurrentItem({ isPackageSelected: false }))}
				>
					{localization.close}
				</button>
			</header>

			<section className='info__content'>
				<label htmlFor='name' className='header'>{localization.name}</label>
				<input
					id='name'
					type='text'
					className='packageView__package__info__name'
					value={currentPack.name}
					readOnly={!isEditMode}
					onChange={(e) => isEditMode && dispatch(updatePackageProperty({ property: 'name', value: e.target.value }))}
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
					onChange={(e) => isEditMode && dispatch(updatePackageProperty({ property: 'date', value: e.target.value }))}
				/>

				<label htmlFor='language' className='header'>{localization.language}</label>

				{isEditMode ? (
					<select
						id='language'
						className='packageView__package__info__language'
						value={currentPack.language}
						onChange={(e) => dispatch(updatePackageProperty({ property: 'language', value: e.target.value }))}
					>
						<option value='en-US'>{localization.languageEn}</option>
						<option value='ru-RU'>{localization.languageRu}</option>
						<option value='sr-RS'>{localization.languageSr}</option>
					</select>
				) : (
					<input
						id='language'
						type='text'
						className='packageView__package__info__language'
						value={getLanguage(currentPack.language)}
						readOnly
					/>
				)}

				<label htmlFor='publisher' className='header'>{localization.publisher}</label>
				<input
					id='publisher'
					type='text'
					className='packageView__package__info__publisher'
					value={currentPack.publisher}
					readOnly={!isEditMode}
					onChange={(e) => isEditMode && dispatch(updatePackageProperty({ property: 'publisher', value: e.target.value }))}
				/>

				<label htmlFor='restriction' className='header'>{localization.restriction}</label>
				<input
					id='restriction'
					type='text'
					className='packageView__package__info__restriction'
					value={currentPack.restriction}
					readOnly={!isEditMode}
					onChange={(e) => isEditMode && dispatch(updatePackageProperty({ property: 'restriction', value: e.target.value }))}
				/>

				<label htmlFor='difficulty' className='header'>{localization.difficulty}</label>
				<input
					id='difficulty'
					type='number'
					min='1'
					max='10'
					className='packageView__package__info__difficulty'
					value={currentPack.difficulty}
					readOnly={!isEditMode}
					onChange={(e) => isEditMode && dispatch(updatePackageProperty({ 
						property: 'difficulty', 
						value: Math.min(10, Math.max(1, parseInt(e.target.value, 10) || 1))
					}))}
				/>

				<div className='packageView__package__info__qualityMark'>
					<input
						id='isQualityMarked'
						type='checkbox'
						checked={currentPack.isQualityMarked}
						disabled={!isEditMode}
						onChange={(e) => isEditMode && dispatch(updatePackageProperty({ 
							property: 'isQualityMarked', 
							value: e.target.checked 
						}))}
					/>
					<label htmlFor='isQualityMarked'>{localization.packageQualityMark}</label>
				</div>

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
								onChange={(e) => isEditMode && dispatch(updateTag({ tagIndex: ti, value: e.target.value }))}
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
							onChange={(e) => isEditMode && dispatch(updatePackageProperty({ 
								property: 'contactUri',
								value: e.target.value
							}))}
						/>
					</> : null}

				{getInfo(currentPack, isEditMode, indices)}
			</section>
		</div>
	);
};

export default PackageItem;
