import * as React from 'react';
import NumericTextBox from '../../../common/NumericTextBox/NumericTextBox';
import './ScoreEditor.scss';

interface ScoreEditorProps {
	currentSum: number;
	defaultChangeValue: number;
	isVisible: boolean;
	onSumChanged: (newSum: number) => void;
	onCancel: () => void;
	onBlur?: () => void;
}

export default React.forwardRef<HTMLDivElement, ScoreEditorProps>(function ScoreEditor(props, ref): JSX.Element {
	const [changeValue, setChangeValue] = React.useState(props.defaultChangeValue);
	const changeValueContainerRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		setChangeValue(props.defaultChangeValue);
	}, [props.defaultChangeValue]);

	const focusChangeValueInput = () => {
		// Focus the input inside the changeValueContainer
		setTimeout(() => {
			const input = changeValueContainerRef.current?.querySelector('input');
			input?.focus();
		}, 0);
	};

	const handleDecrease = () => {
		props.onSumChanged(-changeValue);
		focusChangeValueInput();
	};

	const handleIncrease = () => {
		props.onSumChanged(changeValue);
		focusChangeValueInput();
	};

	const handleChangeValueChanged = (value: number) => {
		setChangeValue(Math.max(0, Math.min(100000, value)));
	};

	const handleBlur = () => {
		// Use setTimeout to allow any click events within the ScoreEditor to fire first
		setTimeout(() => {
			const { activeElement } = document;
			const scoreEditorElement = (ref as React.RefObject<HTMLDivElement>)?.current;

			if (scoreEditorElement && activeElement && scoreEditorElement.contains(activeElement)) {
				// Focus is still within ScoreEditor, don't trigger blur
				return;
			}

			// Focus has moved outside ScoreEditor, trigger blur
			if (props.onBlur) {
				props.onBlur();
			}
		}, 0);
	};

	if (!props.isVisible) {
		return <></>;
	}

	return (
		<div ref={ref} className="scoreEditor">
			<div className="scoreControls">
				<button
					type='button'
					className="scoreButton decreaseButton"
					onClick={handleDecrease}
					disabled={changeValue <= 0}
				>
					-
				</button>

				<div ref={changeValueContainerRef} className="changeValueContainer">
					<NumericTextBox
						value={changeValue}
						minValue={0}
						maxValue={100000}
						onValueChanged={handleChangeValueChanged}
						onCancel={() => setChangeValue(props.defaultChangeValue)}
						onBlur={handleBlur}
					/>
				</div>

				<button
					type='button'
					className="scoreButton increaseButton"
					onClick={handleIncrease}
					disabled={changeValue >= 100000}
				>
					+
				</button>
			</div>
		</div>
	);
});
