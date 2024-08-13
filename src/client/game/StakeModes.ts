/** Defines stake types. */
enum StakeModes {
    /** No stakes allowed. */
    None = 0,

	/** Fixed stake. */
	Stake = 1,

	/** Pass. */
	Pass = 2,

	/** All-in. */
	AllIn = 4,
}

export default StakeModes;

export function parseStakeModesFromString(input: string): StakeModes {
    const options = input.split(',').map(option => option.trim());
    let result: StakeModes = 0;

    options.forEach(option => {
        switch (option) {
            case 'Stake':
                result |= StakeModes.Stake;
                break;

            case 'Pass':
                result |= StakeModes.Pass;
                break;

			case 'AllIn':
				result |= StakeModes.AllIn;
				break;

			default:
				break;
        }
    });

    return result;
}