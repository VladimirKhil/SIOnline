import * as React from 'react';
import Config from '../../../Config';

import './Ads.scss';

declare const config: Config | undefined;

interface AdsProps {
	ads?: string;
}

declare const onLoad: () => void;

export default function Ads(props: AdsProps) {
	React.useEffect(() => {
		if (onLoad) {
			onLoad();
		}
	}, []);

	return <div className="siAdHost" dangerouslySetInnerHTML={{ __html: config && config.ads ? config.ads : '' }} />;
}