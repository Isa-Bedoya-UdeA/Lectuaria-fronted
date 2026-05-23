import api from "../config/api";

export interface PlatformDTO {
    id: number;
    name: string;
}

export const platformService = {
    getAll: async (): Promise<PlatformDTO[]> => {
        const response = await api.get<PlatformDTO[]>("/platforms");
        return response.data;
    },
};