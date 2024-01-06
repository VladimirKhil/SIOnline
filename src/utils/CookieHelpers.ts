export function getCookie(cookieName: string) {
	const cookies = `; ${document.cookie}`;
	const parts = cookies.split(`; ${cookieName}=`);

	if (parts.length === 2) {
		const part = parts.pop();
		return part ? part.split(';').shift() : '';
	}

	return '';
}

export function setCookie(cookieName: string, cookieValue: string, expirationDays: number) {
    const d = new Date();
    d.setTime(d.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + d.toUTCString();

    document.cookie = `${cookieName}=${cookieValue};${expires};path=/;SameSite=Lax`;
}