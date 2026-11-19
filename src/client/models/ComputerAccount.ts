import Gender from './enums/Gender';
import PlayerStyle from './enums/PlayerStyle';
import CriticalSituationSettings from './CriticalSituationSettings';
import QuestionChoiceSettings from './QuestionChoiceSettings';
import RiskSettings from './RiskSettings';
import ThemeChoiceSettings from './ThemeChoiceSettings';

/** Defines a computer player or showman account. */
export default interface ComputerAccount {
	name: string;
	gender: Gender;
	avatarUri: string;
	style: PlayerStyle;
	erudition: number;
	reactionSpeed: number;
	boldness: number;
	lessMoneyPlayerProbability: number;
	favoriteNumbers: number[];
	themeChoice: ThemeChoiceSettings;
	questionChoice: QuestionChoiceSettings;
	risk: RiskSettings;
	criticalSituation: CriticalSituationSettings;
}
