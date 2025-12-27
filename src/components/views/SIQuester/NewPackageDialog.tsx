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

	// Validation error states
	const [roundCountError, setRoundCountError] = useState<string>('');
	const [themeCountError, setThemeCountError] = useState<string>('');
	const [questionCountError, setQuestionCountError] = useState<string>('');
	const [finalThemeCountError, setFinalThemeCountError] = useState<string>('');

	const validateNumber = (value: number, min: number, max: number): string => {
		if (isNaN(value) || value < min || value > max) {
			return localization.invalidValueRange.replace('{0}', min.toString()).replace('{1}', max.toString());
		}
		return '';
	};

	const handleOk = () => {
		// Validate all fields before submitting
		const roundError = validateNumber(roundCount, 1, 20);
		const themeError = validateNumber(themeCount, 1, 20);
		const questionError = validateNumber(questionCount, 1, 20);
		const finalThemeError = includeFinalRound ? validateNumber(finalThemeCount, 1, 20) : '';

		setRoundCountError(roundError);
		setThemeCountError(themeError);
		setQuestionCountError(questionError);
		setFinalThemeCountError(finalThemeError);

		// Only submit if all validations pass
		if (!roundError && !themeError && !questionError && !finalThemeError) {
			onOk({
				packageName,
				authorName,
				roundCount,
				themeCount,
				questionCount,
				includeFinalRound,
				finalThemeCount,
			});
		}
	};

	const handleNumberChange = (
		setter: React.Dispatch<React.SetStateAction<number>>,
		errorSetter: React.Dispatch<React.SetStateAction<string>>,
		min: number,
		max: number
	) => (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value, 10);
		setter(value);
		
		// Validate and set error message
		const error = validateNumber(value, min, max);
		errorSetter(error);
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
						<div className="inputWithError">
							<input
								id="roundCount"
								type="number"
								min={1}
								max={20}
								value={roundCount}
								onChange={handleNumberChange(setRoundCount, setRoundCountError, 1, 20)}
								className={roundCountError ? 'error' : ''}
							/>
							{roundCountError && <span className="errorMessage">{roundCountError}</span>}
						</div>
					</div>

					<div className="newPackageDialogRow">
						<label htmlFor="themeCount">{localization.themeCount}</label>
						<div className="inputWithError">
							<input
								id="themeCount"
								type="number"
								min={1}
								max={20}
								value={themeCount}
								onChange={handleNumberChange(setThemeCount, setThemeCountError, 1, 20)}
								className={themeCountError ? 'error' : ''}
							/>
							{themeCountError && <span className="errorMessage">{themeCountError}</span>}
						</div>
					</div>

					<div className="newPackageDialogRow">
						<label htmlFor="questionCount">{localization.questionCountPerTheme}</label>
						<div className="inputWithError">
							<input
								id="questionCount"
								type="number"
								min={1}
								max={20}
								value={questionCount}
								onChange={handleNumberChange(setQuestionCount, setQuestionCountError, 1, 20)}
								className={questionCountError ? 'error' : ''}
							/>
							{questionCountError && <span className="errorMessage">{questionCountError}</span>}
						</div>
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
							<div className="inputWithError">
								<input
									id="finalThemeCount"
									type="number"
									min={1}
									max={20}
									value={finalThemeCount}
									onChange={handleNumberChange(setFinalThemeCount, setFinalThemeCountError, 1, 20)}
									className={finalThemeCountError ? 'error' : ''}
								/>
								{finalThemeCountError && <span className="errorMessage">{finalThemeCountError}</span>}
							</div>
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
