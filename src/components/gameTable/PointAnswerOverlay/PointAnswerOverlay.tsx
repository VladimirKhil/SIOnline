import * as React from 'react';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { sendAnswer } from '../../../state/room2Slice';

import './PointAnswerOverlay.css';

interface PointAnswerOverlayProps {
	deviation: number;
}

/** Computes the actual rendered bounds of an image with object-fit: contain */
function getImageRenderedBounds(img: HTMLImageElement): { x: number, y: number, width: number, height: number } | null {
	const { naturalWidth, naturalHeight, clientWidth, clientHeight } = img;

	if (naturalWidth === 0 || naturalHeight === 0 || clientWidth === 0 || clientHeight === 0) {
		return null;
	}

	const imageAspect = naturalWidth / naturalHeight;
	const containerAspect = clientWidth / clientHeight;

	let renderWidth: number;
	let renderHeight: number;

	if (imageAspect > containerAspect) {
		// Image is wider relative to container - width is constrained
		renderWidth = clientWidth;
		renderHeight = clientWidth / imageAspect;
	} else {
		// Image is taller relative to container - height is constrained
		renderHeight = clientHeight;
		renderWidth = clientHeight * imageAspect;
	}

	const x = (clientWidth - renderWidth) / 2;
	const y = (clientHeight - renderHeight) / 2;

	return { x, y, width: renderWidth, height: renderHeight };
}

/** Converts client coordinates to normalized image coordinates (0-1). Returns null if image not found. */
function getNormalizedImagePoint(
	overlay: HTMLDivElement,
	clientX: number,
	clientY: number,
): { x: number, y: number } | null {
	const tableContent = overlay.parentElement;

	if (!tableContent) {
		return null;
	}

	const img = tableContent.querySelector<HTMLImageElement>('.inGameImg');

	if (!img) {
		return null;
	}

	const bounds = getImageRenderedBounds(img);

	if (!bounds) {
		return null;
	}

	const imgRect = img.getBoundingClientRect();
	const posX = clientX - imgRect.left;
	const posY = clientY - imgRect.top;

	return {
		x: Math.max(0, Math.min(1, (posX - bounds.x) / bounds.width)),
		y: Math.max(0, Math.min(1, (posY - bounds.y) / bounds.height)),
	};
}

export default function PointAnswerOverlay({ deviation }: PointAnswerOverlayProps): JSX.Element | null {
	const overlayRef = React.useRef<HTMLDivElement>(null);
	const [selectedPoint, setSelectedPoint] = React.useState<{ x: number, y: number } | null>(null);
	const [hoverPoint, setHoverPoint] = React.useState<{ x: number, y: number } | null>(null);
	const appDispatch = useAppDispatch();
	const isConnected = useAppSelector(state => state.common.isSIHostConnected);

	const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		const overlay = overlayRef.current;

		if (!overlay) {
			return;
		}

		const point = getNormalizedImagePoint(overlay, e.clientX, e.clientY);
		setHoverPoint(point);
	}, []);

	const handleMouseLeave = React.useCallback(() => {
		setHoverPoint(null);
	}, []);

	const handleClick = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		const overlay = overlayRef.current;

		if (!overlay || !isConnected) {
			return;
		}

		const point = getNormalizedImagePoint(overlay, e.clientX, e.clientY);

		if (!point) {
			return;
		}

		setSelectedPoint(point);

		const answer = `${point.x.toFixed(2)},${point.y.toFixed(2)}`;
		appDispatch(sendAnswer(answer));
	}, [appDispatch, isConnected]);

	// Detect initial mouse position when overlay appears under cursor
	React.useEffect(() => {
		const overlay = overlayRef.current;

		if (!overlay) {
			return;
		}

		const handleInitialMove = (e: PointerEvent) => {
			const rect = overlay.getBoundingClientRect();

			if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
				const point = getNormalizedImagePoint(overlay, e.clientX, e.clientY);
				setHoverPoint(point);
			}

			document.removeEventListener('pointermove', handleInitialMove);
		};

		document.addEventListener('pointermove', handleInitialMove, { once: true });

		return () => {
			document.removeEventListener('pointermove', handleInitialMove);
		};
	}, []);

	// Computes SVG coordinates for a point and its deviation ellipse radii
	const computePointShape = React.useCallback((point: { x: number; y: number }) => {
		const overlay = overlayRef.current;

		if (!overlay) {
			return null;
		}

		const tableContent = overlay.parentElement;

		if (!tableContent) {
			return null;
		}

		const img = tableContent.querySelector<HTMLImageElement>('.inGameImg');

		if (!img) {
			return null;
		}

		const bounds = getImageRenderedBounds(img);

		if (!bounds) {
			return null;
		}

		const imgRect = img.getBoundingClientRect();
		const overlayRect = overlay.getBoundingClientRect();

		const imgOffsetX = imgRect.left - overlayRect.left;
		const imgOffsetY = imgRect.top - overlayRect.top;

		const cx = imgOffsetX + bounds.x + (point.x * bounds.width);
		const cy = imgOffsetY + bounds.y + (point.y * bounds.height);

		const rx = deviation * bounds.width;
		const ry = deviation * bounds.height;

		return { cx, cy, rx, ry };
	}, [deviation]);

	const [svgSize, setSvgSize] = React.useState<{ width: number, height: number }>({ width: 0, height: 0 });

	React.useEffect(() => {
		const overlay = overlayRef.current;

		if (!overlay) {
			return;
		}

		const updateSize = () => {
			setSvgSize({ width: overlay.clientWidth, height: overlay.clientHeight });
		};

		updateSize();

		const observer = new ResizeObserver(updateSize);
		observer.observe(overlay);

		return () => observer.disconnect();
	}, []);

	const hoverShape = hoverPoint && svgSize.width > 0 && !selectedPoint
		? computePointShape(hoverPoint)
		: null;

	const selectedShape = selectedPoint && svgSize.width > 0
		? computePointShape(selectedPoint)
		: null;

	const hasSvgContent = hoverShape || selectedShape;

	return (
		<div
			ref={overlayRef}
			className='pointAnswerOverlay'
			onClick={handleClick}
			onMouseMove={handleMouseMove}
			onMouseEnter={handleMouseMove}
			onMouseLeave={handleMouseLeave}
		>
			{hasSvgContent ? (
				<svg className='pointAnswerOverlay__svg' width={svgSize.width} height={svgSize.height}>
					{hoverShape ? (
						<>
							{deviation > 0 ? (
								<ellipse
									cx={hoverShape.cx}
									cy={hoverShape.cy}
									rx={hoverShape.rx}
									ry={hoverShape.ry}
									fill="rgba(255, 124, 30, 0.3)"
									stroke="none"
								/>
							) : null}

							<circle
								cx={hoverShape.cx}
								cy={hoverShape.cy}
								r="5"
								fill="rgba(255, 140, 50, 0.8)"
								stroke="none"
							/>
						</>
					) : null}

					{selectedShape ? (
						<>
							{deviation > 0 ? (
								<ellipse
									cx={selectedShape.cx}
									cy={selectedShape.cy}
									rx={selectedShape.rx}
									ry={selectedShape.ry}
									fill="rgba(255, 140, 50, 0.4)"
									stroke="none"
								/>
							) : null}

							<circle
								cx={selectedShape.cx}
								cy={selectedShape.cy}
								r="6"
								fill="#FF9030"
								stroke="none"
							/>
						</>
					) : null}
				</svg>
			) : null}
		</div>
	);
}
