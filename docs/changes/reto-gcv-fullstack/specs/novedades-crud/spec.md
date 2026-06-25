# novedades-crud Specification

## Purpose
Provides CRUD operations for novelties with strict server-side validation and DTO-based data transfer.

## Requirements

### Requirement: Create Novelty
The system MUST allow creating a novelty with type, start/end dates, description, and an optional attachment.

#### Scenario: Valid novelty creation
- GIVEN an authenticated Colaborador with valid novelty data
- WHEN they submit the creation request
- THEN the system MUST store the novelty with `BORRADOR` as the initial state
- AND return the created record DTO

#### Scenario: Invalid dates
- GIVEN an authenticated user providing an end date before the start date
- WHEN they submit the creation request
- THEN the system MUST reject the request with a validation error

### Requirement: List Novelties
The system MUST support listing novelties with filters for type, status, and date range.

#### Scenario: Filtering by status
- GIVEN an authenticated user with permission to view multiple novelties
- WHEN they request a list filtered by PENDIENTE status
- THEN the system MUST return only records matching that status