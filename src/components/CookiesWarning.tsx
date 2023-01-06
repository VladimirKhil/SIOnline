import * as React from 'react';
import { useState } from 'react';
import localization from '../model/resources/localization';

import './CookiesWarning.css';

function getCookie(cookieName: string) {
	const cookies = `; ${document.cookie}`;
	const parts = cookies.split(`; ${cookieName}=`);

	if (parts.length === 2) {
		const part = parts.pop();
		return part ? part.split(';').shift() : '';
	}

	return '';
}

function setCookie(cookieName: string, cookieValue: string, expirationDays: number) {
    const d = new Date();
    d.setTime(d.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + d.toUTCString();

    document.cookie = `${cookieName}=${cookieValue};${expires};path=/`;
}

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
			<button onClick={acceptCookie}>{localization.cookiesConfirm}</button>
		</div>
	);
}
