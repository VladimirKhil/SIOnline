import * as React from 'react';

import './TableHtml.css';

interface HtmlContentProps {
	uri: string;
	weight: number;
}

export function HtmlContent(props: HtmlContentProps) {
	return <iframe className='frame' src={props.uri} allow='autoplay' sandbox='allow-scripts allow-same-origin allow-presentation' />;
}

export default HtmlContent;
