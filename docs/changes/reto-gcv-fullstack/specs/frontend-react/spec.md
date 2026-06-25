# frontend-react Specification

## Purpose
Provides the UI components to interact with authentication, novelty CRUD, and approval workflows.

## Requirements

### Requirement: Authentication Flow
The frontend MUST capture credentials and store the received JWT for subsequent authenticated requests.

#### Scenario: Successful user login UI
- GIVEN the login screen
- WHEN a user enters valid credentials and submits
- THEN the frontend MUST navigate to the dashboard
- AND securely store the token

### Requirement: Supervisor Inbox
The frontend MUST provide an inbox for Supervisors supporting multiple selections for mass approval.

#### Scenario: Selecting multiple novelties
- GIVEN the supervisor inbox loaded with pending novelties
- WHEN the supervisor selects multiple rows and clicks 'Approve Selected'
- THEN the frontend MUST send a single mass approval request to the backend
- AND refresh the list upon success