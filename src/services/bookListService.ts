import api from "../config/api";

/**
 * Move a book from one list to another
 */
export const moveBookBetweenLists = async (
    fromListId: number,
    toListId: number,
    bookId: number,
    force: boolean = false
): Promise<void> => {
    try {
        // First remove from current list
        await api.delete(`/lists/${fromListId}/books/${bookId}`);
        
        // Then add to new list
        await api.post(`/lists/${toListId}/books/${bookId}?force=${force}`);
    } catch (error: any) {
        console.error("Error moving book between lists:", error);
        throw error;
    }
};

/**
 * Check if a book is in a specific list
 */
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
