/** Defines stake types. */
enum StakeTypes {
    /** No stakes allowed. */
    None = 0,

	/** Nominal (initial question price). */
	Nominal = 1,

	/** Fixed stake. */
	Stake = 2,

	/** Pass. */
	Pass = 4,

	/** All-in. */
	AllIn = 8,
}

export default StakeTypes;

export function parseStakeTypesFromString(input: string): StakeTypes {
    const options = input.split(',').map(option => option.trim());
    let result: StakeTypes = 0;

    options.forEach(option => {
        switch (option) {
            case 'Nominal':
                result |= StakeTypes.Nominal;
                break;

            case 'Stake':
                result |= StakeTypes.Stake;
                break;

            case 'Pass':
                result |= StakeTypes.Pass;
                break;

			case 'AllIn':
				result |= StakeTypes.AllIn;
				break;

			default:
				break;
        }
    });

    return result;
}