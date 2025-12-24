# Comprehensive Game Integration Test

## Overview

The `GameIntegration.test.ts` file contains a comprehensive integration test that validates the complete game flow without a UI. This test is designed to verify that all critical game functionality works correctly together.

## Purpose

This test serves as:
- **Regression test**: Validates that future code changes don't break core game functionality
- **Integration validation**: Ensures server communication, state management, and game logic work together
- **Documentation**: Demonstrates the complete game flow from initialization to gameplay

## Test Scenario

The test executes the following steps:

### 1. **Initialization**
   - Creates Redux store with game state
   - Sets up data context with game clients
   - Initializes application state

### 2. **User Setup**
   - Sets user login credentials
   - Navigates to game lobby

### 3. **Game Configuration**
   - Creates new game instance
   - Configures game settings:
     - Game name
     - Number of players
     - Game type (Classic)
     - Package type (Random)

### 4. **Game Creation**
   - Sends game creation request to server
   - Waits for server confirmation
   - Enters game room

### 5. **Bot Players**
   - Adds bot players to fill game slots
   - Waits for bots to be ready

### 6. **Game Start**
   - Waits for game to start
   - Monitors game state transitions

### 7. **Gameplay**
   - Automatically handles game decisions:
     - **Choose**: Selects random available questions or themes
     - **Answer**: Provides test answers to questions
     - **SelectPlayer**: Selects players when required
     - **Stake**: Makes stake decisions
   - Plays through minimum of 3 questions
   - Tracks game progression

### 8. **Validation**
   - Verifies all steps completed successfully
   - Confirms questions were played
   - Validates state transitions

## What is Validated

The test validates:

✅ **Server Connection**: Application can connect to game server  
✅ **Game Creation**: New games can be created and configured  
✅ **Player Management**: Bot players can be added  
✅ **Game Lifecycle**: Game starts and progresses correctly  
✅ **State Management**: Redux state updates correctly  
✅ **Decision Handling**: All decision types are handled  
✅ **Question Flow**: Questions can be selected and played  
✅ **Event Tracking**: Game events are logged correctly  

## Running the Test

### Run with Default Settings

```bash
npm run test GameIntegration.test.ts
```

### Skip Integration Test (for CI/CD)

```bash
SKIP_INTEGRATION_TEST=1 npm run test
```

### Adjust Timeout

```bash
TEST_TIMEOUT=90000 npm run test GameIntegration.test.ts
```

## Configuration

### Environment Variables

- **SKIP_INTEGRATION_TEST**: Set to `1` to skip this test
  - Use in CI/CD environments without live server access
  - Example: `SKIP_INTEGRATION_TEST=1 npm test`

- **TEST_TIMEOUT**: Timeout in milliseconds (default: 60000)
  - Increase for slower connections
  - Example: `TEST_TIMEOUT=120000 npm test GameIntegration.test.ts`

## Requirements

### For Full Test Execution

1. **Live Game Server**: Access to game server at `https://vladimirkhil.com/si/api`
2. **Network Connection**: Stable internet connection
3. **Server Availability**: Game server must be operational
4. **Sufficient Time**: Test may take 30-60 seconds to complete

### For Mocked Testing

To run without live server:
1. Set `SKIP_INTEGRATION_TEST=1`
2. Or modify test to use mocked server responses

## Test Output

The test produces detailed console output:

```
=== Game Integration Test Results ===
Questions played: 5
Total events: 28
Sample events:
  - Initialized
  - Set login
  - Navigated to lobby
  - Configured game
  - Created game
  - Entered game room
  - Added bot player
  - Game started
  - Decision: Choose
  - Question 1: Price 100
  - Decision: Answer
  - Question 2: Price 200
  ...
=====================================
```

## Comparison with Other Tests

| Test Type | File | Purpose | UI Required | Server Required |
|-----------|------|---------|-------------|-----------------|
| Unit Tests | `ClientController.test.ts` | Test individual components | No | No |
| Manual Tests | `manual-tests/*.js` | Visual validation | Yes (Playwright) | Yes |
| Integration Test | `GameIntegration.test.ts` | End-to-end flow | No | Yes* |
| Runner | `Runner.ts` | Manual gameplay simulation | No | Yes |

*Can be skipped with `SKIP_INTEGRATION_TEST=1`

## Related Files

- **`src/Runner.ts`**: Original simulation script that inspired this test
- **`manual-tests/`**: Playwright-based UI tests
- **`test/ClientController.test.ts`**: Unit tests for game controller
- **`src/state/`**: Redux state management tested by this integration

## Known Limitations

1. **Server Dependency**: Requires live server or mocked responses
2. **Network Dependency**: Needs stable internet connection
3. **Non-Deterministic**: Gameplay may vary slightly each run
4. **Time Required**: Takes longer than unit tests (30-60 seconds)
5. **External State**: Server state affects test results

## Troubleshooting

### Test Timeout
**Problem**: Test exceeds timeout  
**Solution**: Increase `TEST_TIMEOUT` environment variable

### Connection Errors
**Problem**: Cannot connect to server  
**Solution**: 
- Check internet connection
- Verify server is accessible
- Use `SKIP_INTEGRATION_TEST=1` to skip

### Insufficient Questions Played
**Problem**: Test fails because not enough questions played  
**Solution**:
- Increase timeout
- Check server is responding correctly
- Verify game state transitions in logs

## Future Enhancements

Potential improvements for this test:

1. **Mocked Server**: Add mock server responses for offline testing
2. **More Scenarios**: Test different game types and configurations
3. **Error Cases**: Validate error handling and edge cases
4. **Performance Metrics**: Track and assert on performance characteristics
5. **Parallel Execution**: Run multiple game sessions simultaneously
6. **Extended Gameplay**: Play complete game to finish

## Maintenance

When making changes to game logic:

1. **Run this test** to ensure core functionality still works
2. **Update test** if game flow changes significantly
3. **Adjust timeouts** if server response times change
4. **Add new validations** for new features
5. **Document changes** in this file

## Contributing

When modifying this test:
- Keep test focused on critical path
- Maintain comprehensive event logging
- Update documentation for any changes
- Ensure test can be skipped for CI/CD
- Test with and without live server

---

**Last Updated**: 2025-12-24  
**Test Author**: Based on `src/Runner.ts` implementation  
**Maintainer**: SIOnline Development Team
