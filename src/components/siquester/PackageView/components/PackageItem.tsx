import React from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../../state/hooks';
import { Package, InfoOwner } from '../../../../model/siquester/package';
import localization from '../../../../model/resources/localization';
import getLanguage from '../../../../utils/getLanguage';
import {
	updatePackageProperty,
	updateTag,
	addTag,
	removeTag,
	setCurrentItem,
	findItemIndices,
	updateInfoProperty,
	addInfoItem,
	removeInfoItem
} from '../../../../state/siquesterSlice';
import MediaItem from '../../MediaItem/MediaItem';
import CollectionEditor from '../../CollectionEditor/CollectionEditor';

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

		const handleAddAuthor = () => {
			if (isEditable) {
				dispatch(addInfoItem({
					targetType: getTargetType(),
					roundIndex: itemIndices?.roundIndex,
					themeIndex: itemIndices?.themeIndex,
					questionIndex: itemIndices?.questionIndex,
					property: 'authors'
				}));
			}
		};

		const handleRemoveAuthor = (authorIndex: number) => {
			if (isEditable) {
				dispatch(removeInfoItem({
					targetType: getTargetType(),
					roundIndex: itemIndices?.roundIndex,
					themeIndex: itemIndices?.themeIndex,
					questionIndex: itemIndices?.questionIndex,
					property: 'authors',
					index: authorIndex
				}));
			}
		};

		const handleAddSource = () => {
			if (isEditable) {
				dispatch(addInfoItem({
					targetType: getTargetType(),
					roundIndex: itemIndices?.roundIndex,
					themeIndex: itemIndices?.themeIndex,
					questionIndex: itemIndices?.questionIndex,
					property: 'sources'
				}));
			}
		};

		const handleRemoveSource = (sourceIndex: number) => {
			if (isEditable) {
				dispatch(removeInfoItem({
					targetType: getTargetType(),
					roundIndex: itemIndices?.roundIndex,
					themeIndex: itemIndices?.themeIndex,
					questionIndex: itemIndices?.questionIndex,
					property: 'sources',
					index: sourceIndex
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
			<CollectionEditor
				label={localization.authors}
				items={infoOwner.info?.authors || []}
				isEditMode={isEditable}
				className='packageView__info__author'
				getValue={(author) => author.name}
				onItemChange={handleAuthorChange}
				onAddItem={handleAddAuthor}
				onRemoveItem={handleRemoveAuthor}
				placeholder={localization.enterAuthorName}
				preventDeleteLast={getTargetType() === 'package'}
			/>

			<CollectionEditor
				label={localization.sources}
				items={infoOwner.info?.sources || []}
				isEditMode={isEditable}
				className='packageView__info__source'
				getValue={(source) => source.value}
				onItemChange={handleSourceChange}
				onAddItem={handleAddSource}
				onRemoveItem={handleRemoveSource}
				placeholder={localization.enterSource}
			/>

			{(infoOwner.info?.comments && infoOwner.info.comments.length > 0) || isEditable
				? <>
					<label className='header' htmlFor='comments'>{localization.comments}</label>
					<textarea
						id='comments'
						className='packageView__info__comments'
						value={infoOwner.info?.comments || ''}
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
				<div className='packageView__package__info__qualityMark'>
					{/* <input
						id='isQualityMarked'
						type='checkbox'
						checked={currentPack.isQualityMarked}
						disabled={!isEditMode}
						onChange={(e) => isEditMode && dispatch(updatePackageProperty({
							property: 'isQualityMarked',
							value: e.target.checked
						}))}
					/> */}
					<input
						id='isQualityMarked'
						type='checkbox'
						checked={currentPack.isQualityMarked}
						disabled={true}
					/>

					<label htmlFor='isQualityMarked'>{localization.packageQualityMark}</label>
				</div>

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

				<CollectionEditor
					label={localization.tags}
					items={currentPack.tags}
					isEditMode={isEditMode}
					className='packageView__package__info__tag'
					getValue={(tag) => tag.value}
					onItemChange={(index, value) => dispatch(updateTag({ tagIndex: index, value }))}
					onAddItem={() => dispatch(addTag())}
					onRemoveItem={(index) => dispatch(removeTag({ tagIndex: index }))}
					placeholder={localization.enterTag}
				/>

				{currentPack.contactUri || isEditMode
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
