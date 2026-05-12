export const NotificationType = {
    FRIENDSHIP: 'FRIENDSHIP',
    REVIEW: 'REVIEW',
    SHARED: 'SHARED'
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export interface Notification {
    id: number;
    notificationType: NotificationType;
    message: string;
    referenceId: number | null;
    read: boolean;
    createdAt: string;
}

export interface NotificationPreference {
    id: number;
    notificationType: NotificationType;
    isEnabled: boolean;
}

export interface UserListShare {
    id: number;
    listId: number;
    listName: string;
    ownerId: number;
    ownerName: string;
    receiverId: number | null;
    receiverName: string | null;
    sharedAt: string;
    isActive: boolean;
}

export interface UserListShareLink {
    id: number;
    listId: number;
    listName: string;
    publicToken: string;
    createdAt: string;
    isActive: boolean;
}
