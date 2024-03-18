import * as React from 'react';
import fitElement from '../../utils/fitElement';

interface AutoSizedTextProps {
	id?: string;
	children: React.ReactNode;
	style?: React.CSSProperties;
	className?: string;
	maxFontSize: number;
	title?: string;

	onClick?: () => void;
}

export default class AutoSizedText extends React.Component<AutoSizedTextProps> {
	private myRef: React.RefObject<HTMLDivElement>;

	constructor(props: AutoSizedTextProps) {
		super(props);

		this.myRef = React.createRef<HTMLDivElement>();
	}

	componentDidMount(): void {
		this.resizeText();
		window.addEventListener('resize', this.resizeText);
	}

	componentDidUpdate(): void {
		this.resizeText();
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
			fitElement(this.myRef.current, this.props.maxFontSize);
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
