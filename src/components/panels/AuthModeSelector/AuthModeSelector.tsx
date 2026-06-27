import * as React from 'react';
import localization from '../../../model/resources/localization';
import steamLogo from '../../../../assets/images/steam_logo.png';
import personSvg from '../../../../assets/images/person.svg';

import './AuthModeSelector.scss';

export default function AuthModeSelector({ useAuth, setUseAuth }: { useAuth: boolean; setUseAuth: (useAuth: boolean) => void; }) {
    return (
        <div className="authTypeSelector">
            <button
                type="button"
                className={`authOption ${useAuth ? 'active' : ''}`}
                onClick={() => setUseAuth(true)}
                title="Steam"
            >
                <img src={steamLogo} alt="Steam" />
            </button>
            <button
                type="button"
                className={`authOption ${!useAuth ? 'active' : ''}`}
                onClick={() => setUseAuth(false)}
                title={localization.guest}
            >
                <img src={personSvg} alt={localization.guest} />
            </button>
        </div>
    );
}