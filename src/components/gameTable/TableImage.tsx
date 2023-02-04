import * as React from 'react';
import State from '../../state/State';
import { connect } from 'react-redux';
import TableBorder from './TableBorder';
import TableAudio from './TableAudio';
import { Dispatch, Action } from 'redux';
import runActionCreators from '../../state/run/runActionCreators';

import './TableImage.css';
import spinnerSvg from '../../../assets/images/spinner.svg';

interface TableImageProps {
	text: string;
	mediaLoaded: () => void;
}

const mapStateToProps = (state: State) => ({
	text: state.table.text,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	mediaLoaded: () => {
		dispatch(runActionCreators.mediaLoaded() as unknown as Action);
	},
});

export class TableImage extends React.Component<TableImageProps> {
	private spinnerRef: React.RefObject<HTMLImageElement>;

	constructor(props: TableImageProps) {
		super(props);

		this.spinnerRef = React.createRef();
	}

	onImageLoad = () => {
		this.props.mediaLoaded();

		if (!this.spinnerRef.current) {
			return;
		}

		this.spinnerRef.current.style.display = 'none';
	};

	render() {
		return (
			<TableBorder>
				<img className="spinnerImg" ref={this.spinnerRef} src={spinnerSvg} />
				<img className="inGameImg" src={this.props.text} onLoad={() => this.onImageLoad()} />
				<TableAudio />
			</TableBorder>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(TableImage);
