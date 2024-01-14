import * as React from 'react';

import './HtmlContent.css';

interface HtmlContentProps {
	uri: string;
}

export function HtmlContent(props: HtmlContentProps) {
	// allow-scripts & allow-same-origin combination is safe until we serve parent and iframe content from different origins
	return <iframe
		aria-label='HTML content'
		className='frame'
		src={props.uri}
		allow='autoplay'
		sandbox='allow-scripts allow-same-origin allow-presentation' />;
}

export default HtmlContent;
