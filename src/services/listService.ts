import api from "../config/api";
import type { UserListDTO, CreateListRequestDTO } from "../types";

export const getMyLists = async (): Promise<UserListDTO[]> => {
	const response = await api.get("/lists");
	return response.data;
};

export const getListDetails = async (id: number): Promise<UserListDTO> => {
	const response = await api.get(`/lists/${id}`);
	return response.data;
};

export const createCustomList = async (
	data: CreateListRequestDTO,
): Promise<UserListDTO> => {
	const response = await api.post("/lists", data);
	return response.data;
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

