import * as React from 'react';

import './HtmlContent.css';

interface HtmlContentProps {
	uri: string;
}

export function HtmlContent(props: HtmlContentProps) {
	return <iframe className='frame' src={props.uri} allow='autoplay' sandbox='allow-scripts allow-same-origin allow-presentation' />;
}

export default HtmlContent;
