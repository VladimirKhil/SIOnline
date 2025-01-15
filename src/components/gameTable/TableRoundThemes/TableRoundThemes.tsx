import * as React from 'react';
import State from '../../../state/State';
import { connect } from 'react-redux';
import AutoSizedText from '../../common/AutoSizedText/AutoSizedText';
import { showRoundTable } from '../../../state/tableSlice';
import { useAppDispatch } from '../../../state/hooks';
import { stopAudio } from '../../../state/commonSlice';

import './TableRoundThemes.css';

interface TableRoundThemesProps {
	roundThemes: string[];
}

const mapStateToProps = (state: State) => ({
	roundThemes: state.table.roundInfo.map(theme => theme.name)
});

const TableRoundThemes: React.FC<TableRoundThemesProps> = ({ roundThemes }) => {
    const [themeIndex, setThemeIndex] = React.useState(0);
	let timerThemeIndex = 0;
    const textRef = React.useRef<HTMLDivElement>(null);
    let timerRef: number | null = null;
    let fadeTimerRef: number | null = null;

	const appDispatch = useAppDispatch();

	const setNextTheme = () => {
		if (timerThemeIndex === roundThemes.length) {
			if (timerRef) {
				window.clearInterval(timerRef);
			}

			appDispatch(stopAudio());
			appDispatch(showRoundTable());
			return;
		}

		setThemeIndex(timerThemeIndex);
		timerThemeIndex = timerThemeIndex + 1;

		const text = textRef.current;

		if (!text) {
            return;
        }

		text.style.transform = 'scale(1)';

		fadeTimerRef = window.setTimeout(
			() => {
				text.style.transform = 'scale(0)';
			},
			1700
		);
	};

    React.useEffect(() => {
        setNextTheme();
        timerRef = window.setInterval(setNextTheme, 1900);

        return () => {
            if (timerRef) {
                window.clearTimeout(timerRef);
                timerRef = null;
            }

            if (fadeTimerRef) {
                window.clearTimeout(fadeTimerRef);
                fadeTimerRef = null;
            }
        };
    }, []);

    const text = themeIndex < roundThemes.length ? roundThemes[themeIndex] : '';

    return (
        <div className="tableBorderCentered scaleText" ref={textRef}>
            <AutoSizedText id="tableText" className="tableText tableTextCenter margined" maxFontSize={144}>
                {text}
            </AutoSizedText>
        </div>
    );
};

export default connect(mapStateToProps)(TableRoundThemes);
