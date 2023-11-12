/** Defines well-known game stage. */
const enum GameStage {
    /** Game has been created. */
    Created = 'Created',

    /** Game has been started. */
    Started = 'Started',

    /** Common round. */
    Round = 'Round',

    /** Final round. */
    Final = 'Final',

    /** Game has been finished. */
    Finished = 'Finished'
}

export default GameStage;