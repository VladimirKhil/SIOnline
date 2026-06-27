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
    return (
        <input
            type="text"
            aria-label='Name'
            className={`${className} nameInput ${useAuth ? 'nameInput--auth' : ''}`}
            disabled={joinGameProgress || useAuth}
            value={useAuth && authName ? authName : userName}
            onChange={e => setName(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={onNameBlur}
            maxLength={30}
        />
    );
}
