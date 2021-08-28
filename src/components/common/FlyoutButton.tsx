import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './FlyoutButton.css';

export const enum FlyoutHorizontalOrientation {
	Left,
	Center,
	Right
}

export const enum FlyoutVerticalOrientation {
	Top,
	Center,
	Bottom
}

export const enum FlyoutTheme {
	Dark,
	Light
}

interface FlyoutButtonProps {
	className?: string;
	title?: string;
	theme?: FlyoutTheme;
	alignWidth?: boolean;
	flyout: JSX.Element;
	children?: any;
	horizontalOrientation: FlyoutHorizontalOrientation;
	verticalOrientation: FlyoutVerticalOrientation;
	hideOnClick?: boolean;
}

interface FlyoutButtonState {
	isOpen: boolean;
	x: number;
	y: number;
	width?: number;
}

export default class FlyoutButton extends React.Component<FlyoutButtonProps, FlyoutButtonState> {
	private buttonRef: React.RefObject<HTMLButtonElement>;

	private layout: HTMLDivElement;

	private timerRef: number | null = null;

	private isDisposed = false;

	static defaultProps: Partial<FlyoutButtonProps> = {
		hideOnClick: true
	};

	constructor(props: FlyoutButtonProps) {
		super(props);

		this.buttonRef = React.createRef<HTMLButtonElement>();

		this.layout = document.createElement('div');
		this.layout.style.position = 'absolute';
		this.layout.style.top = '0';
		this.layout.style.left = '0';
		this.layout.style.width = '100%';
		this.layout.style.height = '100%';
		this.layout.style.pointerEvents = 'none';

		this.state = {
			isOpen: false,
			x: 0,
			y: 0
		};

		this.hideFlyout = this.hideFlyout.bind(this); // 'resize' почему-то не передаёт this
	}

	componentDidMount(): void {
		if (this.layout) {
			document.body.appendChild(this.layout);
		}
	}

	componentWillUnmount(): void {
		if (this.layout) {
			document.body.removeChild(this.layout);
		}

		window.removeEventListener('mousedown', this.hideFlyout);
		window.removeEventListener('resize', this.hideFlyout);

		if (this.timerRef) {
			window.clearTimeout(this.timerRef);
			this.timerRef = null;
		}

		this.isDisposed = true;
	}

	private showFlyout = () => {
		if (this.buttonRef.current == null) {
			return;
		}

		window.addEventListener('mousedown', this.hideFlyout);
		window.addEventListener('resize', this.hideFlyout);

		const rect = this.buttonRef.current.getBoundingClientRect();

		this.setState({
			isOpen: true,
			x: this.props.horizontalOrientation === FlyoutHorizontalOrientation.Left ? rect.right : rect.left,
			y: this.props.verticalOrientation === FlyoutVerticalOrientation.Top ? rect.top : rect.bottom,
			width: this.props.alignWidth ? rect.width : undefined
		});
	};

	private hideFlyout = (e: Event) => {
		if (e.target instanceof Node && this.layout.contains(e.target as Node) && !this.props.hideOnClick) {
			return;
		}

		window.removeEventListener('mousedown', this.hideFlyout);
		window.removeEventListener('resize', this.hideFlyout);

		this.timerRef = window.setTimeout(
			() => {
				if (this.isDisposed) {
					return;
				}

				this.setState({
					isOpen: false
				});
			},
			200 // Если поставить слишком маленькое значение, onClick для внутенних элементов может не успеть отработать
		);
	};

	private onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		if (this.state.isOpen) {
			this.hideFlyout(e.nativeEvent);
		} else {
			this.showFlyout();
		}
	};

	render(): JSX.Element {
		const horizontalPosition = this.props.horizontalOrientation === FlyoutHorizontalOrientation.Left ? {
			right: window.innerWidth - this.state.x
		} : {
			left: this.state.x
		};

		const verticalPosition = this.props.verticalOrientation === FlyoutVerticalOrientation.Top ? {
			bottom: window.innerHeight - this.state.y
		} : {
			top: this.state.y
		};

		const widthStyle = this.state.width ? { width: this.state.width } : {};

		const flyoutStyle: React.CSSProperties = {
			...horizontalPosition,
			...verticalPosition,
			...widthStyle,
			pointerEvents: 'initial'
		};

		return (
			<button
				type="button"
				ref={this.buttonRef}
				className={`flyoutButton ${this.props.className}`}
				title={this.props.title}
				onClick={this.onClick}
			>
				{this.props.children}
				{this.state.isOpen ?
					ReactDOM.createPortal(
						<section
							className={`flyoutButton_flyout ${this.props.theme === FlyoutTheme.Light ? 'light' : 'dark'}`}
							style={flyoutStyle}
						>
							{this.props.flyout}
						</section>,
						this.layout
					) : null}
			</button>
		);
	}
}
