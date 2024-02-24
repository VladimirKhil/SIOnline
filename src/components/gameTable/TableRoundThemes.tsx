import * as React from 'react';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import tableActionCreators from '../../state/table/tableActionCreators';
import AutoSizedText from '../common/AutoSizedText';
import actionCreators from '../../logic/actionCreators';
import commonActionCreators from '../../state/common/commonActionCreators';

interface TableRoundThemesProps {
	roundThemes: string[];
	onShowRoundTable: () => void;
}

interface TableRoundThemesState {
	themeIndex: number;
}

const mapStateToProps = (state: State) => ({
	roundThemes: state.table.roundInfo.map(theme => theme.name)
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onShowRoundTable: () => {
		dispatch(tableActionCreators.showRoundTable());
		dispatch(commonActionCreators.stopAudio());
	},
});

export class TableRoundThemes extends React.Component<TableRoundThemesProps, TableRoundThemesState> {
	private textRef: React.RefObject<HTMLDivElement>;
	private timerRef: number | null = null;
	private fadeTimerRef: number | null = null;

	constructor(props: TableRoundThemesProps) {
		super(props);

		this.state = {
			themeIndex: -1
		};

		this.textRef = React.createRef();
	}

	componentDidMount() {
		const text = this.textRef.current;
		if (!text) {
			return;
		}

		const setNextTheme = () => {
			if (this.state.themeIndex === this.props.roundThemes.length - 1) {
				if (this.timerRef) {
					window.clearInterval(this.timerRef);
				}

				this.props.onShowRoundTable();
				return;
			}

			this.setState((previousState: TableRoundThemesState) => ({
				themeIndex: previousState.themeIndex + 1
			}));

			text.style.transform = 'scale(1)';

			this.fadeTimerRef = window.setTimeout(
				() => {
					text.style.transform = 'scale(0)';
				},
				1700
			);
		};

		setNextTheme();
		this.timerRef = window.setInterval(setNextTheme, 1900);
	}

	componentWillUnmount() {
		if (this.timerRef) {
			window.clearTimeout(this.timerRef);
			this.timerRef = null;
		}

		if (this.fadeTimerRef) {
			window.clearTimeout(this.fadeTimerRef);
			this.fadeTimerRef = null;
		}
	}

	render() {
		const text = this.state.themeIndex < this.props.roundThemes.length ?
			this.props.roundThemes[this.state.themeIndex] : '';

		return (
			<div className="tableBorderCentered scaleText" ref={this.textRef}>
				<AutoSizedText id="tableText" className="tableText tableTextCenter" maxFontSize={288}>
					{text}
				</AutoSizedText>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(TableRoundThemes);
