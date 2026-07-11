# Alcance del producto

## 1. Propósito

**Dental Practice Manager** es un sistema de gestión para una odontóloga independiente que permite organizar pacientes, citas y recordatorios automáticos desde un solo lugar.

El objetivo de la primera versión es reducir el desorden operativo del consultorio y facilitar el seguimiento diario de la agenda.

## 2. Problema a resolver

La gestión manual de pacientes y citas puede ocasionar:

- Horarios desorganizados o cruces de citas.
- Dificultad para encontrar información básica de un paciente.
- Olvido de citas por parte de los pacientes.
- Falta de visibilidad sobre los horarios disponibles del día.

## 3. Usuario objetivo

### Usuario principal: odontóloga

La odontóloga administra directamente sus pacientes y su agenda.

Debe poder:

- Registrar y consultar pacientes.
- Agendar, reprogramar y cancelar citas.
- Consultar sus horarios disponibles y ocupados.
- Confiar en que el sistema gestionará recordatorios de citas.

### Usuario futuro: recepcionista

En una versión futura, el sistema podrá incorporar una recepcionista para apoyar la administración de pacientes y citas.

Este rol no forma parte de la primera versión, pero se tendrá en cuenta al tomar decisiones de estructura, permisos y datos.

## 4. Producto mínimo viable (MVP)

La primera versión del sistema incluirá las siguientes funciones indispensables:

| Función | Descripción |
|---|---|
| Gestión de pacientes | Crear, editar, buscar y consultar información básica de pacientes. |
| Gestión de citas | Crear, reprogramar, cancelar y marcar el estado de una cita. |
| Agenda | Visualizar citas y horarios disponibles u ocupados. |
| Recordatorios automáticos | Enviar recordatorios de cita mediante un canal que será definido posteriormente. |
| Preparación para crecimiento | Mantener una estructura que permita añadir una recepcionista sin rehacer el sistema. |

## 5. Flujo principal

El flujo principal esperado para la odontóloga es:

1. Registrar un paciente nuevo o buscar uno existente.
2. Consultar la disponibilidad en la agenda.
3. Crear una cita indicando fecha, hora y datos necesarios.
4. El sistema programa el recordatorio automático.
5. La odontóloga consulta, reprograma, cancela o marca la cita según su resultado.

## 6. Decisiones ya tomadas

| Decisión | Estado |
|---|---|
| Usuario inicial | La odontóloga gestiona el sistema sola. |
| Crecimiento futuro | Se contempla el rol de recepcionista. |
| Recordatorios | Deben ser automáticos. |
| Repositorio | Público, sin datos reales de pacientes. |
| Expediente clínico | Se investigará antes de definir o implementar. |

## 7. Decisiones pendientes

Estas decisiones deben investigarse o validarse antes de construirlas:

- Canal de los recordatorios automáticos: WhatsApp, correo electrónico, SMS u otro.
- Momento de envío de los recordatorios.
- Información mínima necesaria para registrar un paciente.
- Estados que puede tener una cita.
- Requisitos legales, clínicos y operativos del expediente de cada paciente.
- Requisitos de privacidad, seguridad y conservación de información.

> [!IMPORTANT]
> El expediente clínico no se desarrollará hasta definir qué información debe contener y qué requisitos de privacidad o normativos aplican.

## 8. Fuera de alcance de la primera versión

Las siguientes funciones son valiosas, pero no se construirán inicialmente:

- Portal o aplicación para pacientes.
- Pagos, facturación y presupuestos.
- Inventario de materiales.
- Múltiples odontólogos o consultorios.
- Reportes, métricas y analítica avanzada.
- Expediente clínico completo.
- Carga de documentos clínicos.
- Firma digital y recetas electrónicas.
- Inteligencia artificial para diagnóstico o recomendaciones.

## 9. Criterios de éxito del MVP

La primera versión se considerará útil cuando la odontóloga pueda:

- Registrar y localizar un paciente sin depender de notas externas.
- Organizar su agenda sin crear horarios cruzados.
- Reprogramar o cancelar una cita con facilidad.
- Identificar los horarios disponibles del día.
- Enviar recordatorios automáticos de las citas programadas.

## 10. Principio de alcance

Toda nueva funcionalidad debe responder a esta pregunta:

> ¿Es indispensable para que una odontóloga independiente pueda registrar pacientes, organizar citas y enviar recordatorios automáticos?

Si la respuesta es no, la funcionalidad se registra como una mejora futura y no se agrega al MVP.
