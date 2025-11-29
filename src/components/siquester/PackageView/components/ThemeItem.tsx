import React from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../../state/hooks';
import { Theme, InfoOwner } from '../../../../model/siquester/package';
import localization from '../../../../model/resources/localization';
import {
	updateThemeProperty,
	setCurrentItem,
	findItemIndices,
	updateInfoProperty,
	addInfoItem,
	removeInfoItem
} from '../../../../state/siquesterSlice';
import CollectionEditor from '../../CollectionEditor/CollectionEditor';

interface ThemeItemProps {
	item: Theme;
	isEditMode: boolean;
}

const ThemeItem: React.FC<ThemeItemProps> = ({ item, isEditMode }) => {
	const dispatch = useDispatch();
	const pack = useAppSelector(state => state.siquester.pack);
	const theme = item;
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
		<div className='info'>
			<header>
				<div className='main__header'>{localization.theme}</div>
				<button 
					type='button' 
					className='standard' 
					onClick={() => dispatch(setCurrentItem({ isPackageSelected: false }))}
				>
					{localization.close}
				</button>
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
						dispatch(updateThemeProperty({ 
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
};

export default ThemeItem;
