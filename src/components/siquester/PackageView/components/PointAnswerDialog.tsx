import React from 'react';
import Dialog from '../../../common/Dialog/Dialog';
import MediaItem from '../../MediaItem/MediaItem';
import localization from '../../../../model/resources/localization';

import './PointAnswerDialog.scss';

interface PointAnswerDialogProps {
	answer?: string;
	deviation?: string;
	src: string;
	isRef: boolean;
	onApply: (answer: string, deviation: string) => void;
	onClose: () => void;
}

interface NormalizedPoint {
	x: number;
	y: number;
}

interface RenderedBounds {
	x: number;
	y: number;
	width: number;
	height: number;
	aspectRatio: number;
}

const defaultDeviation = 0.05;

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

function formatNumber(value: number): string {
	return value.toFixed(2);
}

function formatDeviation(value: number): string {
	return value.toFixed(2);
}

function parseAnswer(answer?: string): { point: NormalizedPoint; aspectRatio?: number } | null {
	if (!answer) {
		return null;
	}

	const parts = answer.split(',').map(part => part.trim());

	if (parts.length < 2) {
		return null;
	}

	const x = parseFloat(parts[0]);
	const y = parseFloat(parts[1]);
	const aspectRatio = parts.length >= 3 ? parseFloat(parts[2]) : undefined;

	if (isNaN(x) || isNaN(y)) {
		return null;
	}

	return {
		point: {
			x: clamp(x, 0, 1),
			y: clamp(y, 0, 1),
		},
		aspectRatio: aspectRatio !== undefined && !isNaN(aspectRatio) ? aspectRatio : undefined,
	};
}

function parseDeviation(value?: string): number {
	if (!value) {
		return defaultDeviation;
	}

	const parsedValue = parseFloat(value);

	return isNaN(parsedValue) ? defaultDeviation : clamp(parsedValue, 0, 1);
}

function getImageRenderedBounds(img: HTMLImageElement): RenderedBounds | null {
	const { naturalWidth, naturalHeight, clientWidth, clientHeight } = img;

	if (naturalWidth === 0 || naturalHeight === 0 || clientWidth === 0 || clientHeight === 0) {
		return null;
	}

	const imageAspect = naturalWidth / naturalHeight;
	const containerAspect = clientWidth / clientHeight;

	let renderWidth: number;
	let renderHeight: number;

	if (imageAspect > containerAspect) {
		renderWidth = clientWidth;
		renderHeight = clientWidth / imageAspect;
	} else {
		renderHeight = clientHeight;
		renderWidth = clientHeight * imageAspect;
	}

	return {
		x: (clientWidth - renderWidth) / 2,
		y: (clientHeight - renderHeight) / 2,
		width: renderWidth,
		height: renderHeight,
		aspectRatio: imageAspect,
	};
}

function getImageElement(host: HTMLDivElement | null): HTMLImageElement | null {
	return host?.querySelector('img') ?? null;
}

export default function PointAnswerDialog({
	answer,
	deviation,
	src,
	isRef,
	onApply,
	onClose,
}: PointAnswerDialogProps): JSX.Element {
	const hostRef = React.useRef<HTMLDivElement>(null);
	const parsedAnswer = React.useMemo(() => parseAnswer(answer), [answer]);
	const [point, setPoint] = React.useState<NormalizedPoint | null>(parsedAnswer?.point ?? null);
	const [radius, setRadius] = React.useState(parseDeviation(deviation));
	const [layoutVersion, setLayoutVersion] = React.useState(0);

	React.useEffect(() => {
		setPoint(parsedAnswer?.point ?? null);
	}, [parsedAnswer]);

	React.useEffect(() => {
		setRadius(parseDeviation(deviation));
	}, [deviation]);

	React.useEffect(() => {
		const host = hostRef.current;

		if (!host) {
			return;
		}

		let currentImage: HTMLImageElement | null = null;
		let resizeObserver: ResizeObserver | null = null;

		const updateLayout = () => {
			setLayoutVersion(version => version + 1);
		};

		const detachImage = () => {
			if (currentImage) {
				currentImage.removeEventListener('load', updateLayout);
				currentImage = null;
			}

			if (resizeObserver) {
				resizeObserver.disconnect();
				resizeObserver = null;
			}
		};

		const attachImage = () => {
			detachImage();

			currentImage = getImageElement(host);

			if (!currentImage) {
				return;
			}

			currentImage.addEventListener('load', updateLayout);

			if (typeof ResizeObserver !== 'undefined') {
				resizeObserver = new ResizeObserver(updateLayout);
				resizeObserver.observe(currentImage);
			}

			if (currentImage.complete) {
				updateLayout();
			}
		};

		const mutationObserver = new MutationObserver(attachImage);
		mutationObserver.observe(host, { childList: true, subtree: true });
		attachImage();

		window.addEventListener('resize', updateLayout);

		return () => {
			window.removeEventListener('resize', updateLayout);
			mutationObserver.disconnect();
			detachImage();
		};
	}, [src, isRef]);

	const renderedBounds = React.useMemo(() => {
		const image = getImageElement(hostRef.current);

		return image ? getImageRenderedBounds(image) : null;
	}, [layoutVersion]);

	const markerStyle = React.useMemo(() => {
		const image = getImageElement(hostRef.current);

		if (!point || !renderedBounds || !image) {
			return null;
		}

		return {
			left: image.offsetLeft + renderedBounds.x + (point.x * renderedBounds.width),
			top: image.offsetTop + renderedBounds.y + (point.y * renderedBounds.height),
			radius: radius * renderedBounds.width,
		};
	}, [point, radius, renderedBounds]);

	const answerPreview = React.useMemo(() => {
		if (!point) {
			return '';
		}

		const aspectRatio = renderedBounds?.aspectRatio ?? parsedAnswer?.aspectRatio;

		if (!aspectRatio) {
			return `${formatNumber(point.x)},${formatNumber(point.y)}`;
		}

		return `${formatNumber(point.x)},${formatNumber(point.y)},${formatNumber(aspectRatio)}`;
	}, [parsedAnswer, point, renderedBounds]);

	const handleImageClick = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
		const image = getImageElement(hostRef.current);

		if (!image) {
			return;
		}

		const bounds = getImageRenderedBounds(image);

		if (!bounds) {
			return;
		}

		const imageRect = image.getBoundingClientRect();
		const localX = event.clientX - imageRect.left;
		const localY = event.clientY - imageRect.top;

		if (
			localX < bounds.x ||
			localX > bounds.x + bounds.width ||
			localY < bounds.y ||
			localY > bounds.y + bounds.height
		) {
			return;
		}

		setPoint({
			x: clamp((localX - bounds.x) / bounds.width, 0, 1),
			y: clamp((localY - bounds.y) / bounds.height, 0, 1),
		});
	}, []);

	const handleRadiusChange = React.useCallback((value: string) => {
		const parsedValue = parseFloat(value);

		if (isNaN(parsedValue)) {
			setRadius(0);
			return;
		}

		setRadius(clamp(parsedValue, 0, 1));
	}, []);

	const handleApply = React.useCallback(() => {
		if (!point) {
			return;
		}

		const aspectRatio = renderedBounds?.aspectRatio ?? parsedAnswer?.aspectRatio;

		if (!aspectRatio) {
			return;
		}

		onApply(
			`${formatNumber(point.x)},${formatNumber(point.y)},${formatNumber(aspectRatio)}`,
			formatDeviation(radius),
		);
	}, [onApply, parsedAnswer, point, radius, renderedBounds]);

	return (
		<Dialog className='pointAnswerDialog animated' title={localization.pointAnswerSet} onClose={onClose}>
			<div className='pointAnswerDialog__body'>
				<div className='pointAnswerDialog__summary'>
					<div className='pointAnswerDialog__summaryLabel'>{localization.answer}</div>
					<input type='text' value={answerPreview} readOnly placeholder={localization.pointAnswerHint} />
				</div>

				<div className='pointAnswerDialog__workspace'>
					<div ref={hostRef} className='pointAnswerDialog__imageHost' onClick={handleImageClick}>
						<MediaItem src={src} type='image' isRef={isRef} />
						{markerStyle ? (
							<svg className='pointAnswerDialog__markerLayer' aria-hidden='true'>
								<circle
									className='pointAnswerDialog__markerOuter'
									cx={markerStyle.left}
									cy={markerStyle.top}
									r={markerStyle.radius}
								/>
								<circle
									className='pointAnswerDialog__markerInner'
									cx={markerStyle.left}
									cy={markerStyle.top}
									r={5}
								/>
							</svg>
						) : null}
					</div>
					<div className='pointAnswerDialog__hint'>{localization.pointAnswerSelectPrompt}</div>

					<div className='pointAnswerDialog__controls'>
						<label htmlFor='pointAnswerRadius'>{localization.pointAnswerAcceptanceRadius}</label>
						<div className='pointAnswerDialog__radiusControls'>
							<input
								id='pointAnswerRadius'
								type='range'
								min={0}
								max={1}
								step={0.01}
								value={radius}
								onChange={(event) => handleRadiusChange(event.target.value)}
							/>
							<input
								type='number'
								min={0}
								max={1}
								step={0.01}
								value={formatDeviation(radius)}
								aria-label={localization.pointAnswerAcceptanceRadius}
								title={localization.pointAnswerAcceptanceRadius}
								onChange={(event) => handleRadiusChange(event.target.value)}
							/>
						</div>
					</div>
				</div>

				<div className='pointAnswerDialog__buttons'>
					<button type='button' className='standard' onClick={handleApply} disabled={!point}>
						OK
					</button>
					<button type='button' className='standard' onClick={onClose}>
						{localization.cancel}
					</button>
				</div>
			</div>
		</Dialog>
	);
}