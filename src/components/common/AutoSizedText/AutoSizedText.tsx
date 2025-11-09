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

	constructor(props: AutoSizedTextProps) {
		super(props);

		this.myRef = React.createRef<HTMLDivElement>();
	}

	componentDidMount(): void {
		this.resizeText();
		window.addEventListener('resize', this.resizeText);
	}

	componentDidUpdate(prevProps: AutoSizedTextProps): void {
		if (prevProps.children !== this.props.children ||
			prevProps.maxFontSize !== this.props.maxFontSize ||
			prevProps.minFontSize !== this.props.minFontSize ||
			prevProps.fontsReady !== this.props.fontsReady) {
			this.resizeText();
		}
	}

	componentWillUnmount(): void {
		window.removeEventListener('resize', this.resizeText);
	}

	onClick(): void {
		if (this.props.onClick) {
			this.props.onClick();
		}
	}

	resizeText = (): void => {
		if (this.myRef.current !== null) {
			fitElement(this.myRef.current, this.props.maxFontSize, this.props.minFontSize ?? 1, this.props.fontsReady);
		}
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
