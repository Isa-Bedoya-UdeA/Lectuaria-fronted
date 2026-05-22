import api from '../config/api';
import type { UserPrivacySettingsDTO } from '@/types/userProfile';

export const getPrivacySettings = async (): Promise<UserPrivacySettingsDTO> => {
    try {
        const response = await api.get<UserPrivacySettingsDTO>('/users/me/privacy');
        return response.data;
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: 'Failed to fetch privacy settings' };
    }
};

export const updatePrivacySettings = async (settings: UserPrivacySettingsDTO): Promise<UserPrivacySettingsDTO> => {
    try {
        const response = await api.put<UserPrivacySettingsDTO>('/users/me/privacy', settings);
        return response.data;
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: 'Failed to update privacy settings' };
    }
};