import * as React from 'react';

interface AutoSizedTextProps {
	id?: string;
	children: React.ReactNode;
	style?: React.CSSProperties;
	className?: string;
	maxFontSize: number;
	title?: string;

	onClick?: () => void;
}

const TEXT_MARGIN = 3;

const fitCache: { [key: string]: number } = {};

function fitElement(element: HTMLElement, maxFont: number) {
	const content = element.firstElementChild;
	if (!content) {
		return;
	}

	let font = maxFont;
	const boxHeight = element.clientHeight;
	const boxWidth = element.clientWidth;
	let innerHeight = 0;
	let innerWidth = 0;

	let extraHeight = 0;
	const style = window.getComputedStyle(element);
	if (style.paddingTop) {
		extraHeight += parseInt(style.paddingTop, 10);
	}

	if (style.paddingBottom) {
		extraHeight += parseInt(style.paddingBottom, 10);
	}

	const cacheKey = `${window.innerWidth} ${content.innerHTML} ${content.clientHeight + extraHeight} ${content.clientWidth + extraHeight}`;
	const cacheValue = fitCache[cacheKey];

	if (cacheValue) {
		element.style.fontSize = `${cacheValue}px`;
		return;
	}

	do {
		element.style.fontSize = `${font}px`;
		innerHeight = content.clientHeight + extraHeight;
		innerWidth = content.clientWidth + extraHeight;
		font--;
	} while ((innerHeight + TEXT_MARGIN > boxHeight || innerWidth > boxWidth + 1) && font > 0);

	if (content.innerHTML.length < 15) {
		fitCache[cacheKey] = font;
	}
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
				onClick={() => this.onClick()}
			>
				<span>{this.props.children}</span>
			</div>
		);
	}
}
