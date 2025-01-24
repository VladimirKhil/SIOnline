import React from 'react';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { getPin } from '../../../state/room2Slice';
import inviteLink from '../../../utils/inviteLink';
import { isHost } from '../../../utils/StateHelpers';
import State from '../../../state/State';
import { connect } from 'react-redux';

import './TableWelcome.scss';

interface TableWelcomeProps {
	isHost: boolean;
}

const mapStateToProps = (state: State) => ({
	isHost: isHost(state),
});

const TableWelcome: React.FC<TableWelcomeProps> = (props: TableWelcomeProps) => {
	const appDispatch = useAppDispatch();
	const common = useAppSelector(state => state.common);

	const getPinCore = () => {
		appDispatch(getPin());
	};

	return <div className='table-welcome'>
		<div className='table-welcome__content'>
			<AutoSizedText className="tableText fadeIn tableTextCenter margined" maxFontSize={72}>
				{localization.tableHint}
			</AutoSizedText>
		</div>

		<div className='table-welcome__buttons'>
			<button type="button" className='standard' disabled={!common.isConnected} onClick={() => inviteLink(appDispatch)}>
				{localization.inviteLink}
			</button>

			{props.isHost
				? <button type='button' className='standard' disabled={!common.isConnected} onClick={getPinCore}>
					{localization.getPin}
				</button>
				: null}
		</div>
	</div>;
};

export default connect(mapStateToProps)(TableWelcome);