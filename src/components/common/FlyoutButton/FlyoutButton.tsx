import * as React from 'react';
import Popup from '../Popup/Popup';

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
	disabled?: boolean;
}

interface FlyoutButtonState {
	isOpen: boolean;
	x: number;
	y: number;
	width?: number;
}

export default class FlyoutButton extends React.Component<FlyoutButtonProps, FlyoutButtonState> {
	private buttonRef: React.RefObject<HTMLButtonElement>;
	private isDisposed = false;

	static defaultProps: Partial<FlyoutButtonProps> = {
		hideOnClick: true
	};

	constructor(props: FlyoutButtonProps) {
		super(props);
		this.buttonRef = React.createRef<HTMLButtonElement>();
		this.state = {
			isOpen: false,
			x: 0,
			y: 0
		};
	}

	componentWillUnmount(): void {
		this.isDisposed = true;
	}

	private showFlyout = () => {
		if (this.buttonRef.current == null) {
			return;
		}

		const rect = this.buttonRef.current.getBoundingClientRect();

		this.setState({
			isOpen: true,
			x: this.props.horizontalOrientation === FlyoutHorizontalOrientation.Left ? rect.right : rect.left,
			y: this.props.verticalOrientation === FlyoutVerticalOrientation.Top ? rect.top : rect.bottom,
			width: this.props.alignWidth ? rect.width : undefined
		});
	};

	private hideFlyout = () => {
		if (this.isDisposed) {
			return;
		}

		this.setState({
			isOpen: false
		});
	};

	private onClick = () => {
		if (this.state.isOpen) {
			this.hideFlyout();
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
			bottom: window.innerHeight - this.state.y,
			maxHeight: this.state.y
		} : {
			top: this.state.y,
			maxHeight: window.innerHeight - this.state.y
		};

		const widthStyle = this.state.width ? { minWidth : this.state.width } : {};

		const flyoutStyle: React.CSSProperties = {
			...horizontalPosition,
			...verticalPosition,
			...widthStyle
		};

		const colorClass = this.props.theme === FlyoutTheme.Light ? 'light' : 'dark';

		return (
			<>
				<button
					type="button"
					ref={this.buttonRef}
					className={`flyoutButton ${this.props.className || ''}`}
					title={this.props.title}
					onClick={this.onClick}
					disabled={this.props.disabled}
				>
					{this.props.children}
				</button>
				{this.state.isOpen
					? <Popup
						className={`flyoutButton_flyout ${colorClass} ${this.state.isOpen ? 'visible' : 'hidden'}`}
						style={flyoutStyle}
						onClose={this.hideFlyout}
						hideOnClick={this.props.hideOnClick}
					>
						{this.props.flyout}
					</Popup> : null}
			</>
		);
	}
}
