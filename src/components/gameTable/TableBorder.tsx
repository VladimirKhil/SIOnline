import * as React from 'react';
import State from '../../state/State';
import { connect } from 'react-redux';
import TimerInfo from '../../model/TimerInfo';
import { isRunning } from '../../utils/TimerInfoHelpers';

import './TableBorder.css';

interface TableBorderProps {
	canTry: boolean;
	pressTimer: TimerInfo;
	children: React.ReactNode;
}

const mapStateToProps = (state: State) => ({
	canTry: state.table.canPress,
	pressTimer: state.room.timers.press
});

export function TableBorder(props: TableBorderProps) {
	const isTimerRunning = props.canTry && isRunning(props.pressTimer);
	const animatingClass = isTimerRunning ? ' animate' : '';
	const animationDuration = `${(props.pressTimer.maximum - props.pressTimer.value) / 10}s`;

	const initialSize = props.pressTimer.maximum > 0
		? 100 * (props.pressTimer.maximum - props.pressTimer.value) / props.pressTimer.maximum
		: 100;

	const styleHorizontal: React.CSSProperties = {
		animationDuration,
		width: `${initialSize}%`
	};

	const styleVertical: React.CSSProperties = {
		animationDuration,
		height: `${initialSize}%`
	};

	return (
		<div className="tableBorder tableBorderCentered">
			{props.children}
			{props.canTry ? (
				<>
					<div className={`topBorder ${animatingClass}`} style={styleHorizontal} />
					<div className={`rightBorder ${animatingClass}`} style={styleVertical} />
					<div className={`bottomBorder ${animatingClass}`} style={styleHorizontal} />
					<div className={`leftBorder ${animatingClass}`} style={styleVertical} />
				</>
			) : null}
		</div>
	);
}

export default connect(mapStateToProps)(TableBorder);
