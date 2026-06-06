import * as React from 'react';
import fitElement from '../../../utils/fitElement';
import State from '../../../state/State';
import { connect } from 'react-redux';

interface AutoSizedTextProps {
	id?: string;
	children: React.ReactNode;
	style?: React.CSSProperties;
	className?: string;
	minFontSize?: number;
	maxFontSize: number;
	title?: string;
	fontsReady: boolean;

	onClick?: () => void;
}

const mapStateToProps = (state: State) => ({
	fontsReady: state.common.fontsReady,
});

export class AutoSizedText extends React.Component<AutoSizedTextProps> {
	private myRef: React.RefObject<HTMLDivElement>;

	private resizeObserver?: ResizeObserver;

	private resizeFrame: number | null = null;

	private lastResizeSignature = '';

	constructor(props: AutoSizedTextProps) {
		super(props);

		this.myRef = React.createRef<HTMLDivElement>();
	}

	componentDidMount(): void {
		this.scheduleResizeText();
		window.addEventListener('resize', this.resizeText);

		if (typeof ResizeObserver !== 'undefined' && this.myRef.current) {
			this.resizeObserver = new ResizeObserver(() => {
				this.resizeText();
			});

			this.resizeObserver.observe(this.myRef.current);
		}
	}

	componentDidUpdate(prevProps: AutoSizedTextProps): void {
		if (prevProps.children !== this.props.children ||
			prevProps.maxFontSize !== this.props.maxFontSize ||
			prevProps.minFontSize !== this.props.minFontSize ||
			prevProps.fontsReady !== this.props.fontsReady ||
			prevProps.className !== this.props.className ||
			prevProps.style !== this.props.style) {
			this.scheduleResizeText();
		}
	}

	componentWillUnmount(): void {
		if (this.resizeFrame !== null) {
			window.cancelAnimationFrame(this.resizeFrame);
			this.resizeFrame = null;
		}

		this.resizeObserver?.disconnect();
		window.removeEventListener('resize', this.resizeText);
	}

	onClick(): void {
		if (this.props.onClick) {
			this.props.onClick();
		}
	}

	private scheduleResizeText = (): void => {
		if (this.resizeFrame !== null) {
			window.cancelAnimationFrame(this.resizeFrame);
		}

		this.resizeFrame = window.requestAnimationFrame(() => {
			this.resizeFrame = null;
			this.resizeText();
		});
	};

	private getResizeSignature(): string | null {
		const element = this.myRef.current;
		const content = element?.firstElementChild;

		if (!element || !content) {
			return null;
		}

		return [
			content.textContent ?? '',
			element.clientWidth,
			element.clientHeight,
			this.props.maxFontSize,
			this.props.minFontSize ?? 1,
			this.props.fontsReady ? 1 : 0,
		].join('|');
	}

	resizeText = (): void => {
		if (this.myRef.current === null) {
			return;
		}

		const resizeSignature = this.getResizeSignature();

		if (!resizeSignature || resizeSignature === this.lastResizeSignature) {
			return;
		}

		fitElement(this.myRef.current, this.props.maxFontSize, this.props.minFontSize ?? 1, this.props.fontsReady);
		this.lastResizeSignature = this.getResizeSignature() ?? resizeSignature;
	};

	render(): JSX.Element {
		return (
			<div
				id={this.props.id}
				ref={this.myRef}
				title={this.props.title}
				className={this.props.className}
				style={this.props.style}
				onClick={() => this.onClick()}
			>
				<span>{this.props.children}</span>
			</div>
		);
	}
}

export default connect(mapStateToProps)(AutoSizedText);
