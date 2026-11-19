import RunGameError2 from './RunGameError2';
import RunGameResponse2 from './RunGameResponse2';

/** Represents either successful game creation or a server-reported creation error. */
type RunGameResult2 =
	| { isSuccess: true; response: RunGameResponse2 }
	| { isSuccess: false; error: RunGameError2 };

export default RunGameResult2;
