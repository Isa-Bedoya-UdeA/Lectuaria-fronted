import api from "../config/api";
import type { LibraryStatisticsDTO } from "@/types";

/**
 * Obtiene las estadísticas del catálogo y de la biblioteca para el bibliotecario autenticado.
 */
export const getMyLibraryStatistics = async (): Promise<LibraryStatisticsDTO> => {
    const response = await api.get("/libraries/me/statistics");
    return response.data;
};
