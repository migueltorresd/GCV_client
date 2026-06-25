# rbac-multitenant Specification

## Purpose
Enforces Role-Based Access Control and data isolation per tenant (filial_id) strictly within the backend.

## Requirements

### Requirement: Multi-tenant Isolation
The system MUST isolate all data queries by filial_id, ensuring users cannot access data outside their assigned filial.

#### Scenario: Querying data outside filial
- GIVEN an authenticated user from filial A
- WHEN the user attempts to retrieve records belonging to filial B
- THEN the system MUST return empty results or an access denied error
- AND MUST NOT return any data from filial B

### Requirement: Role Restrictions
The system MUST enforce role-specific permissions: Colaboradores access only their own data, Supervisors and RRHH access filial-wide data.

#### Scenario: Colaborador listing only sees their own novelties

- GIVEN an authenticated Colaborador where another Colaborador in the same filial also has novelties
- WHEN they request `GET /novedades`
- THEN the system MUST return only novelties where `solicitante_id = authenticated user's id`
- AND MUST NOT include novelties from other users in the same filial

#### Scenario: Colaborador result excludes cross-filial novelties

- GIVEN an authenticated Colaborador from filial A
- WHEN they request `GET /novedades`
- THEN the system MUST NOT return any novelty from filial B

#### Scenario: Supervisor accesses filial data
- GIVEN an authenticated Supervisor
- WHEN they request to view novelties within their filial
- THEN the system MUST return all matching records