export interface UserSearchResponseDTO {
    id: number;
    fullName: string;
    username: string;
    photoUrl: string | null;
    city: string;
    friendshipStatus: "none" | "friends" | "pending_sent" | "pending_received" | "self";
    friendshipRequestId: number | null;
}
