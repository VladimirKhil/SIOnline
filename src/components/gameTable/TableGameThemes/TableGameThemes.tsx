import * as React from 'react';
import State from '../../../state/State';
import { connect } from 'react-redux';
import { showLogo } from '../../../state/tableSlice';

import './TableGameThemes.scss';

interface TableGameThemesProps {
	gameThemes: string[];
	showLogo: () => void;
}

const mapStateToProps = (state: State) => ({
	gameThemes: state.table.gameThemes,
});

const mapDispatchToProps = { showLogo };

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

		const animationTime = Math.max(3, this.props.gameThemes.length) + 1;

		list.style.transitionDuration = `${animationTime}s`;
		list.style.top = `-${list.clientHeight}px`;

		this.timerRef = window.setTimeout(
			() => {
				this.props.showLogo();
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
