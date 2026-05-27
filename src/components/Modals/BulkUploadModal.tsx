import React, { useState } from "react";
import Button from "@/components/UI/Button";
import { useAuth } from "@/context/AuthContext";
import api from "@/config/api";
import type { BulkUploadResult, ApiError } from "@/types";
import { Alert, CircularProgress, LinearProgress } from "@mui/material";
import { useGenres } from "@/hooks/useGenres";
import "./bulkUploadModal.scss";

interface BulkUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<BulkUploadResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showGuide, setShowGuide] = useState(false);
    const { genres: availableGenres } = useGenres();

    if (!isOpen) return null;

    const handleReset = () => {
        setFile(null);
        setResult(null);
        setError(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.name.endsWith('.csv')) {
                setFile(selectedFile);
                setError(null);
            } else {
                setError("Por favor selecciona un archivo CSV válido.");
                setFile(null);
            }
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get("/library-books/template", {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'lectuaria_plantilla_carga.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setError("Error al descargar la plantilla.");
        }
    };

    const handleUpload = async () => {
        if (!file || !user?.libraryId) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await api.post<BulkUploadResult>("/library-books/bulk-upload", formData);
            setResult(response.data);
            if (onSuccess && response.data.successCount > 0) {
                onSuccess();
            }
        } catch (err) {
            const apiError = err as { response?: { data?: ApiError } };
            setError(apiError.response?.data?.message || "Error al procesar el archivo CSV.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content bulk-upload-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Carga Masiva de Libros</h2>
                    <button className="close-btn" onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="m15 9l-6 6m0-6l6 6" /></g></svg>
                    </button>
                </div>

                <div className="modal-body">
                    {!result ? (
                        <>
                            <p>Sube un archivo CSV con la información de tus libros para agregarlos rápidamente al catálogo.</p>

                            <div className="template-section">
                                <Button variant="text" onClick={handleDownloadTemplate}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5l5-5m-5-7v12" /></svg>
                                    Descargar plantilla CSV
                                </Button>
                                <Button variant="text" onClick={() => setShowGuide(!showGuide)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2zm6-5h.01" /><path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3" /></g></svg>
                                    {showGuide ? "Ocultar guía" : "Ver guía de llenado"}
                                </Button>
                            </div>

                            {showGuide && (
                                <div className="bulk-upload-guide">
                                    <h3>Guía de llenado de CSV</h3>
                                    <ul>
                                        <li><strong>ISBN:</strong> Número de 13 dígitos sin guiones.</li>
                                        <li><strong>Autores / Generos / Editoriales:</strong> Usa punto y coma (;) para separar múltiples valores.</li>
                                        <li><strong>Géneros:</strong> ❗ IMPORTANTE: Solo puedes usar géneros existentes en Lectuaria (ver abajo).</li>
                                        <li><strong>Descripción:</strong> Si contiene comas, envuélvela entre comillas dobles (Ej: "Libro, autor y más").</li>
                                        <li><strong>Formato:</strong> Usa <code>fisico</code>, <code>digital</code> o <code>ambos</code>.</li>
                                        <li><strong>CopiasFisicas:</strong> Cantidad de libros físicos (obligatorio si formato es fisico o ambos).</li>
                                    </ul>

                                    <div className="available-genres">
                                        <h4>Géneros permitidos:</h4>
                                        <div className="genres-tag-container">
                                            {availableGenres.map(g => (
                                                <span key={g.id} className="genre-tag-ref">{g.name}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className={`file-upload ${file ? 'has-file' : ''}`}>
                                <input
                                    type="file"
                                    id="csvFile"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    disabled={isLoading}
                                />
                                <label htmlFor="csvFile">
                                    {file ? (
                                        <span>{file.name}</span>
                                    ) : (
                                        <span>Haz clic para seleccionar un archivo CSV</span>
                                    )}
                                </label>
                            </div>

                            {error && <Alert severity="error" sx={{ mt: 2 }} className="alert">{error}</Alert>}

                            {isLoading && (
                                <div className="loading-section">
                                    <p>Procesando archivo... Esto puede tardar unos momentos.</p>
                                    <LinearProgress />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="result-section">
                            <Alert severity={result.errorCount > 0 ? "warning" : "success"} className="alert">
                                Proceso completado: {result.successCount} libros procesados con éxito.
                                {result.errorCount > 0 && ` ${result.errorCount} errores encontrados.`}
                            </Alert>

                            {result.errors.length > 0 && (
                                <div className="errors-list">
                                    <h3>Errores detallados:</h3>
                                    <ul>
                                        {result.errors.map((err: string, i: number) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="result-summary">
                                <p><strong>Total procesados:</strong> {result.totalProcessed}</p>
                                <p><strong>Éxitos:</strong> {result.successCount}</p>
                                <p><strong>Errores:</strong> {result.errorCount}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {!result ? (
                        <>
                            <Button variant="outlined" onClick={onClose} disabled={isLoading}>Cancelar</Button>
                            <Button onClick={handleUpload} disabled={!file || isLoading}>
                                {isLoading ? <CircularProgress size={20} color="inherit" /> : "Empezar carga"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outlined" onClick={handleReset}>
                                Limpiar y reintentar
                            </Button>
                            <Button onClick={onClose}>Cerrar</Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkUploadModal;
