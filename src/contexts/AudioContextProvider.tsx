import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

interface AudioContextValue {
	audioContext: AudioContext;
	canPlayAudio: boolean;
}

const AudioContextContext = createContext<AudioContextValue | null>(null);

export const AudioContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const audioContextRef = useRef<AudioContext>(new AudioContext());
	const [canPlayAudio, setCanPlayAudio] = useState(false);

	useEffect(() => {
		const context = audioContextRef.current;

		const stateChangeListener = () => {
			const canPlay = context.state === 'running';
			setCanPlayAudio(canPlay);

			if (canPlay) {
				context.removeEventListener('statechange', stateChangeListener);
			}
		};

		const clickListener = () => {
			if (context.state !== 'running') {
				context.resume();
				context.createGain();
			}
			window.removeEventListener('click', clickListener);
		};

		context.addEventListener('statechange', stateChangeListener);
		context.resume().then(stateChangeListener);

		if (context.state !== 'running') {
			window.addEventListener('click', clickListener);
		}

		return () => {
			context.removeEventListener('statechange', stateChangeListener);
			window.removeEventListener('click', clickListener);
		};
	}, []);

	return (
		<AudioContextContext.Provider value={{ audioContext: audioContextRef.current, canPlayAudio }}>
			{children}
		</AudioContextContext.Provider>
	);
};

export const useAudioContext = () => {
	const context = useContext(AudioContextContext);
	if (!context) {
		throw new Error('useAudioContext must be used within AudioContextProvider');
	}
	return context;
};
