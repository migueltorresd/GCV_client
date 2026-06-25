# auth-jwt Specification

## Purpose
Simulated authentication system issuing and consuming JSON Web Tokens (JWT) for identity verification without plain text passwords.

## Requirements

### Requirement: Issue Token
The system MUST issue a JWT upon successful login containing claims for sub, email, rol, and filial_id.

#### Scenario: Successful login
- GIVEN valid seed credentials
- WHEN the user attempts to log in
- THEN the system MUST return a valid JWT containing sub, email, rol, and filial_id claims

#### Scenario: Invalid login
- GIVEN invalid credentials
- WHEN the user attempts to log in
- THEN the system MUST reject the request
- AND return a 401 Unauthorized error

### Requirement: Validate Token
The system MUST validate the JWT on protected endpoints and reject requests lacking a valid token.

#### Scenario: Access with valid token
- GIVEN a valid JWT token in the Authorization header
- WHEN the user accesses a protected endpoint
- THEN the system MUST grant access

#### Scenario: Access with missing token
- GIVEN no Authorization header
- WHEN the user accesses a protected endpoint
- THEN the system MUST reject the request with 401 Unauthorized