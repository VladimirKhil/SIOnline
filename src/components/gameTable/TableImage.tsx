import * as React from 'react';
import State from '../../state/State';
import { connect } from 'react-redux';
import TableBorder from './TableBorder';

import './TableImage.css';
import spinnerSvg from '../../../assets/images/spinner.svg';

interface TableImageProps {
	text: string;
}

const mapStateToProps = (state: State) => ({
	text: state.run.table.text
});

export class TableImage extends React.Component<TableImageProps> {
	private spinnerRef: React.RefObject<HTMLImageElement>;

	constructor(props: TableImageProps) {
		super(props);

		this.spinnerRef = React.createRef();
	}

	onImageLoad = () => {
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
			</TableBorder>
		);
	}
}

export default connect(mapStateToProps)(TableImage);
