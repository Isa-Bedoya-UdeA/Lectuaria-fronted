import { useState, useEffect } from "react";
import axios from "axios";
import { unwrapCollection } from "../services/apiHateoas";
import type { LibrarySummary, ApiError } from "../types";

export const useLibraries = () => {
    const [libraries, setLibraries] = useState<LibrarySummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const publicApi = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
        headers: { "Content-Type": "application/json" }
    });

    useEffect(() => {
        const fetchLibraries = async () => {
            setIsLoading(true);
            try {
                const response = await publicApi.get("/libraries");
                // El backend devuelve CollectionModel<LibrarySummaryDTO>
                // con shape { _embedded: { librarySummaryDTOList: [...] } }.
                // unwrapCollection extrae el array subyacente de forma
                // tolerante (acepta tambien arrays planos y PagedModel).
                setLibraries(unwrapCollection<LibrarySummary>(response));
            } catch (err) {
                const apiError = err as { response?: { data?: ApiError } };
                setError(apiError.response?.data?.message || "Error al cargar bibliotecas");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLibraries();
    }, []);

    return { libraries, isLoading, error };
};
