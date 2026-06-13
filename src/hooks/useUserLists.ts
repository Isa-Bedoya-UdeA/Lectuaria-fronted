import { useState, useCallback, useEffect } from "react";
import {
	getMyLists,
	createCustomList,
	updateCustomList,
	addBookToList,
	removeBookFromList,
	deleteList as apiDeleteList,
} from "../services/listService";
import type { UserListDTO, CreateListRequestDTO, UpdateListRequestDTO } from "../types";

interface UseUserListsOptions {
	autoFetch?: boolean;
}

export const useUserLists = (options?: UseUserListsOptions) => {
	const { autoFetch = true } = options || {};
	const [lists, setLists] = useState<UserListDTO[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchLists = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await getMyLists();
			setLists(data);
		} catch (err: any) {
			setError(
				err.response?.data?.message || "Error al cargar tus listas",
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const createList = async (data: CreateListRequestDTO) => {
		setIsLoading(true);
		setError(null);
		try {
			const newList = await createCustomList(data);
			setLists((prev) => [...prev, newList]);
			return newList;
		} catch (err: any) {
			setError(err.response?.data?.message || "Error al crear la lista");
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	const updateList = async (listId: number, data: UpdateListRequestDTO) => {
		setIsLoading(true);
		setError(null);
		try {
			const updated = await updateCustomList(listId, data);
			setLists((prev) => prev.map((l) => (l.id === listId ? updated : l)));
			return updated;
		} catch (err: any) {
			setError(err.response?.data?.message || "Error al editar la lista");
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	const addToList = async (
		listId: number,
		bookId: number,
		force: boolean = false,
	) => {
		try {
			await addBookToList(listId, bookId, force);
			await fetchLists(); // Refresh counts
		} catch (err: any) {
			throw err;
		}
	};

	const removeFromList = async (listId: number, bookId: number) => {
		try {
			await removeBookFromList(listId, bookId);
			await fetchLists();
		} catch (err: any) {
			throw err;
		}
	};

	const deleteList = async (listId: number) => {
		try {
			await apiDeleteList(listId);
			setLists((prev) => prev.filter((l) => l.id !== listId));
		} catch (err: any) {
			throw err;
		}
	};

	useEffect(() => {
		if (autoFetch) {
			fetchLists();
		}
	}, [autoFetch, fetchLists]);

	return {
		lists,
		isLoading,
		error,
		fetchLists,
		createList,
		updateList,
		addToList,
		removeFromList,
		deleteList,
		clearError: () => setError(null),
	};
};

