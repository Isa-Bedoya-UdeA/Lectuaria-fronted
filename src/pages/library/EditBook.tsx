import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CircularProgress } from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { useGenres } from "@/hooks/useGenres";
import { useAuthors } from "@/hooks/useAuthors";
import { PATHS } from "@/constants/routes";
import { SITE_INFO } from "@/constants/siteInfo";
import Button from "@/components/UI/Button";
import useSEO from "@/hooks/useSEO";
import { getBookById, updateBook, updateBookWithCover } from "@/services/bookService";
import { platformService } from "@/services/platformService";
import type { BookPublishRequest } from "@/types";
import "./addBook.scss";
import Toast, { type ToastType } from "@/components/UI/Toast";

interface EditBookFormValues {
    title: string;
    authors: string;
    description: string;
    genres: string[];
    coverUrl: string;
    publishers: string;
    publicationDate: string;
    pages: string;
    availabilityMode: 'physical' | 'digital' | 'both';
    availability: {
        physical: boolean;
        digital: boolean;
        physicalCopies?: number;
    };
    platformId?: string;
}

const EditBook = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const { genres: availableGenres } = useGenres();
    const { authors: availableAuthors } = useAuthors();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [fetchError, setFetchError] = useState("");
    const [saveError, setSaveError] = useState("");
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    // Opciones para previsualización
    const [coverMode, setCoverMode] = useState<'external' | 'uploaded' | 'file' | 'none'>('external');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [uploadedCoverUrl, setUploadedCoverUrl] = useState("");
    const [authorInput, setAuthorInput] = useState("");
    const [genreInput, setGenreInput] = useState("");
    const [watchedIsbn, setWatchedIsbn] = useState("");
    const [platformIdLoaded, setPlatformIdLoaded] = useState(false);
    const [platforms, setPlatforms] = useState<{ id: string; name: string }[]>([]);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm<EditBookFormValues>({
        mode: "onBlur",
        defaultValues: {
            title: "",
            authors: "",
            description: "",
            genres: [],
            coverUrl: "",
            publishers: "",
            publicationDate: "",
            pages: "",
            availabilityMode: 'physical',
            availability: {
                physical: true,
                digital: false,
                physicalCopies: 1,
            },
        },
    });

    // Cargar datos actuales del libro
    useEffect(() => {
        const fetchBookInfo = async () => {
            if (!id) return;
            try {
                const data = await getBookById(Number(id));

                // Si nosotros o el admin no somos dueños, mejor avisar... (El back lo bloquea igual)
                if (data.createdById && String(data.createdById) !== String(user?.id) && user?.userRole !== "ADMIN") {
                    setFetchError("No tienes permisos para editar este libro.");
                    setIsLoading(false);
                    return;
                }

                setWatchedIsbn(data.isbn.toString());

                setValue("title", data.title || "", { shouldValidate: true });

                if (data.authors?.length) {
                    setValue("authors", data.authors.join(", "), { shouldValidate: true });
                }

                if (data.genres?.length) {
                    const mappedGenres = data.genres.map(g => g.name);
                    setValue("genres", mappedGenres, { shouldValidate: true });
                }

                if (data.description) {
                    setValue("description", data.description, { shouldValidate: true });
                }

                if (data.publishers?.length) {
                    setValue("publishers", data.publishers.join(", "), { shouldValidate: true });
                }

                if (data.pages) {
                    setValue("pages", data.pages.toString(), { shouldValidate: true });
                }

                if (data.publicationDate) {
                    const date = new Date(data.publicationDate);
                    if (!isNaN(date.getTime())) {
                        setValue("publicationDate", date.toISOString().split("T")[0], { shouldValidate: true });
                    }
                }

                if (data.coverUrl) {
                    setValue("coverUrl", data.coverUrl, { shouldValidate: true });
                    if (isS3CoverUrl(data.coverUrl)) {
                        setCoverMode('uploaded');
                        setUploadedCoverUrl(data.coverUrl);
                    } else {
                        setCoverMode('external');
                    }
                } else {
                    setCoverMode('none');
                }

                // Set availability based on data
                const userLibraryId = user?.libraryId;
                const libAvail = data.availability?.find(a => a.library.id === userLibraryId);

                if (libAvail) {
                    if (libAvail.physicalAvailable && libAvail.digitalAvailable) {
                        setValue("availabilityMode", "both");
                        setValue("availability.physical", true);
                        setValue("availability.digital", true);
                    } else if (libAvail.digitalAvailable) {
                        setValue("availabilityMode", "digital");
                        setValue("availability.physical", false);
                        setValue("availability.digital", true);
                    } else {
                        setValue("availabilityMode", "physical");
                        setValue("availability.physical", true);
                        setValue("availability.digital", false);
                    }

                    if (libAvail.physicalCopies !== undefined) {
                        setValue("availability.physicalCopies", libAvail.physicalCopies);
                    }
                    if (libAvail.platformId) {
                        setValue("platformId", String(libAvail.platformId));
                        setPlatformIdLoaded(true);
                    }
                }

                setIsLoading(false);
            } catch (err) {
                console.error(err);
                setFetchError("No fue posible cargar la información actual del libro.");
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchBookInfo();
        }
    }, [id, isAuthenticated, setValue, user]);

    useSEO({
        title: `Editar Libro | ${SITE_INFO.name}`,
        description: `Edita la información de un libro de tu biblioteca en ${SITE_INFO.name}.`,
    });

    // Load platforms from backend
    useEffect(() => {
        platformService.getAll().then(data => {
            setPlatforms(data.map(p => ({ id: String(p.id), name: p.name })));
        }).catch(() => {});
    }, []);

    // Helper: detect if a cover URL is an S3/Supabase upload (not OpenLibrary API)
    const isS3CoverUrl = (url: string): boolean => {
        if (!url || !url.trim()) return false;
        return (
            url.includes("supabase.co/storage") ||
            url.includes(".webp") ||
            url.includes(".jpg") ||
            url.includes(".jpeg") ||
            url.includes(".png")
        );
    };

    // Helper: Cover por defecto a través de ISBN de OpenLibrary
    const getBestCoverUrl = (isbnStr: string, backendCover?: string): string => {
        if (backendCover && backendCover.trim() !== "") return backendCover;
        if (!isbnStr) return "";
        const clean = isbnStr.replace(/[^0-9]/g, "");
        return `https://covers.openlibrary.org/b/isbn/${clean}-L.jpg`;
    };

    const fileToBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    const onSubmit = async (formValues: EditBookFormValues) => {
        if (!id || !user?.libraryId) return;

        setIsSaving(true);
        setSaveError("");

        const authorsList = formValues.authors
            .split(",")
            .map(a => a.trim())
            .filter(a => a.length > 0);

        const publishersList = formValues.publishers
            .split(",")
            .map(p => p.trim())
            .filter(p => p.length > 0);

        let coverUrlValue: string | undefined = undefined;

        // If user selected a file, encode it as base64 data URL
        if (coverMode === 'file' && coverFile) {
            try {
                coverUrlValue = await fileToBase64(coverFile);
            } catch {
                setSaveError("No se pudo procesar el archivo de portada.");
                setIsSaving(false);
                return;
            }
        } else if (coverMode === 'uploaded') {
            // Keep existing uploaded cover
            coverUrlValue = uploadedCoverUrl || formValues.coverUrl.trim() || undefined;
        } else if (coverMode === 'external') {
            coverUrlValue = formValues.coverUrl.trim() || undefined;
        } else {
            // none
            coverUrlValue = undefined;
        }

        const publishData: BookPublishRequest = {
            isbn: Number(watchedIsbn), // Required field format check but not updated backend
            title: formValues.title.trim(),
            authors: authorsList,
            description: formValues.description.trim() || undefined,
            genres: formValues.genres,
            coverUrl: coverUrlValue,
            publishers: publishersList,
            publicationDate: formValues.publicationDate || undefined,
            pages: formValues.pages ? parseInt(formValues.pages, 10) : undefined,
            availability: {
                physical: formValues.availability.physical,
                digital: formValues.availability.digital,
                physicalCopies: formValues.availability.physicalCopies,
            },
            availabilityMode: formValues.availabilityMode,
            platformId: formValues.platformId ? parseInt(formValues.platformId, 10) : undefined,
            libraryId: user.libraryId,
        };

        try {
            // Use updateBookWithCover when a file is selected, otherwise plain updateBook
            if (coverMode === 'file' && coverFile) {
                await updateBookWithCover(Number(id), publishData, coverFile);
            } else {
                await updateBook(Number(id), publishData);
            }
            setToast({ message: "Cambios guardados exitosamente.", type: "success" });

            setTimeout(() => {
                navigate(PATHS.MY_LIBRARY);
            }, 2500);
        } catch (err: any) {
            console.error(err);
            setSaveError(err.message || "No se logró editar el libro. Inténtalo más tarde.");
            setIsSaving(false);
        }
    };

    if (!isAuthenticated || user?.userRole !== "LIBRARIAN") return null;

    if (isLoading) {
        return (
            <main className="addBook" style={{ display: 'flex', justifyContent: 'center', height: '60vh', alignItems: 'center' }}>
                <CircularProgress />
            </main>
        );
    }

    if (fetchError) {
        return (
            <main className="addBook">
                <div className="addBook__container">
                    <Toast message={fetchError} type="error" onClose={() => setFetchError("")} />
                    <Link to={PATHS.MY_LIBRARY}><Button>Volver</Button></Link>
                </div>
            </main>
        );
    }

    return (
        <main className="addBook">
            <div className="addBook__container">
                <Link to={PATHS.MY_LIBRARY} className="addBook__back">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m7 7l-7-7l7-7" />
                    </svg>
                    Regresar a Mi biblioteca
                </Link>

                <section className="addBook__header">
                    <h1>Editar Libro</h1>
                    <p>Actualiza la información publicada en el sistema</p>
                </section>

                {saveError && (
                    <div className="error-text" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        {saveError}
                    </div>
                )}

                <form className="addBook__form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="addBook__row">
                        <div className="addBook__group">
                            <label htmlFor="title">Título *</label>
                            <input
                                type="text"
                                id="title"
                                {...register("title", { required: "El título es obligatorio" })}
                            />
                            {errors.title && <span className="error-text">{errors.title.message}</span>}
                        </div>

                        <div className="addBook__group">
                            <label>Autores *</label>
                            <div className="tag-input-container">
                                <div className="tag-list">
                                    {(watch("authors")?.split(",") || [])
                                        .map(a => a.trim())
                                        .filter(a => a)
                                        .map((author, idx) => (
                                            <span key={idx} className="tag-pill">
                                                {author}
                                                <button type="button" onClick={() => {
                                                    const authors = watch("authors").split(",").map(a => a.trim()).filter(a => a);
                                                    authors.splice(idx, 1);
                                                    setValue("authors", authors.join(", "));
                                                }}>×</button>
                                            </span>
                                        ))}
                                </div>
                                <input
                                    type="text"
                                    list="available-authors"
                                    placeholder="Escribe un autor y presiona Enter"
                                    value={authorInput}
                                    onChange={(e) => setAuthorInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && authorInput.trim()) {
                                            e.preventDefault();
                                            const current = watch("authors");
                                            const newVal = current ? `${current}, ${authorInput.trim()}` : authorInput.trim();
                                            setValue("authors", newVal, { shouldValidate: true });
                                            setAuthorInput("");
                                        }
                                    }}
                                />
                                <datalist id="available-authors">
                                    {availableAuthors.map(a => <option key={a.id} value={a.name} />)}
                                </datalist>
                            </div>
                            <input type="hidden" {...register("authors", { required: "Al menos un autor es obligatorio" })} />
                            {errors.authors && <span className="error-text">{errors.authors.message}</span>}
                        </div>
                    </div>

                    <div className="addBook__group">
                        <label htmlFor="description">Descripción *</label>
                        <textarea
                            id="description"
                            rows={4}
                            {...register("description", { required: "La descripción es obligatoria" })}
                        />
                        {errors.description && <span className="error-text">{errors.description.message}</span>}
                    </div>

                    <div className="addBook__group">
                        <label>Géneros *</label>
                        <div className="tag-input-container">
                            <div className="tag-list">
                                {(watch("genres") || []).map((genre, idx) => (
                                    <span key={idx} className="tag-pill">
                                        {genre}
                                        <button type="button" onClick={() => {
                                            const currentGenres = [...watch("genres")];
                                            currentGenres.splice(idx, 1);
                                            setValue("genres", currentGenres, { shouldValidate: true });
                                        }}>×</button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder="Escribe un género y presiona Enter"
                                list="available-genres"
                                value={genreInput}
                                onChange={(e) => setGenreInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && genreInput.trim()) {
                                        e.preventDefault();
                                        const current = watch("genres") || [];
                                        if (!current.includes(genreInput.trim())) {
                                            setValue("genres", [...current, genreInput.trim()], { shouldValidate: true });
                                        }
                                        setGenreInput("");
                                    }
                                }}
                            />
                            <datalist id="available-genres">
                                {availableGenres.map(g => <option key={g.id} value={g.name} />)}
                            </datalist>
                        </div>
                        <input type="hidden" {...register("genres", { required: "Obligatorio" })} />
                        {errors.genres && <span className="error-text">{errors.genres.message}</span>}
                    </div>

                    <div className="addBook__group">
                        <label>Portada</label>
                        <div className="addBook__cover-modes">
                            <Button type="button" variant={coverMode === 'external' ? 'contained' : 'outlined'} onClick={() => { setCoverMode('external'); setValue("coverUrl", getBestCoverUrl(watchedIsbn, watch("coverUrl"))); }}>Portada generada por API</Button>
                            <Button type="button" variant={coverMode === 'uploaded' ? 'contained' : 'outlined'} onClick={() => setCoverMode('uploaded')}>Imagen subida</Button>
                            <Button type="button" variant={coverMode === 'file' ? 'contained' : 'outlined'} onClick={() => setCoverMode('file')}>Subir nueva imagen</Button>
                            <Button type="button" variant={coverMode === 'none' ? 'contained' : 'outlined'} onClick={() => { setCoverMode('none'); setValue("coverUrl", ""); setCoverFile(null); }}>Sin portada</Button>
                        </div>

                        {coverMode === 'uploaded' && (
                            <div className="addBook__cover-preview">
                                <img
                                    src={uploadedCoverUrl}
                                    alt="Portada actual"
                                    onError={(e) => { (e.target as HTMLImageElement).src = "/images/cover/fallback-front.png"; }}
                                />
                                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>Portada actualmente en uso</p>
                            </div>
                        )}

                        {coverMode === 'file' && (
                            <div className="addBook__group" style={{ marginTop: '1rem' }}>
                                <input
                                    type="file"
                                    id="editCoverFile"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0] || null;
                                        setCoverFile(f);
                                    }}
                                />
                                {coverFile && <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem' }}>{coverFile.name}</span>}
                            </div>
                        )}

                        {coverMode !== 'none' && coverMode !== 'uploaded' && (watch("coverUrl") || watchedIsbn) && (
                            <div className="addBook__cover-preview">
                                <img
                                    src={watch("coverUrl") || getBestCoverUrl(watchedIsbn)}
                                    alt="Vista previa"
                                    onError={(e) => { (e.target as HTMLImageElement).src = "/images/cover/fallback-front.png"; }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="addBook__row">
                        <div className="addBook__group">
                            <label htmlFor="publishers">Editorial</label>
                            <input
                                type="text"
                                id="publishers"
                                placeholder="Nombre de la editorial"
                                {...register("publishers")}
                            />
                        </div>

                        <div className="addBook__group">
                            <label htmlFor="publicationDate">Fecha de publicación</label>
                            <input
                                type="date"
                                id="publicationDate"
                                {...register("publicationDate")}
                            />
                        </div>

                        <div className="addBook__group">
                            <label htmlFor="pages">Páginas</label>
                            <input
                                type="number"
                                id="pages"
                                min="1"
                                {...register("pages", {
                                    validate: (value) => !value || parseInt(value, 10) > 0 || "Debe ser mayor a 0",
                                })}
                            />
                            {errors.pages && <span className="error-text">{errors.pages.message}</span>}
                        </div>
                    </div>

                    <div className="addBook__availability" style={{ borderTop: "1px solid #eee", paddingTop: "2rem", marginTop: "1rem" }}>
                        <h3>Disponibilidad en tu biblioteca *</h3>
                        <div className="addBook__availability-options">
                            <div className="addBook__group select-wrapper">
                                <label>Tipo de disponibilidad</label>
                                <select
                                    {...register("availabilityMode")}
                                    className="availability-select"
                                    onChange={(e) => {
                                        const val = e.target.value as any;
                                        setValue("availabilityMode", val);
                                        if (val === 'physical') {
                                            setValue("availability.physical", true);
                                            setValue("availability.digital", false);
                                        } else if (val === 'digital') {
                                            setValue("availability.physical", false);
                                            setValue("availability.digital", true);
                                        } else {
                                            setValue("availability.physical", true);
                                            setValue("availability.digital", true);
                                        }
                                    }}
                                >
                                    <option value="physical">Físico</option>
                                    <option value="digital">Digital</option>
                                    <option value="both">Ambos (Físico y Digital)</option>
                                </select>
                            </div>

                            {(watch("availabilityMode") === 'physical' || watch("availabilityMode") === 'both') && (
                                <div className="addBook__group physical-copies">
                                    <label htmlFor="physicalCopies">Cantidad de copias físicas *</label>
                                    <input
                                        type="number"
                                        id="physicalCopies"
                                        min="1"
                                        {...register("availability.physicalCopies", {
                                            required: (watch("availabilityMode") === 'physical' || watch("availabilityMode") === 'both') ? "La cantidad de copias es obligatoria" : false,
                                            min: { value: 1, message: "Debe haber al menos 1 copia" }
                                        })}
                                        placeholder="Ej: 5"
                                    />
                                    {errors.availability?.physicalCopies && <span className="error-text">{errors.availability.physicalCopies.message}</span>}
                                </div>
                            )}

                            {(platformIdLoaded || watch("availabilityMode") === 'digital' || watch("availabilityMode") === 'both') && (
                                <div className="addBook__group">
                                    <label htmlFor="platformId">Plataforma digital</label>
                                    <select
                                        id="platformId"
                                        {...register("platformId")}
                                        className="platform-select"
                                    >
                                        <option value="">Selecciona una plataforma</option>
                                        {platforms.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="addBook__submit">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <><CircularProgress size={20} sx={{ mr: 1 }} /> Guardando...</> : "Guardar Cambios"}
                        </Button>
                    </div>
                </form>
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </main>
    );
};

export default EditBook;
