import React from 'react';
import { ContentItem, ContentParam, ContentType } from '../../../model/siquester/package';
import MediaItem from '../MediaItem/MediaItem';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import localization from '../../../model/resources/localization';
import Constants from '../../../model/enums/Constants';
import { useDispatch } from 'react-redux';
import getExtension from '../../../utils/FileHelper';
import { userErrorChanged } from '../../../state/commonSlice';
import {
	updateContentItem,
	setContentItemType,
	setContentItemMedia,
	addContentScreen,
	removeContentScreen,
	addScreenContentItem,
	removeScreenContentItem,
} from '../../../state/siquesterSlice';

import './ScreensView.scss';

interface ScreensViewProps {
	content: ContentParam;
	isEditMode?: boolean;
	roundIndex?: number;
	themeIndex?: number;
	questionIndex?: number;
	paramName?: string;
}

interface ContentGroup {
	content: ContentItem[];
	weight: number;
	columnCount: number;
}

interface Screen {
	duration?: number;
	items: ContentItem[];
	groups: ContentGroup[];
	background?: ContentItem;
	replic?: ContentItem;
}

type MediaContentType = Exclude<ContentType, 'text'>;
type ContentMode = ContentType | 'replic';

const contentTypeOptions: ReadonlyArray<{ type: ContentMode; label: string }> = [
	{ type: 'text', label: localization.text },
	{ type: 'replic', label: localization.replic },
	{ type: 'image', label: localization.images },
	{ type: 'audio', label: localization.audio },
	{ type: 'video', label: localization.video },
	{ type: 'html', label: localization.html },
];

const fileAcceptByType: Record<MediaContentType, string> = {
	image: '.jpg,.jpe,.jpeg,.png,.gif,.webp,.avif',
	audio: '.mp3,.opus',
	video: '.mp4',
	html: '.html',
};

const maxFileSizeMbByType: Record<MediaContentType, number> = {
	image: 1,
	audio: 5,
	video: 10,
	html: 1,
};

const allowedExtensionsByType: Record<MediaContentType, string[]> = {
	image: ['.jpg', '.jpe', '.jpeg', '.png', '.gif', '.webp', '.avif'],
	audio: ['.mp3', '.opus'],
	video: ['.mp4'],
	html: ['.html'],
};

function getContentTypeLabel(type: ContentMode): string {
	switch (type) {
		case 'text':
			return localization.text;
		case 'replic':
			return localization.replic;
		case 'image':
			return localization.images;
		case 'audio':
			return localization.audio;
		case 'video':
			return localization.video;
		case 'html':
			return localization.html;
		default:
			return type;
	}
}

function getContentTypeIcon(type: ContentMode): React.ReactNode {
	const commonProps = {
		viewBox: '0 0 20 20',
		fill: 'none',
		stroke: 'currentColor',
		strokeWidth: 1.7,
		strokeLinecap: 'round' as const,
		strokeLinejoin: 'round' as const,
		className: 'screensView__content__type__icon',
		'aria-hidden': true,
	};

	switch (type) {
		case 'text':
			return <svg {...commonProps}><path d='M4 5.5h12' /><path d='M10 5.5v9' /><path d='M7 14.5h6' /></svg>;
		case 'replic':
			return <svg {...commonProps}><path d='M5 6.5h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H9l-3.5 2v-2H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Z' /></svg>;
		case 'image':
			return <svg {...commonProps}>
				<rect x='3' y='4' width='14' height='12' rx='2' />
				<circle cx='8' cy='8' r='1.5' />
				<path d='M5 13l3-3 2.5 2.5 2-2 2.5 2.5' />
			</svg>;
		case 'audio':
			return <svg {...commonProps}>
				<path d='M6.5 12.5H4V7.5h2.5L10 5v10l-3.5-2.5z' />
				<path d='M12.5 8a3 3 0 010 4' />
				<path d='M14.5 6a5.5 5.5 0 010 8' />
			</svg>;
		case 'video':
			return <svg {...commonProps}><rect x='3' y='4.5' width='14' height='11' rx='2' /><path d='M8 8l5 2.5L8 13z' /></svg>;
		case 'html':
			return <svg {...commonProps}><path d='M8 6L4.5 10 8 14' /><path d='M12 6l3.5 4-3.5 4' /><path d='M11 4.5L9 15.5' /></svg>;
		default:
			return null;
	}
}

function timeStringToSeconds(time: string): number {
	const [hours, minutes, seconds] = time.split(':').map(Number);
	return (hours * 3600) + (minutes * 60) + seconds;
}

function initGroup(group: ContentGroup) {
	let bestRowCount = 1;
	let bestColumnCount = group.content.length / bestRowCount;
	let bestItemSize = Math.min(9.0 / bestRowCount, 16.0 / bestColumnCount);

	for (let rowCount = 2; rowCount < group.content.length; rowCount += 1) {
		const columnCount = Math.ceil(group.content.length / rowCount);
		const itemSize = Math.min(9.0 / rowCount, 16.0 / columnCount);

		if (itemSize > bestItemSize) {
			bestItemSize = itemSize;
			bestRowCount = rowCount;
			bestColumnCount = columnCount;
		}
	}

	group.columnCount = bestColumnCount;
	group.weight *= bestRowCount;
}

const ScreensView: React.FC<ScreensViewProps> = ({
	content,
	isEditMode = false,
	roundIndex,
	themeIndex,
	questionIndex,
	paramName
}) => {
	const dispatch = useDispatch();
	const [screenIndex, setScreenIndex] = React.useState(0);
	const contentRef = React.useRef(content);
	const pendingFileTargetRef = React.useRef<{ itemIndex: number; type: MediaContentType } | null>(null);
	const fileInputRefs = React.useRef<Record<MediaContentType, HTMLInputElement | null>>({
		image: null,
		audio: null,
		video: null,
		html: null,
	});

	React.useEffect(() => {
		if (content.items.length !== contentRef.current.items.length) {
			setScreenIndex(0);
		}

		contentRef.current = content;
	}, [content]);

	const screens: Screen[] = [];
	const groups: ContentGroup[] = [];
	let group: ContentGroup | undefined = undefined;
	let background: ContentItem | undefined = undefined;
	let replic: ContentItem | undefined = undefined;
	let backgroundDuration = 0;
	let replicDuration = 0;
	let duration = 0;
	let screenStartIndex = 0;

	for (let i = 0; i < content.items.length; i += 1) {
		const contentItem = content.items[i];
		const contentDuration = contentItem.duration ? timeStringToSeconds(contentItem.duration) : 0;

		switch (contentItem.placement) {
			case 'background':
				background = contentItem;
				backgroundDuration = Math.max(backgroundDuration, contentDuration);
				break;

			case 'replic':
				replic = contentItem;
				replicDuration = Math.max(replicDuration, contentDuration);
				break;

			default: // TODO: unify with ClientController.onScreenContent() in the future
				switch (contentItem.type) {
					case 'text': {
						if (group) {
							groups.push(group);
							initGroup(group);
							group = undefined;
						}

						const textWeight = Math.min(
							Constants.LARGE_CONTENT_WEIGHT,
							Math.max(1, contentItem.value.length / 80),
						);
						const textGroup: ContentGroup = { content: [contentItem], weight: textWeight, columnCount: 1 };
						groups.push(textGroup);
						break;
					}

					default:
						if (!group) {
							group = { content: [], weight: Constants.LARGE_CONTENT_WEIGHT, columnCount: 1 };
						}

						group.content.push(contentItem);
						break;
				}

				duration += contentDuration;
				break;
		}

		if (contentItem.waitForFinish) {
			if (group) {
				groups.push(group);
				initGroup(group);
				group = undefined;
			}

			const screen: Screen = {
				items: content.items.slice(screenStartIndex, i + 1),
				groups: [...groups],
			};

			if (background) {
				screen.background = background;
				background = undefined;
			}

			if (replic) {
				screen.replic = replic;
				replic = undefined;
			}

			const screenDuration = Math.max(backgroundDuration, replicDuration, duration);

			if (screenDuration > 0) {
				screen.duration = screenDuration;
				duration = 0;
				backgroundDuration = 0;
				replicDuration = 0;
			}

			screens.push(screen);
			groups.length = 0;
			screenStartIndex = i + 1;
		}
	}

	if (group) {
		groups.push(group);
		initGroup(group);
		group = undefined;
	}

	if (groups.length > 0 || background || replic) {
		const screen: Screen = {
			items: content.items.slice(screenStartIndex, content.items.length),
			groups: [...groups],
		};

		if (background) {
			screen.background = background;
		}

		if (replic) {
			screen.replic = replic;
		}

		const screenDuration = Math.max(backgroundDuration, replicDuration, duration);

		if (screenDuration > 0) {
			screen.duration = duration;
		}

		screens.push(screen);
	}

	const screen = screens[screenIndex];

	const findContentItemIndex = (targetItem: ContentItem): number => content.items.findIndex(item => item === targetItem);

	function getContentItem(contentItem: ContentItem, itemIndex: number): React.ReactNode {
		const handleContentChange = (property: 'value', value: string) => {
			if (isEditMode &&
				typeof roundIndex === 'number' &&
				typeof themeIndex === 'number' &&
				typeof questionIndex === 'number' &&
				paramName) {
				dispatch(updateContentItem({
					roundIndex,
					themeIndex,
					questionIndex,
					paramName,
					itemIndex,
					property,
					value
				}));
			}
		};

		// For internal refs (when isRef is true), encode the URI to find the correct file in the ZIP package
		// For external URLs (when isRef is false), use as-is
		const getMediaSrc = (value: string, isRef: boolean): string => {
			if (isRef) {
				// Internal ZIP reference - encode to match file paths in ZIP
				return encodeURIComponent(value);
			}

			// External URL - use as-is
			return value;
		};

		const mediaKey = `${contentItem.type}:${contentItem.value}:${contentItem.isRef ? 'ref' : 'url'}`;

		switch (contentItem.type) {
			case 'text':
				return isEditMode ? (
					<textarea
						className='screensView__editable__text'
						value={contentItem.value}
						placeholder={localization.enterTextContent}
						aria-label="Edit text content"
						onChange={(e) => handleContentChange('value', e.target.value)}
					/>
				) : (
					<AutoSizedText maxFontSize={20}>{contentItem.value}</AutoSizedText>
				);
			case 'image':
				return <MediaItem
					key={mediaKey}
					src={getMediaSrc(contentItem.value, contentItem.isRef)}
					type='image'
					isRef={contentItem.isRef}
				/>;
			case 'audio':
				return <MediaItem
					key={mediaKey}
					src={getMediaSrc(contentItem.value, contentItem.isRef)}
					type='audio'
					isRef={contentItem.isRef}
				/>;
			case 'video':
				return <MediaItem
					key={mediaKey}
					src={getMediaSrc(contentItem.value, contentItem.isRef)}
					type='video'
					isRef={contentItem.isRef}
				/>;
			case 'html':
				return <MediaItem
					key={mediaKey}
					src={getMediaSrc(contentItem.value, contentItem.isRef)}
					type='html'
					isRef={contentItem.isRef}
				/>;
			default: return null;
		}
	}

	const canAddScreen = isEditMode &&
		typeof roundIndex === 'number' &&
		typeof themeIndex === 'number' &&
		typeof questionIndex === 'number' &&
		paramName;

	const canRemoveScreen = canAddScreen && (screens.length > 1 || paramName === 'answer');

	// Count total content items in the current screen
	const screenContentCount = screen ? screen.items.length : 0;

	const isContentModeSelected = (contentItem: ContentItem, mode: ContentMode): boolean => {
		if (mode === 'replic') {
			return contentItem.placement === 'replic' && contentItem.type === 'text';
		}

		return contentItem.placement !== 'replic' && contentItem.type === mode;
	};

	const handleRemoveContentItem = (itemIndex: number) => {
		if (canAddScreen) {
			dispatch(removeScreenContentItem({
				roundIndex: roundIndex as number,
				themeIndex: themeIndex as number,
				questionIndex: questionIndex as number,
				paramName: paramName as string,
				itemIndex,
			}));
		}
	};

	const handleDurationChange = (itemIndex: number, seconds: string) => {
		if (isEditMode &&
			typeof roundIndex === 'number' &&
			typeof themeIndex === 'number' &&
			typeof questionIndex === 'number' &&
			paramName) {
			const numVal = parseInt(seconds, 10);
			const timeStr = !seconds || isNaN(numVal) || numVal <= 0
				? ''
				: `0:0:${numVal}`;
			dispatch(updateContentItem({
				roundIndex,
				themeIndex,
				questionIndex,
				paramName,
				itemIndex,
				property: 'duration',
				value: timeStr,
			}));
		}
	};

	const handleAddScreen = () => {
		if (canAddScreen) {
			dispatch(addContentScreen({
				roundIndex: roundIndex as number,
				themeIndex: themeIndex as number,
				questionIndex: questionIndex as number,
				paramName: paramName as string,
				afterScreenIndex: screenIndex,
			}));
			setScreenIndex(screenIndex + 1);
		}
	};

	const handleRemoveScreen = (si: number) => {
		if (canRemoveScreen) {
			dispatch(removeContentScreen({
				roundIndex: roundIndex as number,
				themeIndex: themeIndex as number,
				questionIndex: questionIndex as number,
				paramName: paramName as string,
				screenIndex: si,
			}));

			if (si >= screens.length - 1) {
				setScreenIndex(Math.max(0, si - 1));
			} else if (si < screenIndex) {
				setScreenIndex(screenIndex - 1);
			} else if (si === screenIndex && si === screens.length - 1) {
				setScreenIndex(Math.max(0, si - 1));
			}
		}
	};

	const handleAddContentItem = () => {
		if (canAddScreen) {
			dispatch(addScreenContentItem({
				roundIndex: roundIndex as number,
				themeIndex: themeIndex as number,
				questionIndex: questionIndex as number,
				paramName: paramName as string,
				screenIndex,
			}));
		}
	};

	const handleTextTypeSelected = (contentItem: ContentItem, itemIndex: number) => {
		if (!canAddScreen) {
			return;
		}

		if (contentItem.type !== 'text') {
			dispatch(setContentItemType({
				roundIndex: roundIndex as number,
				themeIndex: themeIndex as number,
				questionIndex: questionIndex as number,
				paramName: paramName as string,
				itemIndex,
				type: 'text',
			}));
		}

		if (contentItem.placement === 'replic') {
			dispatch(updateContentItem({
				roundIndex: roundIndex as number,
				themeIndex: themeIndex as number,
				questionIndex: questionIndex as number,
				paramName: paramName as string,
				itemIndex,
				property: 'placement',
				value: 'screen',
			}));
		}
	};

	const handleReplicTypeSelected = (contentItem: ContentItem, itemIndex: number) => {
		if (!canAddScreen) {
			return;
		}

		if (contentItem.type !== 'text') {
			dispatch(setContentItemType({
				roundIndex: roundIndex as number,
				themeIndex: themeIndex as number,
				questionIndex: questionIndex as number,
				paramName: paramName as string,
				itemIndex,
				type: 'text',
			}));
		}

		if (contentItem.placement !== 'replic') {
			dispatch(updateContentItem({
				roundIndex: roundIndex as number,
				themeIndex: themeIndex as number,
				questionIndex: questionIndex as number,
				paramName: paramName as string,
				itemIndex,
				property: 'placement',
				value: 'replic',
			}));
		}
	};

	const readMediaFile = async (file: File, type: MediaContentType): Promise<string> => {
		if (type === 'html') {
			return file.text();
		}

		return new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				if (typeof reader.result !== 'string') {
					reject(new Error('Unexpected file reader result'));
					return;
				}

				const [, base64Data = ''] = reader.result.split(',');
				resolve(base64Data);
			};
			reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
			reader.readAsDataURL(file);
		});
	};

	const handleMediaTypeSelected = (contentItem: ContentItem, itemIndex: number, type: MediaContentType) => {
		if (!canAddScreen) {
			return;
		}

		if (contentItem.placement === 'replic') {
			dispatch(updateContentItem({
				roundIndex: roundIndex as number,
				themeIndex: themeIndex as number,
				questionIndex: questionIndex as number,
				paramName: paramName as string,
				itemIndex,
				property: 'placement',
				value: 'screen',
			}));
		}

		pendingFileTargetRef.current = { itemIndex, type };
		fileInputRefs.current[type]?.click();
	};

	const handleContentFileChange = async (type: MediaContentType, event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		const target = pendingFileTargetRef.current;
		event.target.value = '';
		pendingFileTargetRef.current = null;

		if (!file || !target || target.type !== type || !canAddScreen) {
			return;
		}

		const maxFileSizeMb = maxFileSizeMbByType[type];

		if (file.size > maxFileSizeMb * 1024 * 1024) {
			dispatch(userErrorChanged(`${localization.fileIsTooBig} (${maxFileSizeMb} MB)`));
			return;
		}

		const extension = getExtension(file.name);
		const normalizedExtension = extension ? `.${extension.toLowerCase()}` : '';

		if (!allowedExtensionsByType[type].includes(normalizedExtension)) {
			dispatch(userErrorChanged(`${localization.unsupportedMediaType}: ${normalizedExtension || file.name}`));
			return;
		}

		const fileData = await readMediaFile(file, type);

		dispatch(setContentItemMedia({
			roundIndex: roundIndex as number,
			themeIndex: themeIndex as number,
			questionIndex: questionIndex as number,
			paramName: paramName as string,
			itemIndex: target.itemIndex,
			type,
			fileName: file.name,
			fileData,
		}));
	};

	const renderContentTypeButtons = (contentItem: ContentItem, itemIndex: number) => (
		<div className='screensView__content__type__buttons' role='group' aria-label={localization.content}>
			{contentTypeOptions.map(({ type }) => (
				<button
					key={`${itemIndex}-${type}`}
					type='button'
					className={`screensView__content__type__button ${isContentModeSelected(contentItem, type) ? 'selected' : ''}`}
					onClick={() => {
						if (type === 'text') {
							handleTextTypeSelected(contentItem, itemIndex);
							return;
						}

						if (type === 'replic') {
							handleReplicTypeSelected(contentItem, itemIndex);
							return;
						}

						handleMediaTypeSelected(contentItem, itemIndex, type);
					}}
					title={getContentTypeLabel(type)}
					aria-label={getContentTypeLabel(type)}
				>
					{getContentTypeIcon(type)}
				</button>
			))}
		</div>
	);

	return (
		<>
			{isEditMode ? (
				<>
					{(['image', 'audio', 'video', 'html'] as MediaContentType[]).map(type => (
						<input
							key={type}
							type='file'
							accept={fileAcceptByType[type]}
							aria-label={getContentTypeLabel(type)}
							title={getContentTypeLabel(type)}
							className='screensView__content__type__fileInput'
							ref={(element) => { fileInputRefs.current[type] = element; }}
							onChange={(event) => {
								void handleContentFileChange(type, event);
							}}
						/>
					))}
				</>
			) : null}
			{(screens.length > 1 || isEditMode) ? <div className='packageView__question__screens'>
				{screens.map((_, si) => (
					<div
						className={`packageView__question__screen ${screenIndex === si ? 'selected' : ''}`}
						key={si}
						onClick={() => setScreenIndex(si)}>
						{si + 1}
						{canRemoveScreen ? (
							<button
								type='button'
								className='packageView__question__screen__remove'
								onClick={(e) => { e.stopPropagation(); handleRemoveScreen(si); }}
								title={localization.removeScreen}
								aria-label={localization.removeScreen}
							>✕</button>
						) : null}
					</div>
				))}

				{canAddScreen ? (
					<button
						type='button'
						className='packageView__question__screen__add'
						onClick={handleAddScreen}
						title={localization.addScreen}
						aria-label={localization.addScreen}
					>+</button>
				) : null}
			</div> : null}

			{screen
				? <>
					{!isEditMode && screen.duration ? <div className='packageView__question__duration'>
						<div className='packageView__question__duration__item'>
							<label htmlFor='duration' className='header'>{localization.screenDuration}</label>
							<input id='duration' type='text' value={screen.duration} readOnly />
						</div>
					</div> : null}

					{isEditMode ? (
						// Simple vertical list view in edit mode
						<div className='packageView__question__content__list'>
							{screen.items.map((contentItem, itemOrder) => {
								const globalIndex = content.items.findIndex(item => item === contentItem);
								const durationSeconds = contentItem.duration
									? timeStringToSeconds(contentItem.duration)
									: undefined;
								const hasDuration = durationSeconds !== undefined && durationSeconds > 0;

								return (
									<div className='packageView__question__content__list__item' key={`${globalIndex}-${itemOrder}`}>
										<div className='screensView__content__item__controls'>
											<label className='screensView__duration__label'>
												<input
													type='checkbox'
													checked={hasDuration}
													onChange={(e) => {
														if (e.target.checked) {
															handleDurationChange(globalIndex, '1');
														} else {
															handleDurationChange(globalIndex, '');
														}
													}}
												/>
												{localization.duration}
												{hasDuration ? (
													<input
														type='number'
														className='screensView__duration__input'
														min={1}
														max={120}
														value={durationSeconds}
														aria-label={localization.duration}
														onChange={(e) => handleDurationChange(globalIndex, e.target.value)}
													/>
												) : null}
											</label>
											{renderContentTypeButtons(contentItem, globalIndex)}
											{screenContentCount > 1 ? (
												<button
													type='button'
													className='screensView__content__item__remove'
													onClick={() => handleRemoveContentItem(globalIndex)}
													title={localization.removeContentItem}
													aria-label={localization.removeContentItem}
												>✕</button>
											) : null}
										</div>
										{getContentItem(contentItem, globalIndex)}
									</div>
								);
							})}
							<button
								type='button'
								className='packageView__question__content__add'
								onClick={handleAddContentItem}
								title={localization.addContentItem}
								aria-label={localization.addContentItem}
							>+</button>
						</div>
					) : (
						// Original grid layout for view mode
						<>
							{screen.groups.length > 0 ? <div className='packageView__question__current__screen'>
								{screen.groups.map((screenGroup, gi) => <div
									className='packageView__question__content__item__group'
									key={gi}
									style={{
										flex: screenGroup.weight,
										gridTemplateColumns: `repeat(${screenGroup.columnCount}, 1fr)`
									}}>
									{screenGroup.content.map((contentItem, ci) => {
										const globalIndex = content.items.findIndex(item => item === contentItem);
										return (
											<div
												className='packageView__question__content__item'
												key={`${gi}-${ci}`}>
												{getContentItem(contentItem, globalIndex)}
											</div>
										);
									})}
								</div>)}
							</div> : null}

							{screen.background ? <div className='packageView__question__background'>
								{getContentItem(screen.background, findContentItemIndex(screen.background))}
							</div> : null}

							{screen.replic ? <div className='packageView__question__replic'>
								{getContentItem(screen.replic, findContentItemIndex(screen.replic))}
							</div> : null}
						</>
					)}
				</>
				: null}
		</>
	);
};

export default ScreensView;