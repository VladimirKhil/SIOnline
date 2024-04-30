import * as React from 'react';
import localization from '../../../model/resources/localization';
import ContentGroup from '../../../model/ContentGroup';
import ContentType from '../../../model/enums/ContentType';
import Constants from '../../../model/enums/Constants';
import StackedContent from '../StackedContent/StackedContent';

import './TableLogo.css';

import logoImg from '../../../../assets/images/logo.png';

export default function TableLogo() {
	const logo: ContentGroup[] = [{
		content: [{
			type: ContentType.Image,
			value: logoImg,
			read: false,
			partial: false,
		}],
		weight: Constants.LARGE_CONTENT_WEIGHT,
		columnCount: 1,
	}, {
		content: [{
			type: ContentType.Text,
			value: localization.tableLogoAuthor,
			read: false,
			partial: false,
		}],
		weight: 1,
		columnCount: 1,
	}];

	return <div className='tablelogo'><StackedContent content={logo} canPlayAudio={false} /></div>;
}
