import * as React from 'react';
import State from '../../../state/State';
import { connect } from 'react-redux';
import { isRunning } from '../../../utils/TimerInfoHelpers';
import { useAppSelector } from '../../../state/hooks';

import './TableBorder.css';

interface TableBorderProps {
	canTry: boolean;
	children: React.ReactNode;
}

const mapStateToProps = (state: State) => ({
	canTry: state.table.canPress,
});

export function TableBorder(props: TableBorderProps) {
	const theme = useAppSelector(state => state.settings.theme);
	const pressTimer = useAppSelector(state => state.room2.timers.press);
	const isTimerRunning = props.canTry && isRunning(pressTimer);
	const animatingClass = isTimerRunning ? ' animate' : '';
	const animationDuration = `${(pressTimer.maximum - pressTimer.value) / 10}s`;

	const initialSize = pressTimer.maximum > 0
		? 100 * (pressTimer.maximum - pressTimer.value) / pressTimer.maximum
		: 100;

	const styleHorizontal: React.CSSProperties = {
		animationDuration,
		width: `${initialSize}%`,
		backgroundColor: theme.table.textColor
	};

	const styleVertical: React.CSSProperties = {
		animationDuration,
		height: `${initialSize}%`,
		backgroundColor: theme.table.textColor
	};

	return (
		<div className="tableBorder tableBorderCentered">
			{props.children}
			{props.canTry ? (
				<>
					<div className={`topBorder${animatingClass}`} style={styleHorizontal} />
					<div className={`rightBorder${animatingClass}`} style={styleVertical} />
					<div className={`bottomBorder${animatingClass}`} style={styleHorizontal} />
					<div className={`leftBorder${animatingClass}`} style={styleVertical} />
				</>
			) : null}
		</div>
	);
}

export default connect(mapStateToProps)(TableBorder);
