import api from "../config/api";
import type { LibraryStatisticsDTO } from "@/types";

export const getMyLibraryStatistics = async (): Promise<LibraryStatisticsDTO> => {
    const response = await api.get("/libraries/me/statistics");
    return response.data;
};