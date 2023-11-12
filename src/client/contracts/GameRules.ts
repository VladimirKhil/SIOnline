/** Defines well-known game rules. */
const enum GameRules {
    /** Simple rules. */
    None = 0,

    /** Game with false starts. */
    FalseStart = 1,

    /** Oral game. */
    Oral = 2,

    /** Do not penalize wrong answers. */
    IgnoreWrong = 4,
}

export default GameRules;

export function parseRulesFromString(input: string): GameRules {
    const options = input.split(',').map(option => option.trim());
    let result: GameRules = 0;

    options.forEach(option => {
        switch (option) {
            case 'FalseStart':
                result |= GameRules.FalseStart;
                break;

            case 'Oral':
                result |= GameRules.Oral;
                break;

            case 'IgnoreWrong':
                result |= GameRules.IgnoreWrong;
                break;

			default:
				break;
        }
    });

    return result;
}
