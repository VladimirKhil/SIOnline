const enum ErrorCode {
    /** File is too large. */
    OversizedFile = 1,

    /** Cannot kick yourself. */
    CannotKickYourSelf = 2,

    /** Cannot kick bots. */
    CannotKickBots = 3,

    /**  Cannot set host to yourself. */
    CannotSetHostToYourself = 4,

    /** Cannot set host to bots. */
    CannotSetHostToBots = 5,
}

export default ErrorCode;