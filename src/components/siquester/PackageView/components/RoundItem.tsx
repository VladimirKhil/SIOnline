import React from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../../state/hooks';
import { Round, InfoOwner, RoundTypes } from '../../../../model/siquester/package';
import localization from '../../../../model/resources/localization';
import {
	updateRoundProperty,
	setCurrentItem,
	findItemIndices,
	updateInfoProperty,
	addInfoItem,
	removeInfoItem
} from '../../../../state/siquesterSlice';
import CollectionEditor from '../../CollectionEditor/CollectionEditor';

interface RoundItemProps {
	item: Round;
	isEditMode: boolean;
}

const RoundItem: React.FC<RoundItemProps> = ({ item, isEditMode }) => {
	const dispatch = useDispatch();
	const pack = useAppSelector(state => state.siquester.pack);
	const currentRound = item;
	const indices = findItemIndices(pack || null, item);

	function getRoundType(type: string): string {
		switch (type) {
			case RoundTypes.Standard: case '': return localization.roundTypeTable;
			case RoundTypes.Final: return localization.themeList;
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
		<div className='info packageView__round__info'>
			<header>
				<div className='main__header'>{localization.round}</div>
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
					className='packageView__round__info__name' 
					value={currentRound.name} 
					readOnly={!isEditMode}
					onChange={(e) => isEditMode && indices.roundIndex !== undefined && dispatch(updateRoundProperty({ 
						roundIndex: indices.roundIndex, 
						property: 'name', 
						value: e.target.value 
					}))}
				/>

				<label htmlFor='type' className='header'>{localization.type}</label>
				{isEditMode ? (
					<select
						id='type'
						className='packageView__round__info__type'
						value={currentRound.type}
						onChange={(e) => indices.roundIndex !== undefined && dispatch(updateRoundProperty({ 
							roundIndex: indices.roundIndex, 
							property: 'type', 
							value: e.target.value 
						}))}
					>
						<option value={RoundTypes.Standard}>{localization.roundTypeTable}</option>
						<option value={RoundTypes.Final}>{localization.themeList}</option>
					</select>
				) : (
					<input
						id='type'
						type='text'
						className='packageView__round__info__type'
						value={getRoundType(currentRound.type)}
						readOnly
					/>
				)}

				{getInfo(currentRound, isEditMode, indices)}
			</section>
		</div>
	);
};

export default RoundItem;
