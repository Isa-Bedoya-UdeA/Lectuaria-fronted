import api from "../config/api";
import { unwrapCollection } from "./apiHateoas";

export interface PlatformDTO {
    id: number;
    name: string;
}

export const platformService = {
    getAll: async (): Promise<PlatformDTO[]> => {
        const response = await api.get<PlatformDTO[]>("/platforms");
        return unwrapCollection<PlatformDTO>(response);
    },
};