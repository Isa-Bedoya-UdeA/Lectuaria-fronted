import api from "../config/api";

export const moveBookBetweenLists = async (
    fromListId: number,
    toListId: number,
    bookId: number,
    force: boolean = false
): Promise<void> => {
    try {
        await api.delete(`/lists/${fromListId}/books/${bookId}`);
        await api.post(`/lists/${toListId}/books/${bookId}?force=${force}`);
    } catch (error: any) {
        console.error("Error moving book between lists:", error);
        throw error;
    }
};

export const isBookInList = async (listId: number, bookId: number): Promise<boolean> => {
    try {
        const response = await api.get(`/lists/${listId}/books`);
        const books = response.data.books || [];
        return books.some((book: any) => book.id === bookId);
    } catch (error: any) {
        console.error("Error checking if book is in list:", error);
        return false;
    }
};