declare module 'firebase/app' {
	export interface FirebaseOptions {
		apiKey?: string;
		authDomain?: string;
		projectId?: string;
		storageBucket?: string;
		messagingSenderId?: string;
		appId?: string;
		measurementId?: string;
		[key: string]: string | undefined;
	}

	export interface FirebaseApp {
		readonly name: string;
		readonly options: FirebaseOptions;
		automaticDataCollectionEnabled?: boolean;
	}

	export function initializeApp(options: FirebaseOptions, name?: string): FirebaseApp;
}

declare module 'firebase/analytics' {
	import type { FirebaseApp } from 'firebase/app';

	export interface Analytics {
		readonly app: FirebaseApp;
	}

	export function getAnalytics(app?: FirebaseApp): Analytics;
	export function logEvent(
		analyticsInstance: Analytics,
		eventName: string,
		eventParams?: Record<string, unknown>,
		options?: { global?: boolean }
	): void;
}