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

    /** Avatar image is too big. */
    AvatarTooBig = 6,

    /** Avatar image format is not supported. */
    InvalidAvatar = 7,

    /** Person with the same name already exists. */
    PersonAlreadyExists = 8,

    /** Appellation failed: too few players. */
    AppellationFailedTooFewPlayers = 9,
}

export default ErrorCode;