# auditoria Specification

## Purpose
Centralizes the immutable recording of critical system actions for auditing and traceability.

## Requirements

### Requirement: Action Logging

The system MUST log critical actions (create, send, approve, reject, export) with: actor, action, entity, entity_id, filial_id, timestamp, and an optional `detalle` (JSONB) for additional context (e.g. rejection reason, IDs processed in mass approval).

#### Scenario: Novelty approval logged
- GIVEN a Supervisor approving a novelty
- WHEN the approval transaction succeeds
- THEN the system MUST create an audit record capturing the actor, 'approve' action, novelty ID, and timestamp

### Requirement: Audit Retrieval

The system MUST expose `GET /auditoria`, restricted to the `RRHH` role only, scoped by the authenticated user's `filial_id`.

#### Scenario: Filtering audit logs

- GIVEN an authenticated RRHH user
- WHEN they request `GET /auditoria` filtered by a specific actor
- THEN the system MUST return only audit logs from their filial matching that actor filter

#### Scenario: Non-RRHH role is denied

- GIVEN an authenticated Colaborador or Supervisor
- WHEN they request `GET /auditoria`
- THEN the system MUST return `403 Forbidden`