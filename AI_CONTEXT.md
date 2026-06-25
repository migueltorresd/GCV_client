# AI_CONTEXT.md

## Objetivo del proyecto

Este repositorio resuelve la **Pista B — Desarrollador Fullstack** del reto técnico de Grupo Corporativo Vértice (GCV), con una ejecución orientada a demostrar criterio de **futuro líder técnico** sin salir del alcance solicitado.

La meta no es construir una plataforma completa, sino entregar una solución **funcional, priorizada, segura, mantenible y bien documentada** dentro de un límite de tiempo de **16 horas efectivas**.

La solución debe cubrir el flujo vertical de **Novedades + Aprobación**, cumpliendo los requisitos MUST del enunciado y dejando evidencia clara de:

- buena arquitectura,
- separación de responsabilidades,
- reglas críticas resueltas en backend,
- calidad de código,
- pruebas automatizadas valiosas,
- documentación reproducible.

## Alcance que se debe resolver

Se implementará la **Pista B Fullstack** con foco en los requisitos MUST:

1. **Autenticación simulada**
   - Login basado en usuarios semilla.
   - Emisión/consumo de JWT con:
     - `sub`
     - `email`
     - `rol`
     - `filial_id`

2. **RBAC**
   - **Colaborador**: crea novedades y consulta solo las suyas.
   - **Supervisor**: consulta y aprueba/rechaza novedades de colaboradores de su filial; soporta aprobación masiva.
   - **RR.HH.**: consulta todas las novedades de su filial y ejecuta la exportación.

3. **Aislamiento multi-tenant**
   - Ningún usuario puede ver datos de una filial distinta a la suya.
   - Esta regla debe aplicarse en el **backend**, no solo en la UI.

4. **Registro de novedad**
   - Tipo.
   - Fechas de inicio y fin.
   - Descripción.
   - Adjunto opcional (solo si el tiempo alcanza; no prioritario).

5. **Workflow de estados**
   - `BORRADOR -> PENDIENTE -> APROBADA | RECHAZADA`.
   - Las transiciones inválidas deben rechazarse en backend.
   - Debe existir aprobación individual y masiva.

6. **Log de auditoría**
   - Registrar:
     - actor,
     - accion,
     - entidad,
     - entidad_id,
     - timestamp,
     - filial_id.
   - Debe existir endpoint consultable y filtrable.

7. **Exportación**
   - Exportar novedades aprobadas por filial y rango de fechas.
   - Formato esperado:
     - CSV,
     - separador `;`,
     - codificación UTF-8,
     - encabezado exacto del Anexo E.

8. **Frontend React**
   - Login.
   - Formulario de registro de novedad.
   - Listado con filtros.
   - Bandeja de aprobación del supervisor con selección múltiple.

9. **Pruebas automatizadas**
   - Mínimo:
     - prueba unitaria de transición de estados,
     - prueba unitaria de RBAC / aislamiento multi-tenant.

## Enfoque técnico general

La solución debe verse como un desarrollo **fullstack bien diseñado**, pero **sin sobreingeniería**.

Se prioriza:

- claridad,
- mantenibilidad,
- testabilidad,
- seguridad,
- velocidad de entrega con criterio.

Se deben aplicar estos principios:

- **SOLID**,
- **Clean Code**,
- **KISS**,
- **YAGNI**,
- separación de responsabilidades,
- diseño pragmático orientado al reto.

Importante:

- no crear abstracciones vacías,
- no agregar capas innecesarias,
- no modelar más complejidad de la que el reto pide,
- no sacrificar entrega por “verse enterprise”.

## Stack y decisiones base

### Backend

- **NestJS**.
- Arquitectura modular.
- Enfoque de **hexagonal liviana por módulo**.
- Validación server-side.
- JWT simulado.
- Base de datos simple y reproducible.

### Frontend

- **React**.
- Interfaz funcional y limpia.
- Prioridad en usabilidad y flujo requerido, no en estética avanzada.

### Base de datos y reproducibilidad

- Se utilizará **PostgreSQL**.
- La reproducibilidad del entorno se resolverá con un **`docker-compose` mínimo**.
- Esta decisión se toma porque:
  - el Anexo A está planteado sobre PostgreSQL,
  - permite modelar mejor el detalle de auditoría,
  - acerca la solución a un escenario más realista de producción,
  - transmite una decisión técnica más sólida para el evaluador.
- `docker-compose` deja de considerarse opcional y pasa a ser parte del mecanismo oficial de ejecución reproducible.

## Estructura esperada del repositorio

El proyecto debe estar dividido claramente entre backend y frontend:

```text
/backend
/frontend
/docs   (opcional, si ayuda a organización)
```

### Backend

Estructura sugerida:

```text
backend/src/modules/auth
backend/src/modules/users
backend/src/modules/novedades
backend/src/modules/auditoria
backend/src/modules/exportacion
```

Dentro de los módulos importantes, usar una organización pragmática inspirada en hexagonal:

```text
domain
application
infrastructure
presentation
```

### Significado de capas

- **domain**
  - entidades,
  - enums,
  - reglas puras de negocio,
  - políticas de transición.

- **application**
  - casos de uso,
  - orquestación de reglas,
  - coordinación entre repositorios y servicios.

- **infrastructure**
  - persistencia,
  - implementaciones de repositorios,
  - acceso a base de datos,
  - adaptadores técnicos.

- **presentation**
  - controllers,
  - DTOs,
  - guards,
  - serializers,
  - manejo HTTP.

### Frontend

Estructura simple y mantenible, priorizando legibilidad:

```text
frontend/src/features/auth
frontend/src/features/novedades
frontend/src/features/aprobaciones
frontend/src/features/auditoria (si aplica)
frontend/src/shared
```

## Decisiones arquitectónicas clave

### 1. Backend primero

El backend resuelve los riesgos críticos del reto:

- RBAC,
- multi-tenant,
- workflow,
- auditoría,
- validaciones.

La UI no debe contener reglas de seguridad que solo existan ahí.

### 2. Multi-tenant por discriminador de fila

Se utilizará `filial_id` como criterio de aislamiento de datos.

Esto implica:

- toda consulta relevante debe estar scopiada por `filial_id`,
- el usuario autenticado aporta el contexto de tenant desde el token,
- la UI puede filtrar, pero la seguridad real vive en backend.

Además del aislamiento por filial, el RBAC debe aplicar una segunda restricción según rol:

- **Colaborador**: solo puede consultar sus propias novedades (`solicitante_id = usuario autenticado`).
- **Supervisor**: puede consultar novedades de su filial.
- **RR.HH.**: puede consultar novedades de su filial.

Esto significa que el aislamiento no se resuelve únicamente con `filial_id`; para Colaborador también debe aplicarse la restricción por propietario.

### 3. JWT simulado

La identidad se simulará mediante login controlado y emisión de un token JWT con claims mínimos necesarios:

- `sub`,
- `email`,
- `rol`,
- `filial_id`.

No se almacenarán contraseñas en texto plano.

### 4. Workflow controlado en servidor

Las transiciones de estado no dependen del frontend.
El backend debe rechazar explícitamente transiciones inválidas.

### 5. Auditoría transversal

La auditoría debe implementarse de forma centralizada, evitando llamadas repetidas dispersas por todo el código.
Para este reto se prioriza un enfoque **pragmático y defendible**:

- usar un `AuditoriaService.registrar(...)`,
- invocado desde los casos de uso o servicios de aplicación relevantes,
- evitando lógica de auditoría en controllers,
- evitando también interceptores demasiado genéricos que obliguen a inferir `entity_id` o `detalle` de forma frágil.

La intención es centralizar el registro de acciones críticas sin introducir complejidad innecesaria.

### 6. DTOs y salida segura

No se deben exponer datos sensibles o innecesarios.
Toda salida debe pasar por DTOs o serializers que controlen lo que se entrega al cliente.

## Orden de ataque

Seguir estrictamente este orden, salvo que exista una razón fuerte para ajustarlo:

1. **Bootstrap del proyecto**
   - Crear backend y frontend.
   - Configurar estructura.
   - Preparar entorno reproducible.

2. **Persistencia y seed**
   - Modelar entidades base.
   - Cargar filiales y usuarios del Anexo B.
   - Definir estrategia de contraseñas o login simulado.

3. **Autenticación**
   - Login.
   - JWT.
   - Guard autenticado.
   - Extracción de `rol` y `filial_id`.

4. **RBAC + aislamiento multi-tenant**
   - Reglas por rol.
   - Queries scopiadas en backend.
   - Restricción adicional por `solicitante_id` para Colaborador.
   - Asegurar que no se filtren datos entre filiales.

5. **Módulo de novedades**
   - Crear novedad.
   - Listar novedades.
   - Filtros.
   - Visibilidad según rol.

6. **Workflow**
   - Enviar.
   - Aprobar.
   - Rechazar.
   - Aprobar masivo.
   - Validación de transiciones.

7. **Auditoría**
   - Registrar crear, enviar, aprobar, rechazar y exportar.
   - Endpoint `GET /auditoria` con filtros.

8. **Exportación**
   - Generar CSV del Anexo E.
   - Garantizar formato exacto.

9. **Frontend**
   - Login.
   - Formulario.
   - Listado.
   - Filtros.
   - Bandeja del supervisor.

10. **Pruebas**
    - Transición de estados.
    - Aislamiento multi-tenant / RBAC.
    - Restricción de Colaborador sobre sus propias novedades.
    - Agregar alguna extra si el tiempo alcanza.

11. **README final**
    - Instalación.
    - Ejecución.
    - Decisiones.
    - Supuestos.
    - Alcance cubierto / no cubierto.
    - Tiempo invertido.

## Criterios de implementación

### Obligatorio

- backend y frontend separados,
- validaciones server-side,
- manejo de errores sin exponer trazas internas,
- roles y tenant resueltos en backend,
- código legible,
- nombres claros,
- funciones pequeñas con responsabilidad definida,
- DTOs para entrada y salida,
- pruebas mínimas del reto,
- README reproducible.

### Evitar

- lógica de negocio dentro de controllers,
- reglas críticas escondidas solo en frontend,
- duplicación innecesaria,
- acoplamiento excesivo,
- sobreabstracción,
- patrones metidos “porque sí”,
- features SHOULD/COULD antes de terminar MUST.

## Estrategia de pruebas

El reto exige como mínimo pruebas automatizadas sobre reglas críticas de negocio.

### Mínimo obligatorio

1. **Prueba unitaria de workflow**
   - Validar transiciones permitidas.
   - Rechazar transiciones inválidas.

2. **Prueba unitaria o de integración acotada de RBAC / multi-tenant**
   - Demostrar que un usuario de filial A no puede listar datos de filial B.
   - Demostrar que la restricción existe en backend.

3. **Prueba recomendada de RBAC intra-filial**
   - Demostrar que un Colaborador no puede listar novedades de otro Colaborador de su misma filial.
   - Validar que la lógica de visibilidad no depende solo de `filial_id`, sino también del rol y del propietario de la novedad.

### Si alcanza el tiempo

Agregar:

- prueba de aprobación masiva,
- prueba de exportación,
- prueba de validación de fechas,
- prueba de permisos por rol.

### Interpretación recomendada

Aunque el enunciado menciona “pruebas unitarias” para los dos mínimos, la prueba de aislamiento multi-tenant puede resolverse mejor como una prueba de integración pequeña si eso demuestra más claramente el comportamiento del backend.
Si se hace así, debe seguir siendo simple, valiosa y reproducible.

## Qué se deja fuera si falta tiempo

Los siguientes puntos son deseables, pero no prioritarios frente al alcance MUST:

- operación offline / PWA,
- notificaciones,
- adjuntos reales,
- almacenamiento real de archivos,
- mejoras cosméticas avanzadas de UI.

Si alguno no se implementa, debe documentarse claramente en el README bajo criterio **MoSCoW**.

## Señales de liderazgo técnico que sí se quieren mostrar

Aunque esta es la pista Fullstack, la implementación debe dejar señales sanas de criterio técnico:

- decisiones justificadas,
- prioridad al riesgo técnico real,
- seguridad resuelta en backend,
- modularidad clara,
- decisiones de infraestructura coherentes con producción,
- documentación de supuestos,
- explicación de trade-offs,
- README útil para evaluadores,
- mini decisiones técnicas o ADRs breves si aportan claridad.

## Instrucciones para cualquier IA que continúe este proyecto

Antes de proponer cambios o escribir código:

1. Leer este archivo completo.
2. Respetar el alcance de la **Pista B**.
3. No mezclar objetivos de la pista de Líder Técnico salvo como apoyo documental liviano.
4. Mantener separación entre `backend` y `frontend`.
5. Priorizar MUST antes que SHOULD o COULD.
6. No mover reglas críticas al frontend.
7. Mantener la seguridad y el aislamiento multi-tenant en backend.
8. Aplicar SOLID, Clean Code, KISS y YAGNI con pragmatismo.
9. No agregar complejidad arquitectónica innecesaria.
10. Toda decisión técnica importante debe quedar documentada.

## Definition of Done

El proyecto se considera listo cuando, como mínimo, cumple lo siguiente:

- login funcional con JWT simulado,
- PostgreSQL ejecutándose vía `docker-compose`,
- usuarios semilla cargados,
- creación de novedades,
- listado de novedades con filtros,
- RBAC correcto,
- aislamiento multi-tenant aplicado en backend,
- restricción de Colaborador aplicada sobre sus propias novedades,
- workflow de estados funcionando,
- aprobación individual y masiva,
- auditoría registrando acciones clave,
- exportación CSV conforme al Anexo E,
- frontend mínimo funcional,
- dos pruebas automatizadas mínimas,
- README reproducible,
- documentación clara de alcance, supuestos y decisiones.

## Regla final de prioridad

Si hay conflicto entre cantidad de features y calidad del núcleo, siempre priorizar:

1. seguridad backend,
2. multi-tenant,
3. workflow correcto,
4. pruebas valiosas,
5. reproducibilidad,
6. documentación clara.

La solución debe verse como un producto **bien priorizado**, no como un demo inflado e inestable.
