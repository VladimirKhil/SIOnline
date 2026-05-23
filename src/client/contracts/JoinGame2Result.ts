/**
 * Defines join result types returned by JoinGame2 protocol.
 */
enum JoinGame2Result {
    Success = 'Success',
    InvalidRole = 'InvalidRole',
    GameNotFound = 'GameNotFound',
    InternalServerError = 'InternalServerError',
    Forbidden = 'Forbidden',
    CommonJoinError = 'CommonJoinError',
    AuthorizationModeNotSupported = 'AuthorizationModeNotSupported',
    AuthorizationDataMissing = 'AuthorizationDataMissing',
    AuthorizationFailed = 'AuthorizationFailed',
    AuthorizationServiceError = 'AuthorizationServiceError',
    AuthorizationInvalidUserName = 'AuthorizationInvalidUserName',
    ForbiddenRole = 'ForbiddenRole',
    WrongPassword = 'WrongPassword',
    NameIsOccupied = 'NameIsOccupied',
    PositionNotFound = 'PositionNotFound',
    PlaceIsOccupied = 'PlaceIsOccupied',
    FreePlaceNotFound = 'FreePlaceNotFound',
}

export default JoinGame2Result;