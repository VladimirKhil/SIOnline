import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';

import tableActionCreators from '../../state/table/tableActionCreators';

interface TableGameThemesProps {
	gameThemes: string[];
	onShowLogo: () => void;
}

const mapStateToProps = (state: State) => ({
	gameThemes: state.table.gameThemes,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onShowLogo: () => {
		dispatch(tableActionCreators.showLogo());
	}
});

export class TableGameThemes extends React.Component<TableGameThemesProps> {
	private tableGameThemesRef: React.RefObject<HTMLUListElement>;
	private timerRef: number | null = null;

	constructor(props: TableGameThemesProps) {
		super(props);

		this.tableGameThemesRef = React.createRef();
	}

	componentDidMount() {
		const list = this.tableGameThemesRef.current;
		if (!list) {
			return;
		}

		const animationTime = (Math.max(3, this.props.gameThemes.length) * 15 / 18);

		list.style.transitionDuration = `${animationTime}s`;
		list.style.top = `-${list.clientHeight}px`;

		this.timerRef = window.setTimeout(
			() => {
				this.props.onShowLogo();
			},
			animationTime * 1000
		);
	}

	componentWillUnmount() {
		if (this.timerRef) {
			window.clearTimeout(this.timerRef);
			this.timerRef = null;
		}
	}

	render() {
		return (
			<ul id="tableGameThemes" ref={this.tableGameThemesRef} className="tableGameThemes">
				{this.props.gameThemes.map((gameTheme, index) => <li key={index}>{gameTheme}</li>)}
			</ul>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(TableGameThemes);
