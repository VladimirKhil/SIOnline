import * as React from 'react';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { DecisionType, sendAnswer } from '../../../state/room2Slice';
import { PointMarker } from '../../../state/tableSlice';

import './PointsOverlay.css';

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
		renderWidth = clientWidth;
		renderHeight = clientWidth / imageAspect;
	} else {
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

interface PointShape {
	cx: number;
	cy: number;
}

interface MarkerShape {
	id: number;
	cx: number;
	cy: number;
	mode: PointMarker['mode'];
	label?: string;
	isArea?: boolean;
	className: string;
}

interface RippleMarker {
	id: number;
	marker: PointMarker;
}

const RIPPLE_DURATION_MS = 1400;
const RIPPLE_DELAYS = [0, 1, 2] as const;

export default function PointsOverlay(): JSX.Element {
	const overlayRef = React.useRef<HTMLDivElement>(null);
	const rippleIdRef = React.useRef(0);
	const lastAnimatedMarkerIdRef = React.useRef<number | null>(null);
	const rippleTimeoutIdsRef = React.useRef<number[]>([]);
	const [selectedPoint, setSelectedPoint] = React.useState<{ x: number, y: number } | null>(null);
	const [hoverPoint, setHoverPoint] = React.useState<{ x: number, y: number } | null>(null);
	const [ripples, setRipples] = React.useState<RippleMarker[]>([]);
	const appDispatch = useAppDispatch();

	const isConnected = useAppSelector(state => state.common.isSIHostConnected);
	const pointMarkers = useAppSelector(state => state.table.pointMarkers);
	const decisionType = useAppSelector(state => state.room2.stage.decisionType);

	const isInteractive = decisionType === DecisionType.Answer && !selectedPoint;

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

	// Computes SVG coordinates for a point
	const computePointShape = React.useCallback((point: { x: number; y: number }): PointShape | null => {
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

		return { cx, cy };
	}, []);

	const computeMarkerShape = React.useCallback((marker: PointMarker): MarkerShape | null => {
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

		const cx = imgOffsetX + bounds.x + (marker.x * bounds.width);
		const cy = imgOffsetY + bounds.y + (marker.y * bounds.height);

		const className = marker.isArea
			? `pointsOverlay__marker pointsOverlay__marker--${marker.mode} pointsOverlay__marker--area`
			: `pointsOverlay__marker pointsOverlay__marker--${marker.mode}`;

		return {
			id: marker.id,
			cx,
			cy,
			mode: marker.mode,
			label: marker.label,
			isArea: marker.isArea,
			className,
		};
	}, []);

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

	React.useEffect(() => () => {
		rippleTimeoutIdsRef.current.forEach(timeoutId => window.clearTimeout(timeoutId));
		rippleTimeoutIdsRef.current = [];
	}, []);

	React.useEffect(() => {
		if (pointMarkers.length === 0) {
			lastAnimatedMarkerIdRef.current = null;
			return;
		}

		const lastAnimatedMarkerId = lastAnimatedMarkerIdRef.current;
		const nextRipples = lastAnimatedMarkerId === null
			? pointMarkers
			: pointMarkers.filter(marker => marker.id > lastAnimatedMarkerId);

		lastAnimatedMarkerIdRef.current = pointMarkers[pointMarkers.length - 1].id;

		if (nextRipples.length === 0) {
			return;
		}

		const rippleBatch = nextRipples.map(marker => {
			const id = rippleIdRef.current;
			rippleIdRef.current = id + 1;

			return { id, marker };
		});

		setRipples(current => [...current, ...rippleBatch]);

		const timeoutId = window.setTimeout(() => {
			rippleTimeoutIdsRef.current = rippleTimeoutIdsRef.current.filter(id => id !== timeoutId);
			setRipples(current => current.filter(ripple => !rippleBatch.some(batchRipple => batchRipple.id === ripple.id)));
		}, RIPPLE_DURATION_MS);

		rippleTimeoutIdsRef.current = [...rippleTimeoutIdsRef.current, timeoutId];
	}, [pointMarkers]);

	const hoverShape = isInteractive && hoverPoint && svgSize.width > 0
		? computePointShape(hoverPoint)
		: null;

	const markerShapes = pointMarkers
		.map(m => computeMarkerShape(m))
		.filter((s): s is MarkerShape => s !== null);
	const rippleShapes = ripples
		.map(ripple => {
			const shape = computeMarkerShape(ripple.marker);

			return shape ? { id: ripple.id, shape } : null;
		})
		.filter((ripple): ripple is { id: number; shape: MarkerShape } => ripple !== null);

	const hasSvgContent = hoverShape || markerShapes.length > 0 || rippleShapes.length > 0;

	return (
		<div
			ref={overlayRef}
			className={`pointsOverlay${isInteractive ? ' pointsOverlay--interactive' : ''}`}
			onClick={isInteractive ? handleClick : undefined}
			onMouseMove={isInteractive ? handleMouseMove : undefined}
			onMouseEnter={isInteractive ? handleMouseMove : undefined}
			onMouseLeave={isInteractive ? handleMouseLeave : undefined}
		>
			{hasSvgContent && svgSize.width > 0 ? (
				<svg className='pointsOverlay__svg' width={svgSize.width} height={svgSize.height}>
					{/* Marker points from other players and right answer */}
					{markerShapes.map(shape => (
						<g key={shape.id}>
							<circle
								cx={shape.cx}
								cy={shape.cy}
								r="7"
								className={shape.className}
							/>

							{shape.label ? (
								<text
									x={shape.cx}
									y={shape.cy - 12}
									className='pointsOverlay__label'
								>
									{shape.label}
								</text>
							) : null}
						</g>
					))}

					{rippleShapes.map(({ id, shape }) => {
						const rippleVariantClassName = shape.mode === 'right-answer'
							? 'pointsOverlay__rippleCircle--right-answer'
							: 'pointsOverlay__rippleCircle--player';
						const rippleAreaClassName = shape.isArea ? ' pointsOverlay__rippleCircle--area' : '';
						const rippleClassNameBase =
							`pointsOverlay__rippleCircle ${rippleVariantClassName}${rippleAreaClassName}`;

						return (
							<g key={id} className='pointsOverlay__ripple'>
								{shape.mode === 'right-answer' ? (
									<circle
										cx={shape.cx}
										cy={shape.cy}
										r='8'
										className='pointsOverlay__rippleFlash pointsOverlay__rippleFlash--right-answer'
									/>
								) : null}

								{RIPPLE_DELAYS.map(index => {
									const rippleClassName =
										`${rippleClassNameBase} pointsOverlay__rippleCircle--delay-${index}`;

									return (
										<circle
											key={index}
											cx={shape.cx}
											cy={shape.cy}
											r='7'
											className={rippleClassName}
										/>
									);
								})}
							</g>
						);
					})}

					{/* Hover preview for interactive mode */}
					{hoverShape ? (
						<circle
							cx={hoverShape.cx}
							cy={hoverShape.cy}
							r="5"
							fill="rgba(255, 140, 50, 0.8)"
							stroke="none"
						/>
					) : null}

				</svg>
			) : null}
		</div>
	);
}
