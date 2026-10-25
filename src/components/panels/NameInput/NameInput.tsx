import * as React from 'react';

import './NameInput.scss';

export default function NameInput({
    useAuth,
    joinGameProgress,
    authName,
    userName,
    onKeyDown,
    onNameBlur,
    setName,
    className,
}: {
    useAuth: boolean;
    joinGameProgress: boolean;
    authName?: string;
    userName: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onNameBlur?: () => void;
    setName: (name: string) => void;
    className: string;
}): JSX.Element {
    const displayValue = useAuth && authName ? authName : userName;
    const isSteam = displayValue.startsWith('Ⓢ');

    return (
        <input
            type="text"
            aria-label='Name'
            className={`${className} nameInput ${useAuth ? 'nameInput--auth' : ''}`}
            disabled={joinGameProgress || useAuth}
            value={isSteam ? displayValue.substring(1) : displayValue}
            onChange={e => setName(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={onNameBlur}
            maxLength={30}
        />
    );
}
