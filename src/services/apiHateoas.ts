import type { AxiosResponse } from "axios";

/**
 * Helpers para consumir las respuestas HATEOAS del backend Lectuaria.
 *
 * El backend envuelve sus recursos REST en `EntityModel<T>`,
 * `CollectionModel<T>` y `PagedModel<EntityModel<T>>`. Spring HATEOAS 2.x
 * serializa el contenido en un objeto donde:
 *
 *   - EntityModel<T>     -> { ...campos del T..., _links?: { self: { href } } }
 *                            (T aplanado al nivel raíz + bloque _links)
 *   - CollectionModel<T> -> { _embedded?: { <relName>List: T[] }, _links?: {...} }
 *                            o T[] aplanado según cómo el controller lo arme
 *   - PagedModel<T>      -> { content: T[], page: { size, number, totalElements, totalPages }, _links?: {...} }
 *
 * Estos helpers extraen el payload que el cliente realmente consume (el DTO o
 * la lista de DTOs), ocultando la metadata de hipermedia.
 *
 * Son TOLERANTES: si por alguna razón la respuesta no viene envuelta (endpoints
 * legacy, /auth/login, /auth/logout, /api/health, /api/library-books/template,
 * descarga binaria CSV), devuelven el body tal cual o un valor por defecto.
 */

export interface HateoasEntity<T> {
  data?: T;
  _links?: Record<string, { href: string; method?: string }>;
}

export interface HateoasPagedResponse<T> {
  content: T[];
  page?: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
  first?: boolean;
  last?: boolean;
  _links?: Record<string, { href: string }>;
}

export interface HateoasCollection<T> {
  _embedded?: Record<string, T[]>;
  content?: T[];
  _links?: Record<string, { href: string }>;
}

/**
 * Extrae el payload de un EntityModel<T> (o de un body plano).
 *
 * Estrategia:
 *  1) Si el body tiene la forma `{ data: T }` (legacy / algunos endpoints),
 *     devuelve `data`.
 *  2) Si no, devuelve el body tal cual (Spring HATEOAS 2.x aplana T al
 *     nivel raíz y agrega `_links` por encima, que TypeScript ignora).
 */
export function unwrapEntity<T>(response: AxiosResponse<unknown>): T {
  const body = response.data as HateoasEntity<T> | T | undefined | null;
  if (body && typeof body === "object" && "data" in body && (body as HateoasEntity<T>).data !== undefined) {
    return (body as HateoasEntity<T>).data as T;
  }
  return body as T;
}

/**
 * Extrae la lista de un CollectionModel<T> o de un body plano.
 * Si la respuesta es un PagedModel (con content: T[]), devuelve el array.
 * Si es un array directo, lo devuelve.
 * Tolerante: si no se reconoce, devuelve [].
 */
export function unwrapCollection<T>(response: AxiosResponse<unknown>): T[] {
  const body = response.data as unknown;
  if (!body || typeof body !== "object") {
    if (Array.isArray(body)) {
      return body as T[];
    }
    return [];
  }
  const b = body as HateoasCollection<T> & { content?: T[]; _embedded?: Record<string, T[]> };
  if (Array.isArray(b.content)) {
    return b.content;
  }
  if (b._embedded) {
    const first = Object.values(b._embedded).find((arr) => Array.isArray(arr));
    if (first) {
      return first as T[];
    }
  }
  if (Array.isArray(body)) {
    return body as T[];
  }
  return [];
}

/**
 * Extrae el contenido de un PagedModel<T> junto con la metadata de paginacion.
 * Si la respuesta es un PaginatedResponse legacy, mapea los campos al
 * mismo shape para que el resto del cliente no cambie.
 */
export function unwrapPaged<T>(
  response: AxiosResponse<unknown>
): {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
} {
  const body = response.data as unknown;
  if (!body || typeof body !== "object") {
    return emptyPage<T>();
  }
  const b = body as HateoasPagedResponse<T> & { hasNext?: boolean; hasPrevious?: boolean };

  const content = Array.isArray(b.content) ? b.content : [];

  const totalElements = b.totalElements ?? b.page?.totalElements ?? 0;
  const totalPages = b.totalPages ?? b.page?.totalPages ?? 0;
  const number = b.number ?? b.page?.number ?? 0;
  const size = b.size ?? b.page?.size ?? content.length;
  const first = b.first ?? number === 0;
  const last = b.last ?? number >= totalPages - 1;
  const hasNext = b.hasNext ?? number < totalPages - 1;
  const hasPrevious = b.hasPrevious ?? number > 0;

  return { content, totalElements, totalPages, number, size, first, last, hasNext, hasPrevious };
}

/**
 * Variante que mapea al shape legacy del frontend
 * (`PaginatedResponse<T>` en `types/books.ts`): `pageNumber`, `pageSize`,
 * `isFirst`, `isLast`. Útil para no tocar todos los call-sites.
 */
export function unwrapPagedAsLegacy<T>(
  response: AxiosResponse<unknown>
): {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  isFirst: boolean;
  isLast: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
} {
  const p = unwrapPaged<T>(response);
  return {
    content: p.content,
    totalElements: p.totalElements,
    totalPages: p.totalPages,
    pageNumber: p.number,
    pageSize: p.size,
    isFirst: p.first,
    isLast: p.last,
    hasNext: p.hasNext,
    hasPrevious: p.hasPrevious,
  };
}

/**
 * Devuelve la metadata de links HATEOAS si existe. Util cuando el cliente
 * quiere seguir relaciones hipermedia (e.g. paginacion via _links).
 */
export function unwrapLinks(response: AxiosResponse<unknown>): Record<string, { href: string }> {
  const body = response.data as { _links?: Record<string, { href: string }> } | undefined;
  return body && typeof body === "object" && body._links ? body._links : {};
}

function emptyPage<T>() {
  return {
    content: [] as T[],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 0,
    first: true,
    last: true,
    hasNext: false,
    hasPrevious: false,
  };
}
