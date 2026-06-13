import api from "../config/api";
import { unwrapCollection, unwrapEntity } from "./apiHateoas";
import type { UserListDTO, CreateListRequestDTO, UpdateListRequestDTO } from "../types";

export const getMyLists = async (): Promise<UserListDTO[]> => {
	const response = await api.get("/lists");
	return unwrapCollection<UserListDTO>(response);
};

export const getListDetails = async (id: number): Promise<UserListDTO> => {
	const response = await api.get(`/lists/${id}`);
	return unwrapEntity<UserListDTO>(response);
};

export const createCustomList = async (
	data: CreateListRequestDTO,
): Promise<UserListDTO> => {
	const response = await api.post("/lists", data);
	return unwrapEntity<UserListDTO>(response);
};

export const updateCustomList = async (
	listId: number,
	data: UpdateListRequestDTO,
): Promise<UserListDTO> => {
	const response = await api.patch(`/lists/${listId}`, data);
	return unwrapEntity<UserListDTO>(response);
};

export const addBookToList = async (
	listId: number,
	bookId: number,
	force: boolean = false,
): Promise<void> => {
	await api.post(`/lists/${listId}/books/${bookId}?force=${force}`);
};

export const removeBookFromList = async (
	listId: number,
	bookId: number,
): Promise<void> => {
	await api.delete(`/lists/${listId}/books/${bookId}`);
};

export const deleteList = async (listId: number, confirm: boolean = true, force: boolean = true): Promise<void> => {
	await api.delete(`/lists/${listId}?confirm=${confirm}&force=${force}`);
};

