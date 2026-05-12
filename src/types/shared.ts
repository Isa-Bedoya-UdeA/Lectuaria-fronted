export interface SharedBook {
    notificationId: number;
    bookId: number;
    isbn: string;
    title: string;
    coverUrl?: string;
    ownerName: string;
    message: string;
    sharedAt: string;
}

export interface SharedList {
    id: number;
    listId: number;
    listName: string;
    listDescription: string;
    ownerId: number;
    ownerName: string;
    receiverId: number;
    receiverName: string;
    sharedAt: string;
    isActive: boolean;
    books?: any[];
    publicToken?: string;
}
