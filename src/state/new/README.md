Unifished new version of Redux State based on redux-toolkit.

Must replace current state in the future.

First of all, current state reducers must be refactored: every reducer must change only its correspondind state slice.

After that, the reducers could be upgraded one after another to the new state.