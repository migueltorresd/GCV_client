# IMPLEMENTATION_PLAN.md

## Propósito

Este documento define **qué se va a construir, en qué orden, con qué criterio técnico y con qué límites**.
Debe servir como plan de ejecución humano y también como guía operativa para cualquier IA que continúe el proyecto.

## Resultado esperado

Construir una solución de la **Pista B — Desarrollador Fullstack** que funcione de punta a punta para el módulo de **Novedades + Aprobación**, priorizando seguridad, trazabilidad, mantenibilidad y reproducibilidad dentro de una ventana de **16 horas efectivas**.

## Principios rectores

- **Primero lo riesgoso, después lo cosmético**.
- **La seguridad vive en backend**.
- **Las reglas de negocio viven fuera de los controllers**.
- **La solución debe ser explicable en entrevista**.
- **Menos complejidad, más claridad**.
- **MUST primero; SHOULD/COULD solo si sobra tiempo**.

## Decisiones de alto nivel

| Tema | Decisión |
|------|----------|
| Backend | NestJS |
| Frontend | React |
| Base de datos | PostgreSQL |
| Autenticación | JWT simulado con `sub`, `email`, `rol`, `filial_id` |
| Multi-tenant | Discriminador por fila usando `filial_id` |
| Arquitectura | Modular + hexagonal liviana por módulo |
| Calidad | Validación server-side, manejo de errores, pruebas automatizadas |
| Reproducibilidad | `docker-compose` mínimo para backend + base de datos |
| Documentación | README reproducible + contexto + decisiones técnicas |

## Estructura del proyecto

```text
/backend
/frontend
/AI_CONTEXT.md
/IMPLEMENTATION_PLAN.md
```

## Fases de ejecución

### Fase 1 — Base del proyecto

**Objetivo:** dejar el repositorio listo para desarrollar sin fricción.

#### Entregables
- Estructura `backend/` y `frontend/`.
- Configuración inicial del backend.
- Configuración inicial del frontend.
- `docker-compose` mínimo para entorno reproducible.
- Herramientas base de lint/formato si no agregan fricción excesiva.

#### Criterio de salida
- El proyecto arranca localmente.
- La estructura es clara.
- El equipo o una IA externa puede continuar sin reorganizar nada.

### Fase 2 — Persistencia y datos semilla

**Objetivo:** dejar listo el modelo mínimo para soportar auth, tenant y novedades.

#### Entregables
- Modelo de `filial`.
- Modelo de `usuario`.
- Modelo de `novedad`.
- Modelo de `auditoria`.
- Uso de PostgreSQL como base principal.
- Seed del Anexo B.

#### Criterio de salida
- Existen las dos filiales del enunciado.
- Existen los usuarios semilla requeridos.
- La solución puede autenticarlos o reconocerlos según la estrategia elegida.

### Fase 3 — Autenticación y contexto de seguridad

**Objetivo:** resolver la identidad simulada y establecer el contexto de seguridad que usará toda la aplicación.

#### Entregables
- Endpoint de login.
- Emisión de JWT.
- Guard de autenticación.
- Extracción de `rol` y `filial_id` desde token.

#### Criterio de salida
- Un usuario semilla puede autenticarse.
- El backend conoce quién es el usuario, qué rol tiene y a qué filial pertenece.

### Fase 4 — RBAC y aislamiento multi-tenant

**Objetivo:** resolver el riesgo técnico principal del reto.

#### Entregables
- Reglas por rol.
- Restricción de acceso por `filial_id`.
- Restricción adicional por `solicitante_id` para Colaborador.
- Scoping backend para queries de novedades.
- Restricción de consulta según rol y tenant.

#### Criterio de salida
- Un usuario no puede consultar datos de otra filial.
- Un Colaborador no puede consultar novedades de otro Colaborador de su misma filial.
- Las restricciones no dependen del frontend.
- El comportamiento es demostrable con pruebas.

### Fase 5 — Registro y listado de novedades

**Objetivo:** construir el núcleo del módulo.

#### Entregables
- Endpoint para crear novedad.
- Endpoint para listar novedades.
- Filtros por tipo, estado y rango de fechas.
- Validaciones server-side.
- DTOs de entrada y salida.

#### Criterio de salida
- Se pueden crear novedades válidas.
- Se rechazan payloads inválidos.
- El listado respeta rol, tenant y filtros.

### Fase 6 — Workflow de aprobación

**Objetivo:** implementar la lógica de estados controlados en backend.

#### Entregables
- Envío de novedad (`BORRADOR -> PENDIENTE`).
- Aprobación individual.
- Rechazo individual.
- Aprobación masiva.
- Regla de transición centralizada.

#### Criterio de salida
- Solo se permiten transiciones válidas.
- Las transiciones inválidas fallan con error claro.
- Supervisor puede actuar sobre novedades de su filial.

### Fase 7 — Auditoría

**Objetivo:** registrar trazabilidad operacional en acciones críticas.

#### Entregables
- Registro de crear, enviar, aprobar, rechazar y exportar.
- `AuditoriaService` centralizado invocado desde casos de uso o servicios de aplicación.
- Endpoint `GET /auditoria` filtrable.

#### Criterio de salida
- Cada acción clave genera rastro auditable.
- El registro incluye actor, acción, entidad, entidad_id, timestamp y filial_id.

### Fase 8 — Exportación

**Objetivo:** cumplir el desacoplamiento de salida pedido por el reto.

#### Entregables
- Endpoint de exportación por rango de fechas.
- CSV con separador `;`.
- UTF-8.
- Encabezado exacto del Anexo E.

#### Criterio de salida
- RR.HH. puede exportar novedades aprobadas de su filial.
- El archivo cumple el formato esperado.

### Fase 9 — Frontend mínimo funcional

**Objetivo:** cubrir la experiencia mínima solicitada sin distraerse en detalles cosméticos.

#### Entregables
- Pantalla de login.
- Formulario de creación de novedad.
- Listado con filtros.
- Bandeja de aprobación del supervisor.
- Selección múltiple para aprobación masiva.

#### Criterio de salida
- El flujo end-to-end puede demostrarse desde la interfaz.
- La UI es clara y usable, aunque visualmente simple.

### Fase 10 — Pruebas automatizadas

**Objetivo:** demostrar calidad sobre reglas críticas.

#### Pruebas mínimas obligatorias
1. Lógica de transición de estados.
2. Regla de RBAC / aislamiento multi-tenant.

#### Pruebas deseables si queda tiempo
- Restricción de Colaborador sobre novedades de otro usuario de su misma filial.
- Aprobación masiva.
- Validación de fechas.
- Exportación.
- Restricciones por rol.

#### Criterio de salida
- Existen al menos dos pruebas de alto valor.
- Las pruebas prueban comportamiento, no implementación interna innecesaria.

### Fase 11 — Documentación final

**Objetivo:** dejar una entrega defendible y reproducible.

#### Entregables
- `README.md`.
- Supuestos asumidos.
- Alcance cubierto vs. no cubierto.
- MoSCoW.
- Tiempo invertido por componente.
- Decisiones técnicas resumidas.

#### Criterio de salida
- Cualquier evaluador puede correr el proyecto sin fricción fuerte.
- Se entiende qué se hizo, qué no y por qué.

## Reglas de calidad

### Backend
- No colocar lógica de negocio en controllers.
- Mantener reglas de dominio o aplicación fuera de la capa HTTP.
- Usar DTOs para validar y controlar entrada/salida.
- Evitar fugas de datos sensibles.
- Centralizar las reglas de autorización y scoping.

### Frontend
- Componentes enfocados.
- Estado manejado con simplicidad.
- No duplicar lógica de negocio crítica del backend.
- Priorizar claridad y navegación del flujo.

### Código en general
- Nombres claros.
- Funciones cortas.
- Responsabilidad única.
- Poca magia.
- Bajo acoplamiento.
- Sin patrones innecesarios.

## Riesgos principales y mitigación

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Perder tiempo en arquitectura excesiva | Alto | Usar hexagonal liviana y aplicar YAGNI |
| Dejar seguridad solo en frontend | Crítico | Resolver RBAC y tenant scope en backend desde el inicio |
| Implementar RBAC incompleto dentro de la misma filial | Alto | Diferenciar explícitamente visibilidad de Colaborador vs Supervisor/RRHH y cubrirlo con pruebas |
| Querer cubrir SHOULD antes del núcleo MUST | Alto | Cerrar primero auth, tenant, workflow, auditoría y exportación |
| Exportación mal formateada | Medio | Implementar con encabezado exacto del Anexo E y validarlo manualmente |
| Tests débiles o irrelevantes | Alto | Probar reglas de negocio críticas, no solo caminos felices superficiales |

## Qué NO hacer

- No implementar offline antes de cerrar MUST.
- No dedicar tiempo excesivo a UI visual.
- No agregar microservicios, event buses complejos ni abstracciones enterprise innecesarias.
- No esconder reglas críticas en helpers imposibles de entender.
- No romper la división entre backend y frontend.

## Checklist operativo

- [ ] Crear backend y frontend.
- [ ] Definir modelo de datos mínimo.
- [ ] Implementar seed del Anexo B.
- [ ] Implementar login con JWT simulado.
- [ ] Aplicar RBAC y tenant scope en backend.
- [ ] Aplicar restricción de Colaborador sobre sus propias novedades.
- [ ] Crear y listar novedades con filtros.
- [ ] Implementar workflow y aprobación masiva.
- [ ] Registrar auditoría con servicio centralizado.
- [ ] Generar exportación CSV conforme al Anexo E.
- [ ] Construir frontend mínimo funcional.
- [ ] Agregar pruebas obligatorias.
- [ ] Redactar README final.

## Instrucción final para cualquier IA o colaborador

Si tenés que elegir entre “hacer más cosas” o “hacer bien el núcleo”, elegí siempre **hacer bien el núcleo**.

El evaluador va a valorar más:

- seguridad real,
- reglas bien implementadas,
- pruebas útiles,
- código claro,
- documentación honesta,

que una solución inflada con features incompletas.
