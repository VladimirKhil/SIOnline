import * as React from 'react';
import Constants from '../../../model/enums/Constants';

import './NumericTextBox.css';

interface NumericTextBoxProps {
	value: number;
	minValue?: number;
	maxValue?: number;

	onValueChanged: (value: number) => void;
	onCancel: () => void;
	onFocus?: () => void;
	onBlur?: () => void;
}

interface NumericTextBoxState {
	value: string; // string type for supporting "-" as a first character
}

export default class NumericTextBox extends React.Component<NumericTextBoxProps, NumericTextBoxState> {
	constructor(props: NumericTextBoxProps) {
		super(props);

		this.state = {
			value: props.value.toString()
		};
	}

	componentDidUpdate(prevProps: NumericTextBoxProps): void {
		if (prevProps.value !== this.props.value) {
			this.setState(() => ({
				value: this.props.value.toString()
			}));
		}
	}

	onValueChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const { value } = e.target;
		this.setState(() => ({
			value
		}));
	};

	onFocus = (e: React.FocusEvent<HTMLInputElement>): void => {
		e.target.select();

		if (this.props.onFocus) {
			this.props.onFocus();
		}
	};

	onBlur = (): void => {
		const newValue = parseInt(this.state.value, 10);
		if (this.props.value !== newValue) {
			this.props.onValueChanged(newValue);
		}

		if (this.props.onBlur) {
			this.props.onBlur();
		}
	};

	onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
		if (e.keyCode === Constants.KEY_ENTER) {
			const newValue = parseInt(this.state.value, 10);
			if (this.props.value !== newValue) {
				this.props.onValueChanged(newValue);
			} else {
				this.props.onCancel();
			}
		} else if (e.keyCode === Constants.KEY_ESCAPE) {
			this.props.onCancel();
		}
	};

	render(): JSX.Element {
		return (
			<input
				className="numericTextBox"
				type="number"
				min={this.props.minValue}
				max={this.props.maxValue}
				value={this.state.value}
				onChange={this.onValueChanged}
				onFocus={this.onFocus}
				onBlur={this.onBlur}
				onKeyDown={this.onKeyDown}
				aria-label="Numeric value"
			/>
		);
	}
}
