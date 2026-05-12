import { useState, useCallback } from 'react';
import type { UserSearchResponseDTO } from '../types';
import * as friendshipService from '../services/friendshipService';
import { useAuth } from '../context/AuthContext';

export const useFriendship = () => {
    const { user } = useAuth();
    const [friends, setFriends] = useState<UserSearchResponseDTO[]>([]);
    const [requests, setRequests] = useState<UserSearchResponseDTO[]>([]);
    const [searchResults, setSearchResults] = useState<UserSearchResponseDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isReader = user?.userRole === 'NORMAL' || user?.userRole === 'ADMIN';

    const loadFriends = useCallback(async () => {
        if (!isReader) return;
        setLoading(true);
        try {
            const data = await friendshipService.getFriends();
            setFriends(data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar amigos');
        } finally {
            setLoading(false);
        }
    }, [isReader]);

    const loadPendingRequests = useCallback(async () => {
        if (!isReader) return;
        setLoading(true);
        try {
            const data = await friendshipService.getPendingRequests();
            setRequests(data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cargar solicitudes');
        } finally {
            setLoading(false);
        }
    }, [isReader]);

    const searchUsers = useCallback(async (query: string) => {
        if (!isReader || !query.trim()) {
            setSearchResults([]);
            return;
        }
        setLoading(true);
        try {
            const data = await friendshipService.searchReaders(query);
            setSearchResults(data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al buscar usuarios');
        } finally {
            setLoading(false);
        }
    }, [isReader]);

    const sendRequest = async (receiverId: number) => {
        setLoading(true);
        try {
            await friendshipService.sendFriendshipRequest(receiverId);
            // Actualizar el estado local de búsqueda
            setSearchResults(prev => prev.map(u => u.id === receiverId ? { ...u, friendshipStatus: 'pending_sent' } : u));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al enviar solicitud');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const acceptRequest = async (requestId: number) => {
        setLoading(true);
        try {
            await friendshipService.acceptFriendshipRequest(requestId);
            await loadPendingRequests();
            await loadFriends();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al aceptar solicitud');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const rejectRequest = async (requestId: number) => {
        setLoading(true);
        try {
            await friendshipService.rejectFriendshipRequest(requestId);
            await loadPendingRequests();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al rechazar solicitud');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const cancelRequest = async (requestId: number) => {
        setLoading(true);
        try {
            await friendshipService.cancelFriendshipRequest(requestId);
            // Esto típicamente lo llamamos desde la búsqueda donde vemos a quién enviamos
            setSearchResults(prev => prev.map(u => u.friendshipRequestId === requestId ? { ...u, friendshipStatus: 'none', friendshipRequestId: null } : u));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al cancelar solicitud');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const removeFriend = async (friendId: number) => {
        setLoading(true);
        try {
            await friendshipService.removeFriendship(friendId);
            await loadFriends();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al eliminar amigo');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        friends,
        requests,
        searchResults,
        loading,
        error,
        loadFriends,
        loadPendingRequests,
        searchUsers,
        sendRequest,
        acceptRequest,
        rejectRequest,
        cancelRequest,
        removeFriend
    };
};
