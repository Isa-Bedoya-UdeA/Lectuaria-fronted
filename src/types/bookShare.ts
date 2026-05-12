export interface BookShareRequestDTO {
    friendIds: number[];
    message?: string;
}

export interface BookShareResponseDTO {
    id: number;
    bookId: number;
    bookTitle: string;
    senderId: number;
    senderName: string;
    receiverId: number;
    receiverName: string;
    message?: string;
    sharedAt: string;
}

export interface ShareLinkDTO {
    url: string;
    type: "book" | "review" | "user";
}
