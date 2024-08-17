import * as React from 'react';
import Config from '../../../Config';

import './Ads.scss';

declare const config: Config | undefined;

interface AdsProps {
	ads?: string;
}

export default function Ads(props: AdsProps) {
	return <div className="siAdHost" dangerouslySetInnerHTML={{ __html: config && config.ads ? config.ads : '' }} />;
}