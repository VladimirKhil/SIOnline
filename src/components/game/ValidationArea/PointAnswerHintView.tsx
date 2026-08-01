import * as React from 'react';
import ContentGroup from '../../../model/ContentGroup';
import ContentType from '../../../model/enums/ContentType';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import ClickableAnswer from '../../common/ClickableAnswer/ClickableAnswer';
import localization from '../../../model/resources/localization';

interface NormalizedPoint {
	x: number;
	y: number;
}

interface ParsedPointAnswer {
	point: NormalizedPoint;
	aspectRatio?: number;
}

interface RenderedBounds {
	x: number;
	y: number;
	width: number;
	height: number;
	aspectRatio: number;
}

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

function parsePointAnswer(answer: string): ParsedPointAnswer | null {
	const parts = answer.split(',').map(part => part.trim());

	if (parts.length < 2) {
		return null;
	}

	const x = parseFloat(parts[0]);
	const y = parseFloat(parts[1]);
	const parsedAspectRatio = parts.length >= 3 ? parseFloat(parts[2]) : undefined;

	if (isNaN(x) || isNaN(y)) {
		return null;
	}

	return {
		point: {
			x: clamp(x, 0, 1),
			y: clamp(y, 0, 1),
		},
		aspectRatio: parsedAspectRatio && parsedAspectRatio > 0 ? parsedAspectRatio : undefined,
	};
}

function getFirstContentImageUri(content: ContentGroup[]): string | null {
	for (const group of content) {
		const image = group.content.find(contentItem => contentItem.type === ContentType.Image);

		if (image) {
			return image.value;
		}
	}

	return null;
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

interface PointAnswerHintViewProps {
	answer: string;
	content: ContentGroup[];
	answerDeviation: number;
	comments: string;
}

export default function PointAnswerHintView(props: PointAnswerHintViewProps): JSX.Element | null {
	const imageUri = React.useMemo(() => getFirstContentImageUri(props.content), [props.content]);
	const parsedPointAnswer = React.useMemo(() => parsePointAnswer(props.answer), [props.answer]);
	const previewRef = React.useRef<HTMLDivElement>(null);
	const imageRef = React.useRef<HTMLImageElement>(null);
	const [, setLayoutVersion] = React.useState(0);

	React.useLayoutEffect(() => {
		const preview = previewRef.current;
		const image = imageRef.current;

		if (!preview || !image) {
			return;
		}

		const updateLayout = () => {
			setLayoutVersion(version => version + 1);
		};

		updateLayout();

		let frame1 = 0;
		let frame2 = 0;

		frame1 = requestAnimationFrame(() => {
			updateLayout();
			frame2 = requestAnimationFrame(updateLayout);
		});

		image.addEventListener('load', updateLayout);

		if (typeof ResizeObserver === 'undefined') {
			return () => {
				image.removeEventListener('load', updateLayout);
				cancelAnimationFrame(frame1);
				cancelAnimationFrame(frame2);
			};
		}

		const observer = new ResizeObserver(updateLayout);
		observer.observe(preview);
		observer.observe(image);

		return () => {
			image.removeEventListener('load', updateLayout);
			cancelAnimationFrame(frame1);
			cancelAnimationFrame(frame2);
			observer.disconnect();
		};
	}, [imageUri, props.answer, props.comments]);

	if (!imageUri || !parsedPointAnswer) {
		return <AutoSizedText
			className={`singleAnswer ${props.answer || props.comments ? 'hasHint' : ''}`}
			maxFontSize={50}
			title={localization.rightAnswer}
		>
			{props.answer ? <ClickableAnswer text={props.answer} /> : null}
			{props.comments ? ` (${props.comments})` : null}
		</AutoSizedText>;
	}

	const zoom = 3;
	const { point } = parsedPointAnswer;
	const imageBounds = imageRef.current ? getImageRenderedBounds(imageRef.current) : null;
	const previewWidth = previewRef.current?.clientWidth ?? 0;
	const previewHeight = previewRef.current?.clientHeight ?? 0;
	const imageTransformStyle: React.CSSProperties | undefined = imageBounds && previewWidth > 0 && previewHeight > 0
		? {
			left: imageBounds.x,
			top: imageBounds.y,
			width: imageBounds.width,
			height: imageBounds.height,
			transform: `translate(${(previewWidth / 2) - (imageBounds.x + (point.x * imageBounds.width * zoom))}px, ` +
				`${(previewHeight / 2) - (imageBounds.y + (point.y * imageBounds.height * zoom))}px) scale(${zoom})`,
			transformOrigin: 'top left',
		}
		: undefined;
	return <div className={`singleAnswer singleAnswerPoint ${props.comments ? 'hasHint' : ''}`}>
		<div
			ref={previewRef}
			className='singleAnswerPointPreview'
		>
			<img
				ref={imageRef}
				className='singleAnswerPointImage'
				alt='point answer'
				src={imageUri}
				style={imageTransformStyle}
			/>
			<div className='singleAnswerPointMarker'>
			</div>
		</div>
		{props.comments
			? <div className='singleAnswerPointComments'>({props.comments})</div>
			: null}
	</div>;
}
