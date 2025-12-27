import React, { useState } from 'react';
import Dialog from '../../common/Dialog/Dialog';
import localization from '../../../model/resources/localization';
import { defaultPackageOptions, NewPackageOptions } from '../../../model/siquester/packageGenerator';

import './NewPackageDialog.scss';

interface NewPackageDialogProps {
	onOk: (options: NewPackageOptions) => void;
	onCancel: () => void;
}

const NewPackageDialog: React.FC<NewPackageDialogProps> = ({ onOk, onCancel }) => {
	const layout = React.useRef<HTMLDivElement>(null);

	const [packageName, setPackageName] = useState(defaultPackageOptions.packageName);
	const [authorName, setAuthorName] = useState(defaultPackageOptions.authorName);
	const [roundCount, setRoundCount] = useState(defaultPackageOptions.roundCount);
	const [themeCount, setThemeCount] = useState(defaultPackageOptions.themeCount);
	const [questionCount, setQuestionCount] = useState(defaultPackageOptions.questionCount);
	const [includeFinalRound, setIncludeFinalRound] = useState(defaultPackageOptions.includeFinalRound);
	const [finalThemeCount, setFinalThemeCount] = useState(defaultPackageOptions.finalThemeCount);

	const handleOk = () => {
		onOk({
			packageName,
			authorName,
			roundCount,
			themeCount,
			questionCount,
			includeFinalRound,
			finalThemeCount,
		});
	};

	const handleNumberChange = (
		setter: React.Dispatch<React.SetStateAction<number>>,
		min: number,
		max: number
	) => (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value, 10);
		if (!isNaN(value) && value >= min && value <= max) {
			setter(value);
		}
	};

	return (
		<Dialog ref={layout} title={localization.createPackage} onClose={onCancel} className="newPackageDialog">
			<div className="newPackageDialogBody">
				<div className="newPackageDialogContent">
					<div className="newPackageDialogRow">
						<label htmlFor="packageName">{localization.name}</label>
						<input
							id="packageName"
							type="text"
							value={packageName}
							onChange={(e) => setPackageName(e.target.value)}
							placeholder={localization.package}
						/>
					</div>

					<div className="newPackageDialogRow">
						<label htmlFor="authorName">{localization.authorName}</label>
						<input
							id="authorName"
							type="text"
							value={authorName}
							onChange={(e) => setAuthorName(e.target.value)}
							placeholder={localization.enterAuthorName}
						/>
					</div>

					<div className="newPackageDialogRow">
						<label htmlFor="roundCount">{localization.roundCount}</label>
						<input
							id="roundCount"
							type="number"
							min={1}
							max={20}
							value={roundCount}
							onChange={handleNumberChange(setRoundCount, 1, 20)}
						/>
					</div>

					<div className="newPackageDialogRow">
						<label htmlFor="themeCount">{localization.themeCount}</label>
						<input
							id="themeCount"
							type="number"
							min={1}
							max={20}
							value={themeCount}
							onChange={handleNumberChange(setThemeCount, 1, 20)}
						/>
					</div>

					<div className="newPackageDialogRow">
						<label htmlFor="questionCount">{localization.questionCountPerTheme}</label>
						<input
							id="questionCount"
							type="number"
							min={1}
							max={20}
							value={questionCount}
							onChange={handleNumberChange(setQuestionCount, 1, 20)}
						/>
					</div>

					<div className="newPackageDialogRow newPackageDialogCheckbox">
						<input
							id="includeFinalRound"
							type="checkbox"
							checked={includeFinalRound}
							onChange={(e) => setIncludeFinalRound(e.target.checked)}
						/>
						<label htmlFor="includeFinalRound">{localization.includeFinalRound}</label>
					</div>

					{includeFinalRound && (
						<div className="newPackageDialogRow">
							<label htmlFor="finalThemeCount">{localization.themeCountFinal}</label>
							<input
								id="finalThemeCount"
								type="number"
								min={1}
								max={20}
								value={finalThemeCount}
								onChange={handleNumberChange(setFinalThemeCount, 1, 20)}
							/>
						</div>
					)}
				</div>

				<div className="newPackageDialogButtons">
					<button type="button" className="standard" onClick={handleOk}>
						OK
					</button>
					<button type="button" className="standard" onClick={onCancel}>
						{localization.cancel}
					</button>
				</div>
			</div>
		</Dialog>
	);
};

export default NewPackageDialog;
