import api from "../config/api";
import { unwrapEntity } from "./apiHateoas";
import type { LibraryStatisticsDTO } from "@/types";

export const getMyLibraryStatistics = async (): Promise<LibraryStatisticsDTO> => {
    const response = await api.get("/libraries/me/statistics");
    return unwrapEntity<LibraryStatisticsDTO>(response);
};