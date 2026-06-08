import api from '../config/api';
import { unwrapEntity } from "./apiHateoas";
import type { UserPrivacySettingsDTO } from '@/types/userProfile';

export const getPrivacySettings = async (): Promise<UserPrivacySettingsDTO> => {
    try {
        const response = await api.get('/users/me/privacy');
        return unwrapEntity<UserPrivacySettingsDTO>(response);
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: 'Failed to fetch privacy settings' };
    }
};

export const updatePrivacySettings = async (settings: UserPrivacySettingsDTO): Promise<UserPrivacySettingsDTO> => {
    try {
        const response = await api.put('/users/me/privacy', settings);
        return unwrapEntity<UserPrivacySettingsDTO>(response);
    } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } } };
        throw apiError.response?.data || { message: 'Failed to update privacy settings' };
    }
};