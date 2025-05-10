import React from 'react';
import ProgressBar from '../../common/ProgressBar/ProgressBar';

import './ProgressDialog.scss';

interface ProgressDialogProps {
	title: string;
	isIndeterminate: boolean;
	value?: number;
}

const ProgressDialog: React.FC<ProgressDialogProps> = ({
	title,
	isIndeterminate,
	value,
}) => <div className='progress-dialog'>
	<div className='progress-dialog-box'>
		<div className='progress-dialog-message'>{title}</div>
		<ProgressBar isIndeterminate={isIndeterminate} value={value} />
	</div>
</div>;

export default ProgressDialog;