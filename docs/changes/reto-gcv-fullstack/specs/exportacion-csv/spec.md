# exportacion-csv Specification

## Purpose
Generates CSV exports of approved novelties formatted strictly according to Anexo E.

## Requirements

### Requirement: CSV Generation
The system MUST generate a CSV file using ';' as separator and UTF-8 encoding.

#### Scenario: Requesting valid export
- GIVEN an authenticated RRHH user
- WHEN they request an export of approved novelties for a specific date range
- THEN the system MUST generate a UTF-8 encoded CSV separated by ';'

### Requirement: Formatting Columns

The system MUST use exactly these 8 column headers, in this order, with `;` as separator, UTF-8 encoding, no BOM:

```
filial_codigo;documento_solicitante;tipo_novedad;fecha_inicio;fecha_fin;estado;aprobado_por;fecha_aprobacion
```

- `filial_codigo`: código de la filial (ej. `AND`), NO el nombre.
- `documento_solicitante`: email del solicitante.
- `aprobado_por`: email del aprobador.
- `id_novedad` y `descripcion` NO se incluyen.

#### Scenario: Column validation

- GIVEN a generated CSV export
- WHEN the first line is inspected
- THEN it MUST be exactly `filial_codigo;documento_solicitante;tipo_novedad;fecha_inicio;fecha_fin;estado;aprobado_por;fecha_aprobacion`
- AND the file MUST NOT contain a BOM marker