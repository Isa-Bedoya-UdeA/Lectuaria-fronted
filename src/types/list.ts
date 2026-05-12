import type { BookSummary } from "./books";

export type ListType = 'SYSTEM' | 'CUSTOM';

export interface UserListDTO {
    id: number;
    name: string;
    description?: string;
    listType: ListType;
    visibility: 'PUBLIC' | 'LISTED' | 'PRIVATE';
    bookCount: number;
    createdAt: string;
    books?: BookSummary[];
    userId?: number; // ID del usuario dueño de la lista
}

export interface CreateListRequestDTO {
    name: string;
    description?: string;
    visibility: 'PUBLIC' | 'LISTED' | 'PRIVATE';
}
