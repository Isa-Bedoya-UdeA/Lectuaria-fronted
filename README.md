# Lectuaria Client

Frontend de **Lectuaria**, plataforma social-bibliotecaria de fomento a la lectura en la ciudad de Medellín. Aplicación React + TypeScript con Vite, MUI y Axios que consume el backend REST expuesto como recursos HATEOAS.

---

## Tabla de contenidos
1. [Descripción del proyecto](#descripción-del-proyecto)
2. [Stack tecnológico](#stack-tecnológico)
3. [Variables de entorno requeridas](#variables-de-entorno-requeridas)
4. [Clonación e instalación local](#clonación-e-instalación-local)
5. [Arquitectura del frontend](#arquitectura-del-frontend)
6. [Estructura del proyecto](#estructura-del-proyecto)
7. [Rutas principales](#rutas-principales)
8. [Consumo de la API (HATEOAS)](#consumo-de-la-api-hateoas)
9. [Patrones frontend](#patrones-frontend)
10. [Testing](#testing)
11. [Build y despliegue](#build-y-despliegue)
12. [Licencia](#licencia)

---

## Descripción del proyecto

Lectuaria es una aplicación web que ofrece dos interfaces diferenciadas según el rol del usuario:

- **Lector:** explorar catálogo, calificar libros, escribir reseñas, gestionar listas de lectura, agregar amigos, compartir libros y listas, ver actividad de la red social.
- **Bibliotecario:** gestionar el inventario de su biblioteca, agregar libros individuales o en masa mediante CSV, editar disponibilidad por formato y biblioteca.

El proyecto está construido como SPA (Single Page Application) con React 19 y se comunica con el backend Lectuaria exclusivamente vía REST + HATEOAS.

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Lenguaje | TypeScript | 5.9 |
| Framework UI | React | 19.2 |
| Bundler / Dev server | Vite | 7.3 |
| Estilos | Sass (sass-embedded) | 1.97 |
| UI components | Material UI (@mui/material) | 7.3 |
| Iconos | @mui/icons-material | 7.3 |
| Date picker | @mui/x-date-pickers | 9.0 |
| HTTP client | Axios | 1.13 |
| Routing | react-router-dom | 7.13 |
| Forms | react-hook-form | 7.71 |
| Linting | ESLint + typescript-eslint | 9.39 / 8.48 |
| Linter plugins | eslint-plugin-react-hooks, eslint-plugin-react-refresh | 7.0 / 0.4 |
| Runtime | Node.js | 18+ |
| Despliegue | Vercel | — |

---

## Variables de entorno requeridas

El proyecto carga la URL del backend desde una variable de entorno. **No incluir URLs reales en el repositorio.** El archivo `.env.example` lista la variable requerida con un placeholder; el archivo `.env` (ignorado por git) debe contener los valores reales y se carga automáticamente al iniciar Vite.

| Variable | Descripción | Ejemplo de uso |
|---|---|---|
| `VITE_API_BASE_URL` | URL base del backend Lectuaria (prefijo `/api` incluido). | `http://localhost:3000/api` en desarrollo, `https://...onrender.com/api` en producción |

> **Importante:** ningún valor real se incluye en este README ni en el repositorio. La lista anterior solo documenta el **nombre** de la variable requerida y su **propósito**. El valor debe vivir exclusivamente en `.env` (que está en `.gitignore`) o en las variables de entorno de Vercel.

> **Nota:** por la convención de Vite, las variables expuestas al cliente deben llevar el prefijo `VITE_`.

---

## Clonación e instalación local

```bash
# 1. Clonar el repositorio
git clone https://github.com/Isa-Bedoya-UdeA/Lectuaria-client.git
cd Lectuaria-client

# 2. Crear el archivo de variables de entorno a partir del ejemplo
cp .env.example .env

# 3. Editar .env con la URL del backend local
#    (por defecto, http://localhost:3000/api)

# 4. Instalar dependencias
npm install

# 5. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación queda disponible en `http://localhost:5173` (puerto por defecto de Vite).

### Requisitos
- **Node.js 18+**
- **npm 9+** (incluido con Node.js)
- Backend Lectuaria corriendo en `http://localhost:3000` (o la URL configurada en `.env`)

---

## Arquitectura del frontend

```
┌─────────────────────────────────────────────────────┐
│                  Pages (vistas)                     │
│   Home, Books, BookDetail, Profile, MyLibrary, ...  │
└──────────────────────┬──────────────────────────────┘
                       │ consume
┌──────────────────────▼──────────────────────────────┐
│              Custom Hooks (lógica)                   │
│   useAuth, useBooks, useFavorites, useReviews, ...   │
└──────────────────────┬──────────────────────────────┘
                       │ consumen
┌──────────────────────▼──────────────────────────────┐
│            Services (capa de API)                   │
│   bookService, authService, userService, ...         │
│   ↓ usa apiHateoas.ts (unwrappers HATEOAS)           │
│   ↓ usa axios con interceptor JWT                   │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP + Bearer JWT
┌──────────────────────▼──────────────────────────────┐
│         Backend Lectuaria (Spring Boot)              │
│         API REST + HATEOAS                          │
└─────────────────────────────────────────────────────┘
```

**Capas:**
- **Pages** — componentes de React que orquestan la UI. Una por ruta.
- **Hooks** — lógica reutilizable. Encapsulan fetching, mutación y estado local.
- **Services** — capa fina sobre Axios. Cada servicio corresponde a un dominio del backend y aplica los helpers HATEOAS para extraer el payload.
- **Context** — `AuthContext` y `BooksContext` para estado global compartido (autenticación, catálogo en memoria).
- **apiHateoas** — helpers tolerantes que extraen el payload de respuestas HATEOAS (`EntityModel`, `CollectionModel`, `PagedModel`).

---

## Estructura del proyecto

```
Lectuaria-client/
├── public/                       # Archivos estáticos servidos por Vite
├── src/
│   ├── components/                # Componentes reutilizables
│   │   ├── Auth/                  # ProtectedRoute, etc.
│   │   ├── Cards/                 # BookCard, FriendCard, ListCard, ...
│   │   ├── Forms/                 # LibraryInfoForm, ListForm, ...
│   │   ├── Home/                  # Hero, Features, FeaturedBooks, ...
│   │   ├── Layout/                # Header, Footer, MainLayout
│   │   ├── Modals/                # AddToListModal, BulkUploadModal, ...
│   │   └── UI/                    # Button, Modal, Toast, CustomSelect, ...
│   ├── config/                    # Configuración de axios y cliente API
│   │   └── api.ts                 # Instancia axios + interceptor JWT + refresh
│   ├── constants/                 # PATHS, SITE_INFO, etc.
│   ├── context/                   # AuthContext, BooksContext
│   ├── hooks/                     # 25+ custom hooks
│   ├── pages/                     # Una por ruta
│   │   ├── 404/                   # NotFound
│   │   ├── account/               # Profile, Lists, ListDetail, SharedList
│   │   ├── auth/                  # SignIn, SignUp, ForgotPassword, ResetPassword
│   │   ├── books/                 # Books, BookDetail
│   │   ├── home/
│   │   ├── legal/                 # TermsOfUse, PrivacyPolicy, CookiePolicy
│   │   ├── library/               # MyLibrary, AddBook, EditBook
│   │   ├── shared/                # SharedWithMe
│   │   └── users/                 # UserProfile
│   ├── routes/                    # router.tsx
│   ├── services/                  # Capa de API
│   │   ├── apiHateoas.ts          # Helpers HATEOAS (unwrapEntity, unwrapCollection, unwrapPaged, unwrapPagedAsLegacy, unwrapLinks)
│   │   ├── authorService.ts
│   │   ├── authService.ts
│   │   ├── bookListService.ts
│   │   ├── bookPublishService.ts
│   │   ├── bookService.ts
│   │   ├── bookShareService.ts
│   │   ├── favoriteService.ts
│   │   ├── friendActivityService.ts
│   │   ├── friendshipService.ts
│   │   ├── genreService.ts
│   │   ├── libraryService.ts
│   │   ├── listService.ts
│   │   ├── listShareService.ts
│   │   ├── newBooksService.ts
│   │   ├── notificationService.ts
│   │   ├── platformService.ts
│   │   ├── privacyService.ts
│   │   ├── ratingService.ts
│   │   ├── recommendationService.ts
│   │   ├── reviewService.ts
│   │   ├── sharedService.ts
│   │   ├── userProfileService.ts
│   │   └── zoneService.ts
│   ├── styles/                    # Estilos globales
│   ├── types/                     # Tipos TypeScript compartidos
│   ├── utils/                     # Utilidades
│   ├── App.tsx                    # Componente raíz
│   └── main.tsx                   # Punto de entrada
├── .env.example
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.json                  # Config TS general
├── tsconfig.app.json              # Config TS para el código de la app
├── tsconfig.node.json             # Config TS para Vite
└── vite.config.ts
```

---

## Rutas principales

| Path | Componente | Auth | Roles |
|---|---|---|---|
| `/` | Home | No | — |
| `/books` | Books | No | — |
| `/books/:isbn` | BookDetail | No | — |
| `/signin` | SignIn | No | — |
| `/signup` | SignUp | No | — |
| `/forgot-password` | ForgotPassword | No | — |
| `/reset-password` | ResetPassword | No | — |
| `/users/:usernameSlug` | UserProfile | No (enriquecido si auth) | — |
| `/shared/:token` | SharedList | No | — |
| `/legal/terms` | TermsOfUse | No | — |
| `/legal/privacy` | PrivacyPolicy | No | — |
| `/legal/cookies` | CookiePolicy | No | — |
| `/profile` | Profile | Sí | READER / LIBRARIAN / ADMIN |
| `/lists` | Lists | Sí | READER |
| `/lists/:id` | ListDetail | Sí | READER |
| `/shared-with-me` | SharedWithMe | Sí | READER |
| `/my-library` | MyLibrary | Sí | LIBRARIAN |
| `/add-book` | AddBook | Sí | LIBRARIAN |
| `/edit-book` | EditBook | Sí | LIBRARIAN |
| `*` | NotFound | No | — |

La protección por rol se implementa con el componente `ProtectedRoute` (en `components/Auth/`) que evalúa el `userRole` del `AuthContext`.

---

## Consumo de la API (HATEOAS)

El backend expone los recursos como hipermedia HATEOAS. Los services de este cliente usan el helper `apiHateoas.ts` para extraer el payload de manera tolerante:

```typescript
import { unwrapEntity, unwrapCollection, unwrapPaged, unwrapPagedAsLegacy, unwrapLinks } from "./apiHateoas";

// EntityModel<T>: el helper desenvuelve el body
const book = unwrapEntity<BookDetailDTO>(response);
// Devuelve el BookDetailDTO

// CollectionModel<T>: extrae la lista
const list = unwrapCollection<BookSummaryDTO>(response);
// Devuelve BookSummaryDTO[]

// PagedModel<T>: extrae content + metadata cruda
const page = unwrapPaged<BookSummaryDTO>(response);
// Devuelve { content, totalElements, totalPages, number, size, first, last, hasNext, hasPrevious }

// Variante que mapea al shape legacy del frontend (pageNumber, pageSize, isFirst, isLast)
const pageLegacy = unwrapPagedAsLegacy<BookSummaryDTO>(response);

// Extrae los _links hipermedia (útil para paginación vía links)
const links = unwrapLinks(response);
```

**Estrategia de tolerancia:** los helpers funcionan tanto con respuestas HATEOAS nuevas como con respuestas legacy (por ejemplo, los endpoints de autenticación que no se envuelven, o respuestas cacheadas). Esto permite migrar gradualmente sin romper el frontend.

**Auth:** el `AuthContext` gestiona el ciclo de vida del access token y el refresh automático. El interceptor de Axios añade `Authorization: Bearer <token>` a cada request protegida, y cuando recibe un 401 intenta un refresh transparente antes de rechazar la promesa.

---

## Patrones frontend

| Patrón | Aplicación |
|---|---|
| **Custom Hooks** | Encapsulan fetching, mutación y estado local. Cada dominio tiene su hook (`useBooks`, `useFavorites`, `useReviews`, `useFriendship`, etc.). Permiten reuso y testeo aislado. |
| **Context** | `AuthContext` para el estado de autenticación global; `BooksContext` para el catálogo en memoria. |
| **Service Layer** | Los componentes nunca hacen fetch directo; pasan por la capa de `services/` que abstrae axios y el manejo de errores. |
| **Protected Routes** | Componente `ProtectedRoute` que valida el rol del usuario contra el rol requerido antes de renderizar la página. |
| **Lazy Loading** | Las páginas poco frecuentes (legal, shared, user profile) se importan con `React.lazy` para reducir el bundle inicial. |
| **Form Abstraction** | `react-hook-form` para manejo declarativo de formularios con validación. |
| **HATEOAS Adapter** | `apiHateoas.ts` actúa como Adapter entre la respuesta hipermedia del backend y los tipos TypeScript limpios que consume el resto del cliente. |

---

## Testing

```bash
# Linting
npm run lint

# Type-check (sin emitir)
npx tsc --noEmit
```

Los tests unitarios e integrados del frontend no están implementados formalmente. La verificación del comportamiento se realiza de forma manual a lo largo del desarrollo. **Mejora pendiente** (ver el plan de mejora continua en la documentación del proyecto): incorporar Vitest + React Testing Library para cubrir hooks, services (con `axios-mock-adapter`) y componentes clave.

---

## Build y despliegue

```bash
# Build de producción
npm run build

# Preview local del build
npm run preview
```

El build genera los archivos estáticos en `dist/`. El despliegue se realiza en **Vercel**, conectado al repositorio de GitHub, con build automático en cada push a `main`.

Las variables de entorno requeridas (ver sección arriba) deben configurarse en el dashboard de Vercel, no en el repositorio.

---

## Licencia

Proyecto de uso académico. Universidad de Antioquia, Facultad de Ingeniería, 2026-1.
