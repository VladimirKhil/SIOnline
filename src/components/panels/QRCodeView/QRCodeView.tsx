import React from 'react';
import { useAppSelector } from '../../../state/new/hooks';
import { QRCodeSVG } from 'qrcode.react';

import './QRCodeView.scss';

const QRCodeView: React.FC = () => {
	const ui = useAppSelector((state) => state.ui);

	if (!ui.qrCode) {
		return null;
	}

	return <QRCodeSVG className='qrCode' value={ui.qrCode} size={256} />;
};

export default QRCodeView;