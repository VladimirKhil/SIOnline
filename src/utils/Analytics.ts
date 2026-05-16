import { Analytics } from 'firebase/analytics';

export let analytics: Analytics | null = null;

export const setAnalytics = (value: Analytics | null): void => {
	analytics = value;
};
