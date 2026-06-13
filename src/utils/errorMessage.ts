/**
 * Extrae un mensaje de error en espanol a partir de cualquier error
 * capturado (axios, nativo JS, o un objeto con `.message`).
 *
 * Garantias:
 *  - Si el error trae un mensaje del backend y esta en espanol, lo respeta.
 *  - Si el error es de red (sin response del backend) o el mensaje esta
 *    vacio, devuelve el fallback en espanol que el caller pasa.
 *  - Nunca devuelve el mensaje crudo de axios ("Network Error", "timeout
 *    of Xms exceeded", etc.) que viene en ingles.
 */
export const getErrorMessage = (err: unknown, fallback: string): string => {
    if (!err) return fallback;

    // Si el caller ya re-lanzo algo como { message: "Failed to ..." } desde
    // un servicio, lo detectamos y descartamos si esta vacio.
    const anyErr = err as { message?: string; response?: { data?: { message?: string } } };

    // 1) Preferir el mensaje del backend si viene (suele estar en espanol)
    const fromBackend = anyErr?.response?.data?.message;
    if (fromBackend && fromBackend.trim().length > 0) {
        return fromBackend;
    }

    // 2) Mensaje directo del error
    const direct = anyErr?.message;
    if (direct && direct.trim().length > 0 && !looksLikeAxiosEnglish(direct)) {
        return direct;
    }

    // 3) Fallback en espanol
    return fallback;
};

/**
 * Detecta los mensajes tipicos en ingles que axios/network lanzan cuando
 * el backend no responde. No queremos mostrarlos al usuario.
 */
const looksLikeAxiosEnglish = (msg: string): boolean => {
    const m = msg.toLowerCase();
    return (
        m.includes("network error") ||
        m.includes("failed to fetch") ||
        m.includes("timeout") ||
        m.startsWith("request failed") ||
        m.includes("no response")
    );
};
