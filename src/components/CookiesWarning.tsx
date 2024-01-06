import * as React from 'react';
import { useState } from 'react';
import localization from '../model/resources/localization';
import { getCookie, setCookie } from '../utils/CookieHelpers';

import './CookiesWarning.css';

const USER_CONSENT_KEY = 'USER_CONSENT';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function CookiesWarning(): JSX.Element | null {
	const userConsent = getCookie(USER_CONSENT_KEY);

	const [accepted, setAccepted] = useState(userConsent !== '');

	function acceptCookie() {
		setCookie(USER_CONSENT_KEY, 'True', 365);
		setAccepted(true);
	}

	return accepted ? null : (
		<div className='cookies__warning'>
			<span>{localization.cookiesWarning}</span>
			<button className='standard' onClick={acceptCookie}>{localization.cookiesConfirm}</button>
		</div>
	);
}
