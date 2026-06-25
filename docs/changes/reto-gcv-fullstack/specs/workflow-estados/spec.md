# workflow-estados Specification

## Purpose
Manages novelty state transitions through a strict state machine verified on the backend.

## Requirements

### Requirement: State Transitions
The system MUST ONLY allow valid state transitions: BORRADOR to PENDIENTE, and PENDIENTE to APROBADA or RECHAZADA.

#### Scenario: Valid transition to Pending
- GIVEN a novelty in BORRADOR state
- WHEN an allowed user submits it
- THEN the state MUST change to PENDIENTE

#### Scenario: Invalid transition rejection
- GIVEN a novelty in APROBADA state
- WHEN a user attempts to change it to RECHAZADA
- THEN the system MUST reject the transition with an error

### Requirement: Mass Approval
The system MUST allow Supervisors to approve multiple pending novelties simultaneously.

#### Scenario: Supervisor mass approval with filter-and-skip

- GIVEN a list of novelty IDs where some are in `PENDIENTE` and others are not, all belonging to the Supervisor's filial
- WHEN a Supervisor sends `POST /novedades/aprobar-masivo` with those IDs
- THEN the system MUST transition only the `PENDIENTE` novelties to `APROBADA`
- AND MUST silently skip IDs not in `PENDIENTE` state (no exception thrown)
- AND MUST return a summary with `{ procesados: number[], ignorados: number[] }`