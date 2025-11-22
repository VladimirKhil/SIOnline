import React from 'react';
import { useAppSelector } from '../../../state/hooks';
import { QRCodeSVG } from 'qrcode.react';

import './QRCodeView.scss';

const QRCodeView: React.FC = () => {
	const qrCode = useAppSelector((state) => state.ui.qrCode);

	if (!qrCode) {
		return null;
	}

	return <QRCodeSVG className='qrCode' value={qrCode} size={256} />;
};

export default QRCodeView;