import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import State from '../state/State';
import { connect } from 'react-redux';

interface LogoutProps {
	completed: boolean;
}

const mapStateToProps = (state: State) => ({
	completed: !state.login.completed,
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function Logout(props: LogoutProps): JSX.Element | null {
	const navigate = useNavigate();

	useEffect(() => {
		if (props.completed) {
			navigate('/');
		}
	}, [props.completed]);

	return null;
}

export default connect(mapStateToProps)(Logout);
