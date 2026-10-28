# Ventas Abastos — Documentación del proyecto

App web (PWA) para registrar las ventas de chile que hace el tío desde el andén en la Central de Abastos de la CDMX. Sustituye los vales escritos a mano y la hoja de Excel con la que se liquida cada viaje a los jefes.

> Estado al 28 de octubre de 2026: funciones base terminadas, soporte sin conexión (niveles 1 y 2) terminado, login terminado y probado. **Aún no hay deploy.**

---

## Índice

1. [Qué hace la app](#1-qué-hace-la-app)
2. [Glosario del negocio](#2-glosario-del-negocio)
3. [Stack y arquitectura](#3-stack-y-arquitectura)
4. [Estructura del repositorio](#4-estructura-del-repositorio)
5. [Modelo de datos](#5-modelo-de-datos)
6. [API (backend)](#6-api-backend)
7. [Reglas de negocio](#7-reglas-de-negocio)
8. [Frontend: pantallas y navegación](#8-frontend-pantallas-y-navegación)
9. [Autenticación](#9-autenticación)
10. [Funcionamiento sin conexión (PWA)](#10-funcionamiento-sin-conexión-pwa)
11. [Cómo clonar y levantar el proyecto](#11-cómo-clonar-y-levantar-el-proyecto)
12. [Scripts disponibles](#12-scripts-disponibles)
13. [Pruebas manuales](#13-pruebas-manuales)
14. [Problemas conocidos y soluciones](#14-problemas-conocidos-y-soluciones)
15. [Pendientes y siguientes pasos](#15-pendientes-y-siguientes-pasos)

---

## 1. Qué hace la app

- **Registrar trailers** que llegan al andén, con su manifiesto (producto, color, tamaño y número de cajas) y sus gastos (piso, flete, descarga y porcentaje de comisión).
- **Vender**: generar vales (tickets) para un cliente con una o varias líneas, validando en tiempo real que haya cajas disponibles.
- **Consultar y cancelar vales** del día. Un vale cancelado no se borra: queda marcado y sus cajas regresan al inventario.
- **Cerrar y reabrir trailers**. Los cerrados se consultan en una pestaña aparte con buscador y paginación.
- **Resumen del día**: vales, cajas, ventas, gastos de andén y ganancia, además de lo vendido por cada trailer.
- **Liquidación por trailer**: el equivalente a la hoja de Excel del tío (ventas por producto y tamaño, gastos y balance), imprimible o guardable como PDF desde el iPhone.
- **Funciona con mala señal**: la app abre sin red y muestra los últimos datos consultados. Para guardar sí se necesita conexión.
- **Login** de un solo usuario. El usuario se crea por comando y no hay pantalla de registro.

El tío usa un **iPhone y un iPad**, un dispositivo a la vez, con datos móviles. Por eso es una app web instalable (PWA) y no una app nativa, lo que también evita la licencia anual de desarrollador de Apple.

---

## 2. Glosario del negocio

| Término | Significado |
|---|---|
| **Vale** | Ticket de venta. Su `id` es el folio consecutivo. |
| **Andén** | Lugar de descarga y venta en la Central de Abastos. |
| **Trailer** | Camión que llega con mercancía de un invernadero. |
| **Viaje** | Identificador de una entrega en particular (ej. `HORTIFRESH-01`). Lo asignan el tío o sus jefes y se captura a mano, nunca se genera solo. Es lo que encabeza la liquidación. |
| **Número de trailer** | Identifica al camión. El mismo camión puede hacer muchos viajes. |
| **Manifiesto** | Lista de lo que trae el trailer: producto, color, tamaño y cajas. |
| **Piso** | Nombre que tiene en el Excel el **costo de andén**. |
| **Comisión** | Lo que cobra el tío sobre las ventas, normalmente el 10 %. |
| **Balance** | Venta menos gastos (flete + piso + descarga + comisión). Es lo que se liquida al dueño de la mercancía. |
| **Liquidación** | Resumen de un viaje/trailer que el tío manda a sus jefes. |

---

## 3. Stack y arquitectura

Todo el proyecto está en **TypeScript**, en un monorepo con **npm workspaces**.

| Paquete | Tecnología | Rol |
|---|---|---|
| `shared` (`@abastos/shared`) | TypeScript + Zod 4 | Esquemas de validación, tipos DTO, catálogos y utilidades que usan back y front. Zod está configurado en español. |
| `backend` | Node 24 + Express 5 + Prisma 7 + PostgreSQL | API REST bajo `/api`. |
| `frontend` | Angular 22 (zoneless, signals, Signal Forms, `httpResource`) + `@angular/service-worker` | PWA para iPhone/iPad. |

Decisiones clave:

- **Importes como `Decimal(12,2)`** en la base. Los subtotales y totales siempre los calcula el backend con el `Decimal` de Prisma. El frontend nunca es la fuente de verdad para el dinero.
- **Rutas relativas `/api/...`** en todo el frontend. En desarrollo, el proxy de Angular (`proxy.conf.json`) las manda a `http://localhost:3000`. En producción, Express servirá el build de Angular en el mismo origen, así que no habrá CORS y la cookie de sesión será *first-party*.
- **Prisma 7**: la URL de conexión vive en `backend/prisma.config.ts` (no en `schema.prisma`), el cliente se genera en `backend/src/generated/prisma` (ignorado en git) y se conecta con el adaptador `@prisma/adapter-pg`.
- **Express 5** manda solo al `errorHandler` los errores de funciones `async`, incluidos los `ZodError` de `.parse()`.
- **Fechas**: el "día" se calcula en horario de la CDMX con `hoyCdmx()` (`frontend/src/app/core/fechas.ts`).

---

## 4. Estructura del repositorio

Resumen de las piezas principales. Puede haber archivos auxiliares que no aparecen aquí.

```text
abastos-ventas/
├── package.json              # raíz: workspaces y scripts generales
├── .gitignore                # node_modules, dist, .env, backend/src/generated, .angular
├── .editorconfig
├── shared/
│   ├── package.json          # @abastos/shared
│   └── src/
│       ├── index.ts          # reexporta todo
│       ├── dinero.ts         # importe (máx. 2 decimales) y cajas (entero positivo)
│       ├── comun.ts          # utilidades comunes (ej. idParamSchema)
│       ├── catalogos.ts      # catálogo de productos (Morrón, etc.)
│       ├── trailer.ts        # esquemas y DTOs de trailers y cerrados
│       ├── ticket.ts         # esquemas y DTOs de vales, formatearFolio
│       ├── resumen.ts        # DTOs de resumen del día y liquidación
│       └── auth.ts           # loginSchema, LoginInput, SesionUsuario
├── backend/
│   ├── package.json
│   ├── tsconfig.json         # incluye "noImplicitReturns": true
│   ├── prisma.config.ts
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/       # se versionan en git
│   ├── requests/             # archivos .http para REST Client
│   │   ├── trailers.http
│   │   └── tickets.http
│   └── src/
│       ├── server.ts         # app.listen(PORT)
│       ├── app.ts            # middlewares y registro de rutas
│       ├── config/env.ts     # validación de variables de entorno con Zod
│       ├── lib/
│       │   ├── prisma.ts     # PrismaClient con adaptador pg
│       │   └── dinero.ts     # helpers de Decimal
│       ├── middlewares/
│       │   ├── error-handler.ts   # AppError + manejo de ZodError
│       │   └── requiere-sesion.ts # protege /api
│       ├── modules/
│       │   ├── health/       # GET /api/health
│       │   ├── auth/         # sesiones.ts, auth.routes.ts
│       │   ├── trailers/     # trailers.service.ts, trailers.routes.ts
│       │   ├── tickets/      # tickets.service.ts, tickets.routes.ts
│       │   └── resumen/      # resumen.service.ts, resumen.routes.ts
│       └── scripts/
│           └── crear-usuario.ts
└── frontend/
    ├── package.json
    ├── angular.json          # serve usa proxy.conf.json
    ├── proxy.conf.json       # /api → http://localhost:3000
    ├── ngsw-config.json      # assetGroups + dataGroups (caché de /api/**)
    └── src/
        ├── index.html        # meta tags de iOS para la PWA
        ├── manifest.webmanifest
        ├── styles.scss       # variables (:root) y clases globales (.boton, .campo…)
        └── app/
            ├── app.ts / app.html / app.scss   # shell: barra superior, estado PWA, nav inferior
            ├── app.config.ts
            ├── app.routes.ts
            ├── core/
            │   ├── auth/      # auth.service, auth.guards, auth.interceptor
            │   ├── pwa/       # conexion, actualizaciones, precarga, sin-conexion.interceptor,
            │   │              # barra-estado-pwa, datos-guardados, aviso-conexion-guardar
            │   ├── errores.ts # mensajeDeError, mensajeDeErrorAlGuardar
            │   ├── fechas.ts  # hoyCdmx, sumarDias
            │   ├── catalogos.ts      # colorDeChile, nombres para mostrar
            │   ├── selector-dia.ts   # flechas día anterior/siguiente + fecha
            │   ├── error-campo.ts
            │   └── esquema-borrador.ts
            ├── login/          # login-page
            ├── ajustes/        # ajustes-page (cerrar sesión)
            ├── trailers/
            │   ├── lista/      # trailers-page (Activos / Cerrados)
            │   ├── cerrados/   # trailers-cerrados (buscador + Ver más)
            │   └── nuevo/      # nuevo-trailer-page
            ├── vales/
            │   ├── nuevo/      # nuevo-vale-page (Vender)
            │   └── lista/      # vales-page
            └── resumen/
                ├── dia/        # resumen-dia-page
                ├── liquidacion/# liquidacion-page
                └── resumen.api.ts
```

---

## 5. Modelo de datos

Base PostgreSQL gestionada con Prisma. Las columnas en la base usan `snake_case` (`@map`) y las tablas, plural (`@@map`).

### Enums

- `EstadoTrailer`: `ACTIVO`, `CERRADO`
- `EstadoTicket`: `VIGENTE`, `CANCELADO`

### `Trailer` → tabla `trailers`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | Int | autoincremental |
| `viaje` | String? | Nombre del viaje (ej. `HORTIFRESH-01`). Es opcional en la base solo por los trailers previos al campo; el formulario lo exige. |
| `placa`, `numero`, `invernadero`, `chofer`, `anden` | String | |
| `costoAnden` | Decimal(12,2) | "Piso" en el Excel |
| `flete` | Decimal(12,2) | default 0 |
| `descarga` | Decimal(12,2) | default 0 |
| `comisionPorcentaje` | Decimal(5,2) | default 10 (10 = 10 %) |
| `fechaLlegada` | DateTime | default now |
| `fechaCierre` | DateTime? | se llena al cerrar y se borra al reabrir |
| `estado` | EstadoTrailer | default `ACTIVO` |
| `createdAt`, `updatedAt` | DateTime | |

Índices: `fechaLlegada` y `(estado, fechaCierre)`.

### `ManifiestoDetalle` → tabla `manifiesto_detalle`

Cada producto/tamaño que trae un trailer: `trailerId`, `producto`, `color?`, `tamano`, `cajas`. Las ventas apuntan aquí, así se sabe de qué trailer salió cada caja y cuántas quedan. Se borra en cascada con su trailer.

### `Ticket` (vale) → tabla `tickets`

`id` (folio consecutivo), `fecha`, `clienteNombre`, `total` Decimal(12,2), `estado` (default `VIGENTE`), `createdAt`. Por ahora no hay tabla de clientes: el nombre se guarda como texto.

### `TicketDetalle` → tabla `ticket_detalle`

`ticketId`, `manifiestoDetalleId`, `cajas`, `precioCaja`, `subtotal`. La relación con el manifiesto es `Restrict`: no se puede borrar una línea del manifiesto que tenga ventas.

### `Usuario` → tabla `usuarios`

`id`, `usuario` (único, en minúsculas), `hashContrasena` (argon2), `creadoEn`.

### `Sesion` → tabla `sesiones`

`id`, `tokenHash` (único, SHA-256 del token), `usuarioId` (cascada), `expiraEn`, `creadoEn`.

### Migraciones aplicadas (por nombre)

1. `inicial`: trailers, manifiesto, tickets y detalle.
2. Gastos de la liquidación: `flete`, `descarga` y `comisionPorcentaje`.
3. `viaje_y_cierre`: `viaje` y `fechaCierre`. Se creó con `--create-only` y se le agregó a mano un `UPDATE` para que los trailers ya cerrados tomaran `updated_at` como fecha de cierre.
4. `autenticacion`: `usuarios` y `sesiones`.

> Verifica los nombres exactos en `backend/prisma/migrations/`. Las migraciones van en el repo; nunca se editan después de aplicadas.

---

## 6. API (backend)

Todas las respuestas de error tienen la forma `{ mensaje, errores? }`:

- `400`: datos inválidos (Zod), con el detalle por campo en `errores`.
- `401`: sin sesión o sesión vencida.
- `404` / `409`: errores de negocio lanzados con `AppError` (ej. no hay cajas suficientes → 409).
- `500`: error interno (se registra en consola).

### Orden de middlewares en `app.ts`

```text
trust proxy (1) → cors → express.json → cookieParser
/api/health   (público)
/api/auth     (público, salvo /yo)
/api          → requiereSesion   ← todo lo de abajo exige sesión
/api/trailers, /api/tickets, /api/resumen
errorHandler
```

### Salud

| Método y ruta | Qué hace |
|---|---|
| `GET /api/health` | Hace `SELECT 1` y responde `{ estado: 'ok', baseDeDatos: 'conectada' }` |

### Autenticación

| Método y ruta | Qué hace |
|---|---|
| `POST /api/auth/login` | Recibe `{ usuario, contrasena }`, crea la sesión y manda la cookie. Límite: 10 intentos fallidos por IP cada 15 min. |
| `POST /api/auth/logout` | Borra la sesión y la cookie (204). |
| `GET /api/auth/yo` | Devuelve `{ usuario }` si hay sesión válida. |

### Trailers

| Método y ruta | Qué hace |
|---|---|
| `POST /api/trailers` | Crea el trailer con su manifiesto en una sola transacción. |
| `GET /api/trailers?estado=ACTIVO` | Lista trailers con cajas vendidas y disponibles por línea, más totales. |
| `GET /api/trailers/cerrados?q=&desde=` | Cerrados, del cierre más reciente al más antiguo, 20 por página. `q` busca en viaje, número, invernadero o placa (sin distinguir mayúsculas). Responde `{ trailers, siguiente }`, donde `siguiente` es el valor de `desde` para la siguiente página o `null`. Esta ruta va **antes** de `/:id`. |
| `GET /api/trailers/:id` | Detalle de un trailer (solo se usa en los `.http`). |
| `PATCH /api/trailers/:id` | Corrige datos generales (andén, costo, chofer…). |
| `POST /api/trailers/:id/cerrar` | Cierra y guarda `fechaCierre`. |
| `POST /api/trailers/:id/reabrir` | Reabre y borra `fechaCierre`. |
| `POST /api/trailers/:id/manifiesto` | Agrega una línea al manifiesto. |
| `PATCH /api/trailers/:id/manifiesto/:lineaId` | Corrige una línea. No deja bajar las cajas por debajo de lo vendido. |
| `DELETE /api/trailers/:id/manifiesto/:lineaId` | Elimina una línea solo si no tiene ventas. |

### Tickets (vales)

| Método y ruta | Qué hace |
|---|---|
| `POST /api/tickets` | Crea un vale: `{ clienteNombre, lineas: [{ manifiestoDetalleId, cajas, precioCaja }] }`. |
| `GET /api/tickets?fecha=AAAA-MM-DD&estado=VIGENTE` | Vales de un día (por defecto hoy). `estado` es opcional. |
| `GET /api/tickets/:id` | Un vale por su folio. |
| `POST /api/tickets/:id/cancelar` | Marca el vale como cancelado. Sus cajas vuelven a quedar disponibles. |

### Resumen

| Método y ruta | Qué hace |
|---|---|
| `GET /api/resumen/dia?fecha=AAAA-MM-DD` | Vales, cajas vendidas, ventas, gastos de andén y ganancia del día, más lo vendido por trailer. Sin fecha usa hoy. |
| `GET /api/resumen/trailers/:id` | Liquidación del trailer (equivalente a la hoja de Excel). |

---

## 7. Reglas de negocio

**Ventas**

- Antes de guardar un vale se valida que cada línea del manifiesto exista, que su trailer no esté cerrado y que haya cajas suficientes. Si algo falla no se guarda nada y se responde con un mensaje claro, por ejemplo: "Solo quedan 90 cajas de Morrón Verde Grande (trailer T-46); se pidieron 95".
- Para que dos ventas simultáneas no vendan las mismas cajas, la creación del vale corre en una transacción que **bloquea las filas** del manifiesto involucradas.
- Subtotales y total se calculan en el servidor con `Decimal`.
- Un vale mal hecho se corrige **cancelándolo y haciendo uno nuevo**. No se edita ni se borra, para no perder el rastro de los folios.
- Las cajas vendidas solo cuentan los vales `VIGENTE`. Al cancelar uno, las existencias se recuperan solas.

**Trailers**

- No se puede vender de un trailer cerrado.
- Los trailers no se ocultan por fecha ni se borran solos, porque las liquidaciones históricas deben seguir disponibles. Por eso existe la pestaña de cerrados.

**Resumen del día**

- Ventas = suma de vales vigentes del día.
- Gastos de andén del día = suma del `costoAnden` de los trailers que **llegaron** ese día.
- **Ganancia neta = ventas − costos de andén.** Es la definición acordada por ahora; puede cambiar (según la hoja del tío, lo que él gana por viaje es la comisión).
- Los vales cancelados no cuentan.

**Liquidación por trailer**

- Ventas por producto y tamaño: cajas que llegaron, vendidas y restantes, más la lista de ventas (folio, cliente, cajas, precio, total).
- Gastos: flete + piso (`costoAnden`) + descarga + comisión (`comisionPorcentaje` % de la venta).
- Balance = venta − gastos.

**Catálogo de productos**

- Vive en `shared/src/catalogos.ts`. Hoy solo se vende Morrón (en colores como rojo, amarillo, naranja y verde), pero se pueden agregar variedades (ej. pasilla) **sin migración**, solo editando el catálogo.

---

## 8. Frontend: pantallas y navegación

### Shell

- **Barra superior** (solo con sesión): nombre de la app a la izquierda y engrane de Ajustes a la derecha. No es fija; se va con el scroll.
- **`app-barra-estado-pwa`**: aparece solo cuando no hay red o hay una actualización pendiente.
- **Navegación inferior** (solo con sesión): Vender · Vales · Trailers · Resumen.
- Al imprimir se ocultan la navegación y los controles marcados `.no-imprimir`.

### Rutas

| Ruta | Pantalla | Notas |
|---|---|---|
| `/login` | Login | `invitadoGuard`: si ya hay sesión, manda a `/`. |
| `/` | → `/vender` | Todo lo de abajo cuelga de un padre con `canActivateChild: [sesionGuard]`. |
| `/vender` | Nuevo vale | Pantalla de inicio. En iPad, la captura va a la izquierda y los productos a la derecha; en teléfono, en una columna. Valida existencias en tiempo real. |
| `/vales` | Vales del día | Total, cajas y cancelados del día. Cada vale muestra folio, hora, cliente, líneas (con trailer) y total. Cancelar pide confirmación ("Las N cajas vuelven a quedar disponibles"). |
| `/trailers` | Trailers | Pestaña **Activos**: tarjetas con barra de existencias por color, detalle por tamaño, "Ver liquidación" y "Cerrar trailer" (con confirmación). Pestaña **Cerrados**: tarjetas compactas, buscador con *debounce* ("Viaje, trailer, invernadero o placa"), "Ver más" de 20 en 20 y botón Reabrir. |
| `/trailers/nuevo` | Registrar trailer | Datos generales, viaje, gastos, comisión (10 por defecto) y manifiesto con varias líneas. Usa Signal Forms validados con los esquemas de `shared`. |
| `/trailers/:id/liquidacion` | Liquidación | Botón de imprimir (`window.print()`): en iPhone permite guardar como PDF o compartir. |
| `/resumen` | Resumen del día | Selector de día (anterior/siguiente/fecha). |
| `/ajustes` | Ajustes | Sección "Cuenta": usuario actual y "Cerrar sesión" con confirmación en la misma pantalla. |
| `**` | → `/vender` | |

### Convenciones de UI

- Todo el texto y los mensajes de validación están en español.
- Locale `es-MX` y moneda `MXN` (`LOCALE_ID` y `DEFAULT_CURRENCY_CODE`).
- Estilos globales en `styles.scss` con variables (`--primario`, `--superficie`, `--linea`, `--tinta-suave`, `--peligro`, `--peligro-fondo`, `--radio`, `--radio-chico`, `--toque: 48px`, `--alto-nav: 64px`, `--fuente-cifras`…) y clases reutilizables (`.boton`, `.boton--secundario`, `.boton--peligro`, `.boton--ancho`, `.campo`, `.cifra`).
- Inputs con `font-size` ≥ 16 px para que iOS no haga zoom.
- Las acciones delicadas (cerrar trailer, cancelar vale, cerrar sesión) **dejan el botón activo** y el aviso de "necesitas conexión" aparece dentro de la confirmación.

---

## 9. Autenticación

**Modelo**: un solo usuario, sesión por cookie guardada en una tabla de Prisma (no JWT ni `express-session`).

- Al hacer login se genera un token aleatorio (32 bytes, base64url). Viaja en la cookie `sesion`; en la base solo se guarda su **hash SHA-256**.
- Cookie `httpOnly`, `SameSite=Strict`, `path=/` y `Secure` cuando `NODE_ENV=production`.
- **Expiración deslizante**: la sesión dura 30 días. Si le quedan menos de 15, se renueva a 30 en la siguiente petición y se reenvía la cookie.
- Al crear una sesión se borran las sesiones vencidas.
- Contraseñas con **argon2**. Si el usuario no existe, se verifica contra un hash de relleno para que la respuesta tarde lo mismo y no se pueda adivinar qué usuarios existen.
- **Rate limit** en el login: 10 intentos fallidos por IP cada 15 minutos (`express-rate-limit`).
- `app.set('trust proxy', 1)` ya está puesto para Railway. Sin eso fallarían la cookie `Secure` y el límite por IP.

**Crear usuario o cambiar contraseña** (sin pantalla de registro):

```bash
npm run usuario:crear -w backend
```

Pide usuario y contraseña (mínimo 10 caracteres, sin mostrarla en pantalla) y la confirmación. Si el usuario ya existe, **cambia su contraseña y cierra todas sus sesiones**, útil si se pierde el iPhone. Las credenciales nunca van en el `.env`, en notas ni en el repo: se guardan en un gestor de contraseñas.

**Frontend**

- `AuthService`: signal del usuario actual. Al arrancar llama a `GET /api/auth/yo` con el header `ngsw-bypass` para que el service worker nunca responda desde caché.
- Sin red al abrir la app, se usa el nombre guardado en `localStorage` del último login (`abastos.usuario`). Es solo el nombre; la sesión real vive en la cookie.
- `sesionGuard` / `invitadoGuard` protegen las rutas.
- `authInterceptor`: cualquier 401 fuera de `/api/auth/` manda al login.
- La precarga de datos solo corre si hay sesión.
- Cerrar sesión **requiere conexión**; si no, la cookie seguiría viva en el servidor.
- Login con botón propio para mostrar u ocultar la contraseña (se ocultó el de Edge) y `autocapitalize="none"` para iPhone.

---

## 10. Funcionamiento sin conexión (PWA)

Se definieron tres niveles y se implementaron los dos primeros. El nivel 3 (vender sin red y sincronizar después) **no** está hecho.

### Nivel 1: la app abre sin red

- `@angular/service-worker` registrado solo en producción (`registerWhenStable:30000`).
- `manifest.webmanifest` y meta tags de iOS en `index.html` para instalarla desde Safari ("Agregar a pantalla de inicio").
- `ActualizacionesService`: avisa cuando hay versión nueva.
- `ConexionService`: signal `enLinea()`.
- `barra-estado-pwa`: muestra el estado de conexión o de actualización.

### Nivel 2: lectura de datos sin red

- `ngsw-config.json` → `dataGroups` sobre `/api/**` con estrategia **`freshness`**: siempre intenta la red y, si no responde en **5 s** o no hay conexión, entrega la última copia guardada. `maxAge: 7d`, `maxSize: 300`. El timeout también cubre la señal débil.
- **La caché es por URL exacta**, incluidos los parámetros y su orden.
- `PrecargaService`: al abrir la app con red y sesión, pide en segundo plano los trailers activos, los vales del día, el resumen del día y la liquidación de cada trailer activo, con las mismas URLs que usan las pantallas (fecha con `hoyCdmx()`). Respeta un intervalo mínimo de 5 minutos.
- `datos-guardados`: lee el header `Date` de la respuesta y, si es viejo, muestra "Mostrando datos de las HH:MM".
- `sinConexionInterceptor`: sin red, corta al instante los POST/PATCH/DELETE con `statusText = SIN_CONEXION_PREVIA`.
- `aviso-conexion-guardar`: aviso junto a los botones de guardar.
- `core/errores.ts`:
  - `mensajeDeError()` para consultas. Distingue entre falta de red (status 0, 504 del service worker o `navigator.onLine` falso) y error del servidor.
  - `mensajeDeErrorAlGuardar()` distingue "no se envió nada" de "se cortó a la mitad; revisa si quedó registrado antes de reintentar", para evitar vales duplicados.
- Al cerrar sesión se borran también los cachés de datos del service worker.

> Nota a revisar: en el código de login, `auth.service.ts`, `login-page.ts` y `ajustes-page.ts` importan `esErrorDeConexion` de `core/pwa/errores-red`, mientras que el resto de la lógica de errores quedó en `core/errores.ts`. Confirma cuál de los dos archivos existe en tu repo y deja uno solo como fuente.

**Limitaciones conocidas**: solo está disponible offline lo que ya se consultó con red; la búsqueda de cerrados funciona sin red solo para combinaciones ya consultadas; guardar siempre requiere conexión.

---

## 11. Cómo clonar y levantar el proyecto

Todos los comandos se corren desde la **raíz del monorepo** (`abastos-ventas/`) salvo que se diga otra cosa.

### 11.1 Requisitos

- **Node.js 24.15 o superior** (con npm). En Windows se recomienda instalarlo con `nvm-windows`.
- **PostgreSQL** local (o una base remota: Neon, Supabase, Railway…).
- **Git**.
- Opcional: **VS Code** con la extensión **REST Client** para los archivos `.http`.
- No hace falta tener `ng` instalado globalmente: se usa la CLI local con `npm run ng -w frontend -- …`.

### 11.2 Clonar e instalar dependencias

```bash
git clone <URL-DEL-REPOSITORIO>
cd abastos-ventas
npm install
```

`npm install` instala los tres workspaces y, por el `postinstall` del backend, genera el cliente de Prisma. Funciona aunque todavía no exista el `.env`.

### 11.3 Crear la base de datos local

Con PostgreSQL corriendo, crea una base vacía (ejemplo con el cliente `psql`; usa tu propio usuario de Postgres):

```bash
psql -U <usuario_postgres> -c "CREATE DATABASE abastos;"
```

### 11.4 Variables de entorno

```bash
# macOS / Linux
cp backend/.env.example backend/.env
# Windows (cmd)
copy backend\.env.example backend\.env
```

Edita `backend/.env`:

| Variable | Obligatoria | Default | Descripción |
|---|---|---|---|
| `DATABASE_URL` | Sí | — | Cadena de conexión de PostgreSQL, por ejemplo `postgresql://<usuario>:<contraseña>@localhost:5432/abastos`. Para bases remotas suele llevar `?sslmode=require`. |
| `PORT` | No | `3000` | Puerto de la API. |
| `CORS_ORIGIN` | No | `http://localhost:4200` | Origen permitido. En local casi no importa porque se usa el proxy. |
| `NODE_ENV` | No | `development` | **No la pongas en `production` en local**: la cookie saldría `Secure` y el navegador la rechazaría en `http://`. |

El `.env` nunca se sube al repositorio, y la cadena de conexión real no se comparte en chats ni documentos.

### 11.5 Aplicar las migraciones y generar el cliente

```bash
npm run db:deploy -w backend     # aplica las migraciones que ya vienen en el repo
npm run db:generate -w backend   # regenera el cliente de Prisma
```

> En Prisma 7, `migrate` ya **no** regenera el cliente solo. Después de cualquier migración corre siempre `npm run db:generate -w backend`.

Si vas a **cambiar el schema** (no solo clonar), usa `db:migrate`, que crea una migración nueva:

```bash
npm run db:migrate -w backend -- --name <nombre_del_cambio>
npm run db:generate -w backend
```

### 11.6 Crear el usuario para entrar

```bash
npm run usuario:crear -w backend
```

### 11.7 Levantar en desarrollo

```bash
npm run dev
```

Esto compila `shared` y levanta en paralelo (con `concurrently`) la API en `http://localhost:3000` (con `tsx watch`) y Angular en `http://localhost:4200` (con proxy de `/api`).

Abre `http://localhost:4200`: debe aparecer el login.

> Si cambias algo en `shared/`, recompílalo con `npm run build:shared`, o deja corriendo `npm run watch -w @abastos/shared`.
> En desarrollo el service worker está **desactivado**. Para probar la PWA y el modo sin conexión usa el build de producción (abajo).

### 11.8 Probar el build de producción y la PWA en local

Necesitas dos terminales, ambas en la raíz.

**Terminal 1: API**

```bash
npm run dev
```

**Terminal 2: build y servidor de prueba**

```bash
npm run build:shared
npm run ng -w frontend -- build
npx http-server frontend/dist/frontend/browser -p 8080 -c-1 --proxy http://localhost:3000
```

En el navegador:

1. Si tienes sesión en `localhost:4200`, sal primero: las cookies **no distinguen puerto**.
2. Abre `http://localhost:8080/` (la raíz, no una ruta interna).
3. DevTools → Application → Storage → **Clear site data**, y recarga.
4. Para simular sin red: DevTools → Network → **Offline**.

Cada cambio del frontend requiere detener `http-server` (`Ctrl + C`), repetir el build y volver a levantarlo.

### 11.9 Verificaciones rápidas

```bash
npm run typecheck                    # tipos de shared y backend
npm run test -w frontend             # pruebas de Angular (si aplica)
npm run db:studio -w backend         # ver los datos en Prisma Studio
```

---

## 12. Scripts disponibles

### Raíz

| Comando | Qué hace |
|---|---|
| `npm run dev` | Compila `shared` y levanta API + frontend. |
| `npm run dev:api` | Solo la API. |
| `npm run dev:web` | Solo Angular. |
| `npm run build` | Compila `shared`, `backend` y `frontend`. |
| `npm run build:shared` | Compila `@abastos/shared`. |
| `npm run typecheck` | Compila `shared` y revisa tipos del backend. |

### Backend (`-w backend`)

| Comando | Qué hace |
|---|---|
| `dev` | `tsx watch src/server.ts` |
| `build` | `prisma generate` + `tsc` |
| `start` | `node dist/server.js` |
| `typecheck` | `tsc --noEmit` |
| `db:generate` | `prisma generate` |
| `db:migrate` | `prisma migrate dev` (crea y aplica migraciones) |
| `db:deploy` | `prisma migrate deploy` (solo aplica, para clonar o producción) |
| `db:studio` | `prisma studio` |
| `usuario:crear` | Crea el usuario o cambia su contraseña |
| `postinstall` | `prisma generate` |

### Frontend (`-w frontend`)

| Comando | Qué hace |
|---|---|
| `start` | `ng serve` con `proxy.conf.json` |
| `build` | Build de producción en `frontend/dist/frontend/browser` |
| `ng -- <args>` | CLI de Angular local (ej. `npm run ng -w frontend -- g c nombre`) |

### Shared (`-w @abastos/shared`)

| Comando | Qué hace |
|---|---|
| `build` | `tsc` |
| `watch` | `tsc --watch` |

---

## 13. Pruebas manuales

### Archivos `.http` (REST Client)

En `backend/requests/` están `trailers.http` y `tickets.http` con un ejemplo por endpoint. Como la API exige sesión, **agrega al inicio de cada archivo** una petición de login; REST Client guarda la cookie y la manda en las siguientes:

```http
@api = http://localhost:3000/api

### Login
POST {{api}}/auth/login
Content-Type: application/json

{ "usuario": "<tu_usuario>", "contrasena": "<tu_contraseña>" }
```

No guardes una contraseña real en estos archivos dentro del repo: reemplázala por el placeholder antes de hacer commit.

### Casos que conviene repetir antes de cada entrega

1. Crear un trailer, venderle, revisar que suban las cajas vendidas, cancelar el vale y revisar que regresen.
2. Intentar vender más cajas de las que hay → 409 con mensaje claro.
3. Vender de un trailer cerrado → rechazado.
4. Resumen del día igual al total de Vales.
5. Liquidación: comisión = % de la venta; balance = venta − gastos; imprimir sin menú.
6. Cerrados: buscar por viaje/invernadero/placa, "Ver más", reabrir.
7. Login: entrar; contraseña incorrecta 11 veces → "Demasiados intentos".
8. Sin conexión (build de producción): con sesión → datos en caché con "Mostrando datos de las…"; botones de guardar con aviso; después de salir con red → se queda en login.
9. Cambio de contraseña con `usuario:crear` → la siguiente acción regresa al login.
10. Vista de teléfono angosto (iPhone SE) en DevTools.

---

## 14. Problemas conocidos y soluciones

| Síntoma | Causa | Solución |
|---|---|---|
| Después de `migrate` el código no ve los modelos nuevos | Prisma 7 no regenera el cliente al migrar | `npm run db:generate -w backend` |
| Login correcto pero regresa al login | `validarSesion` sin `return` en el caso normal (ya corregido) | Mantener `"noImplicitReturns": true` en `backend/tsconfig.json` y correr `npm run typecheck` |
| La cookie no se guarda en local | `NODE_ENV=production` en el `.env` local, o llamadas a `http://localhost:3000` en vez de `/api` | Quitar `NODE_ENV` del `.env` local y usar siempre rutas relativas |
| Entra sin login en `:8080` | La cookie de `:4200` vale para cualquier puerto de localhost | Salir en un puerto antes de probar el otro |
| `:8080` muestra una versión vieja | No se rehízo el build, o el service worker tenía la versión anterior | Rehacer build, Clear site data en la raíz y recargar |
| "Cannot GET /…" al recargar en `http-server` | `http-server` no tiene *fallback* de SPA | Abrir la raíz `http://localhost:8080/`. En producción Express responderá `index.html` |
| El proxy de `http-server` manda mal las peticiones | Un `?` al final de la URL del proxy | Usar `--proxy http://localhost:3000` sin `?` |
| Fallos de conexión con `localhost` en Windows | Resolución `localhost` (IPv6) vs `127.0.0.1` | Usar `127.0.0.1` en el destino del proxy si ocurre |
| Ojo de "ver contraseña" aparece y desaparece | Es el de Edge, no el de la app | Ya se ocultó con `::-ms-reveal` y hay botón propio |

---

## 15. Pendientes y siguientes pasos

### Deploy (siguiente paso)

Plataforma elegida: **todo en Railway** (servicio Node + PostgreSQL de Railway).

- [ ] Hacer que Express sirva `frontend/dist/frontend/browser` y responda `index.html` para cualquier ruta que no sea `/api` (*fallback* de SPA).
- [ ] Evitar caché agresiva de `index.html`, `ngsw-worker.js` y `ngsw.json`.
- [ ] Configurar en Railway el build del monorepo (`npm install` + `npm run build`) y el arranque (`npm run start -w backend`).
- [ ] Variables en Railway: `DATABASE_URL` (referencia a la base de Railway), `NODE_ENV=production`. `PORT` lo asigna Railway.
- [ ] Aplicar migraciones en producción con `npm run db:deploy -w backend`.
- [ ] Crear el usuario contra la base de producción con `npm run usuario:crear -w backend`.
- [ ] Probar en el iPhone y el iPad reales: instalación desde Safari, login, modo sin conexión y actualizaciones.

### Más adelante

- [ ] **Impresión de vales** (3 copias: cliente, vendedor y quien descarga). Opción recomendada: impresora térmica Star Micronics de 80 mm (SM-L300 o SM-T300i) con la app gratuita PassPRNT, porque Safari no soporta Web Bluetooth. Ajustes es el lugar previsto para configurarla.
- [ ] **Cuentas por cobrar / crédito a clientes** (el tío lleva una libreta aparte).
- [ ] Confirmar con el tío la definición de **ganancia neta** (hoy: ventas − costos de andén).
- [ ] Nivel 3 sin conexión (vender sin red con bandeja de salida en IndexedDB), solo si hace falta.
- [ ] Unificar `core/errores.ts` y `core/pwa/errores-red.ts` (ver nota en la sección 10).
