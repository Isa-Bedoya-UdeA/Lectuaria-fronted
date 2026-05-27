import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CircularProgress } from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { useBookPublish } from "@/hooks/useBookPublish";
import { useGenres } from "@/hooks/useGenres";
import { useAuthors } from "@/hooks/useAuthors";
import { PATHS } from "@/constants/routes";
import { SITE_INFO } from "@/constants/siteInfo";
import Button from "@/components/UI/Button";
import useSEO from "@/hooks/useSEO";
import type { BookPublishRequest } from "@/types";
import "./addBook.scss";
import Toast, { type ToastType } from "@/components/UI/Toast";
import { platformService } from "@/services/platformService";

interface AddBookFormValues {
    isbn: string;
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

const AddBook = () => {
    const navigate = useNavigate();

    const { user, isAuthenticated } = useAuth();
    const {
        prefillData,
        isPrefillLoading,
        prefillError,
        isPublishing,
        publishError,
        fetchPrefill,
        publish,
        clearPrefill,
        clearErrors,
        publishWithCover,
    } = useBookPublish();

    const { genres: availableGenres } = useGenres();
    const { authors: availableAuthors } = useAuthors();

    const [isbnSearched, setIsbnSearched] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [coverMode, setCoverMode] = useState<'external' | 'manual' | 'file' | 'none'>('external');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [authorInput, setAuthorInput] = useState("");
    const [genreInput, setGenreInput] = useState("");
    const [platforms, setPlatforms] = useState<{ id: string; name: string }[]>([]);

    const {
        register,
        handleSubmit,
        watch,
        setValue,

        setError,
        clearErrors: clearFormErrors,
        formState: { errors }
    } = useForm<AddBookFormValues>({
        mode: "onBlur",
        defaultValues: {
            isbn: "",
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

    const watchedIsbn = watch("isbn");
    const watchedAvailabilityMode = watch("availabilityMode");

    // Redirect if not librarian
    useEffect(() => {
        if (!isAuthenticated || user?.userRole !== "LIBRARIAN") {
            navigate(PATHS.HOME);
        }
    }, [isAuthenticated, user?.userRole, navigate]);

    // Load platforms from backend
    useEffect(() => {
        platformService.getAll().then(data => {
            setPlatforms(data.map(p => ({ id: String(p.id), name: p.name })));
        }).catch(() => {
            // fallback hardcoded if API fails
            setPlatforms([
                { id: "1", name: "Amazon Kindle" },
                { id: "2", name: "Google Play Books" },
                { id: "3", name: "Apple Books" },
                { id: "4", name: "Kobo" },
            ]);
        });
    }, []);

    // Update availability object when mode changes
    useEffect(() => {
        if (watchedAvailabilityMode === 'physical') {
            setValue("availability.physical", true);
            setValue("availability.digital", false);
        } else if (watchedAvailabilityMode === 'digital') {
            setValue("availability.physical", false);
            setValue("availability.digital", true);
        } else {
            setValue("availability.physical", true);
            setValue("availability.digital", true);
        }
    }, [watchedAvailabilityMode, setValue]);

    useEffect(() => {
        console.log("AddBook useEffect - prefillData:", prefillData);
        if (prefillData) {
            setValue("title", prefillData.title || "", { shouldValidate: true });

            if (prefillData.authors?.length) {
                setValue("authors", prefillData.authors.join(", "), { shouldValidate: true });
            }

            if (prefillData.genres?.length) {
                setValue("genres", prefillData.genres, { shouldValidate: true });
            }

            if (prefillData.description) {
                setValue("description", prefillData.description, { shouldValidate: true });
            }

            if (prefillData.publishers?.length) {
                setValue("publishers", prefillData.publishers.join(", "), { shouldValidate: true });
            }

            if (prefillData.pages) {
                setValue("pages", prefillData.pages.toString(), { shouldValidate: true });
            }

            if (prefillData.publicationDate) {
                const date = new Date(prefillData.publicationDate);
                if (!isNaN(date.getTime())) {
                    setValue("publicationDate", date.toISOString().split("T")[0], { shouldValidate: true });
                }
            }

            if (prefillData.coverUrl && !prefillData.coverUrl.includes("/id/-1-")) {
                setValue("coverUrl", prefillData.coverUrl, { shouldValidate: true });
                setCoverMode('external');
                console.log("AddBook useEffect - Cover URL encontrada:", prefillData.coverUrl);
            } else {
                // No cover URL found or invalid URL (-1) - default to manual mode with empty field
                setValue("coverUrl", "", { shouldValidate: true });
                setCoverMode('manual');
                console.log("AddBook useEffect - No Cover URL válida encontrada, usando modo manual");
            }

            clearErrors();
        }
    }, [prefillData, setValue, clearErrors]);

    // SEO
    useSEO({
        title: `Agregar Libro | ${SITE_INFO.name}`,
        description: `Agrega un nuevo libro al catálogo de tu biblioteca en ${SITE_INFO.name}. Busca por ISBN y completa la información.`,
        keywords: "agregar libro, publicar libro, biblioteca, catálogo, ISBN, Medellín"
    });

    // Validate ISBN format
    const isValidISBN = useCallback((isbn: string): boolean | string => {
        if (/[a-wyz]/i.test(isbn)) {
            return "Formato de ISBN incorrecto. No debe contener letras.";
        }
        const clean = isbn.replace(/[-.\s]/g, "");
        if (/[^0-9xX]/i.test(clean)) {
            return "Formato de ISBN incorrecto.";
        }
        return clean.length === 10 || clean.length === 13 || "ISBN debe tener 10 o 13 dígitos";
    }, []);

    // Handle ISBN search
    const handleSearchISBN = async () => {
        const validationResult = isValidISBN(watchedIsbn);
        if (validationResult !== true) {
            setError("isbn", { type: "manual", message: typeof validationResult === 'string' ? validationResult : "ISBN inválido" });
            return;
        }

        if (!watchedIsbn) {
            setError("isbn", { type: "manual", message: "Ingresa un ISBN para buscar" });
            return;
        }

        const cleanIsbn = watchedIsbn.replace(/[-.\s]/g, "");
        const isbnNumber = parseInt(cleanIsbn.replace(/[^0-9]/g, ""), 10);

        setIsbnSearched(true);
        setValue("isbn", cleanIsbn);
        clearFormErrors("isbn");
        clearErrors();

        try {
            await fetchPrefill(isbnNumber);
        } catch (err) {
            // Error handling via hook
        }
    };

    // Helper: Get external cover URL for preview
    const getExternalCoverUrl = (isbn: string): string => {
        const clean = isbn.replace(/[^0-9]/g, "");
        return `https://covers.openlibrary.org/b/isbn/${clean}-L.jpg`;
    };

    // Helper: Get best available cover URL (backend or generated)
    const getBestCoverUrl = (isbn: string, backendCoverUrl?: string | null): string => {
        // Priorizar backend coverUrl, sino generar con ISBN
        if (backendCoverUrl && backendCoverUrl.trim() !== "") {
            return backendCoverUrl;
        }
        return getExternalCoverUrl(isbn);
    };

    // Handle form submission
    const onSubmit = async (formValues: AddBookFormValues) => {
        if (!user?.libraryId) {
            alert("Tu biblioteca no tiene un ID asignado. Contacta al administrador.");
            return;
        }

        // Transform form values to API request format
        const authorsList = formValues.authors
            .split(",")
            .map((a: string) => a.trim())
            .filter((a: string) => a.length > 0);

        const publishersList = formValues.publishers
            .split(",")
            .map((p: string) => p.trim())
            .filter((p: string) => p.length > 0);

        const genreNames = formValues.genres;

        const publishData: BookPublishRequest = {
            isbn: parseInt(formValues.isbn.replace(/[^0-9]/g, ""), 10),
            title: formValues.title.trim(),
            authors: authorsList,
            description: formValues.description.trim() || undefined,
            genres: genreNames,
            coverUrl: formValues.coverUrl.trim() || undefined,
            publishers: publishersList,
            publicationDate: formValues.publicationDate || undefined,
            pages: formValues.pages ? parseInt(formValues.pages, 10) : undefined,
            availability: {
                physical: formValues.availability.physical,
                digital: formValues.availability.digital,
                physicalCopies: formValues.availability.physical ? formValues.availability.physicalCopies || 1 : undefined,
            },
            availabilityMode: formValues.availabilityMode,
            platformId: formValues.platformId ? parseInt(formValues.platformId, 10) : undefined,
            libraryId: user.libraryId, // Usar el libraryId del usuario autenticado
        };

        try {
            if (coverMode === 'file' && coverFile) {
                await publishWithCover(publishData, coverFile);
            } else {
                await publish(publishData);
            }
            setToast({ message: "Libro agregado exitosamente", type: "success" });

            setTimeout(() => {
                navigate(PATHS.MY_LIBRARY);
            }, 2500);
        } catch (err) {
            // Error handled by hook via publishError
        }
    };

    if (!isAuthenticated || user?.userRole !== "LIBRARIAN") {
        navigate(PATHS.HOME);
        return (
            <main className="addBook">
                <div className="addBook__container">
                    <Toast message="Debes iniciar sesión como biblioteca para agregar libros." type="warning" onClose={() => {}} />
                    <Link to={PATHS.SIGNIN}>
                        <Button>Iniciar Sesión</Button>
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="addBook">
            <div className="addBook__container">
                {/* Back button */}
                <Link to={PATHS.MY_LIBRARY} className="addBook__back">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m7 7l-7-7l7-7" />
                    </svg>
                    Regresar a Mi biblioteca
                </Link>

                {/* Header */}
                <section className="addBook__header">
                    <h1>Agregar Nuevo Libro</h1>
                    <p>Busca por ISBN y completa la información para publicar en tu biblioteca</p>
                </section>

                {/* Error Messages */}
                {prefillError && !errors.isbn && (
                    <div className="error-text" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        {prefillError}
                    </div>
                )}
                {publishError && (
                    <div className="error-text" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                        {publishError}
                    </div>
                )}

                <form className="addBook__form" onSubmit={handleSubmit(onSubmit)}>
                    {/* ISBN Search Section */}
                    <section className="addBook__isbn-section">
                        <div className="addBook__isbn-group">
                            <div className="addBook__isbn-field-wrapper">
                                <label htmlFor="isbn">ISBN *</label>
                                <div className="addBook__isbn-input-row">
                                    <input
                                        type="text"
                                        id="isbn"
                                        placeholder="Ej: 9780060883287"
                                        disabled={isbnSearched}
                                        readOnly={isbnSearched}
                                        {...register("isbn", {
                                            required: "El ISBN es obligatorio",
                                            validate: (value) => isValidISBN(value),
                                        })}
                                    />

                                    {!isbnSearched ? (
                                        <Button
                                            type="button"
                                            variant="outlined"
                                            onClick={handleSearchISBN}
                                            disabled={isPrefillLoading}
                                            className="search-btn"
                                        >
                                            {isPrefillLoading ? (
                                                <CircularProgress size={20} />
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="11" cy="11" r="8"></circle>
                                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                                    </svg>
                                                    <span>Buscar</span>
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="outlined"
                                            className="change-isbn-btn"
                                            onClick={() => {
                                                setIsbnSearched(false);
                                                clearPrefill();
                                                setValue("isbn", "");
                                            }}
                                        >
                                            Cambiar ISBN
                                        </Button>
                                    )}
                                </div>
                            </div>
                            {errors.isbn && <span className="error-text">{errors.isbn.message}</span>}
                        </div>
                    </section>

                    {isbnSearched && (
                        <>
                            {isPrefillLoading ? (
                                <Toast
                                    message="Cargando información del libro..."
                                    type="info"
                                    onClose={() => setToast(null)}
                                />
                            ) : prefillData?.bookExistsInUserLibrary ? (
                                <Toast
                                    message="Este libro ya está registrado en tu biblioteca. No puedes modificar la disponibilidad desde aquí."
                                    type="error"
                                    onClose={() => setToast(null)}
                                />
                            ) : prefillData?.bookExistsInCatalog ? (
                                <Toast
                                    message="Este libro ya existe en el catálogo de Lectuaria. Solo necesitas confirmar la disponibilidad en tu biblioteca."
                                    type="warning"
                                    onClose={() => setToast(null)}
                                />
                            ) : prefillData?.title ? (
                                <Toast
                                    message="¡Hemos encontrado los detalles del libro! Hemos prellenado algunos campos. Por favor, completa la descripción y disponibilidad."
                                    type="success"
                                    onClose={() => setToast(null)}
                                />
                            ) : prefillData === null ? (
                                <Toast
                                    message="No pudimos encontrar información de tu libro, pero puedes rellenar los datos tú mismo."
                                    type="info"
                                    onClose={() => setToast(null)}
                                />
                            ) : null}
                        </>
                    )}

                    {/* Main Form - shown after ISBN search */}
                    {isbnSearched && !prefillData?.bookExistsInUserLibrary && (
                        <>
                            {!prefillData?.bookExistsInCatalog && (
                                <>
                                    {/* Title & Authors */}
                                    <div className="addBook__row">
                                        <div className="addBook__group">
                                            <label htmlFor="title">Título *</label>
                                            <input
                                                type="text"
                                                id="title"
                                                {...register("title", { required: "El título es obligatorio" })}
                                                placeholder="Título del libro"
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
                                                        ))
                                                    }
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
                                                    {availableAuthors.map(a => (
                                                        <option key={a.id} value={a.name} />
                                                    ))}
                                                </datalist>
                                            </div>
                                            <input type="hidden" {...register("authors", { required: "Al menos un autor es obligatorio" })} />
                                            {errors.authors && <span className="error-text">{errors.authors.message}</span>}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="addBook__group">
                                        <label htmlFor="description">Descripción *</label>
                                        <textarea
                                            id="description"
                                            rows={4}
                                            {...register("description", { required: "La descripción es obligatoria" })}
                                            placeholder="Describe el contenido del libro..."
                                        />
                                        {errors.description && <span className="error-text">{errors.description.message}</span>}
                                        <small className="hint">La descripción se muestra si está disponible en español. Si no aparece, por favor escríbela manualmente.</small>
                                    </div>

                                    {/* Genres */}
                                    <div className="addBook__group">
                                        <label>Géneros *</label>
                                        <div className="tag-input-container">
                                            <div className="tag-list">
                                                {(watch("genres") || [])
                                                    .map((genre, idx) => (
                                                        <span key={idx} className="tag-pill">
                                                            {genre}
                                                            <button type="button" onClick={() => {
                                                                const currentGenres = [...watch("genres")];
                                                                currentGenres.splice(idx, 1);
                                                                setValue("genres", currentGenres, { shouldValidate: true });
                                                            }}>×</button>
                                                        </span>
                                                    ))
                                                }
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
                                                {availableGenres.map(g => (
                                                    <option key={g.id} value={g.name} />
                                                ))}
                                            </datalist>
                                        </div>
                                        <input 
                                            type="hidden" 
                                            {...register("genres", { 
                                                required: "Al menos un género es obligatorio",
                                                validate: (value) => {
                                                    if (!value || value.length === 0) {
                                                        return "Al menos un género es obligatorio";
                                                    }
                                                    return true;
                                                }
                                            })} 
                                        />
                                        {errors.genres && <span className="error-text">{errors.genres.message}</span>}
                                    </div>

                                    {/* Cover URL */}
                                    <div className="addBook__group">
                                        <label>Portada</label>

                                        {/* Cover mode selector */}
                                        <div className="addBook__cover-modes">
                                            <Button
                                                type="button"
                                                variant={coverMode === 'external' ? 'contained' : 'outlined'}
                                                onClick={() => {
                                                    setCoverMode('external');
                                                    if (watchedIsbn) {
                                                        setValue("coverUrl", getBestCoverUrl(watchedIsbn, prefillData?.coverUrl));
                                                    }
                                                }}
                                            >
                                                Portada encontrada
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={coverMode === 'manual' ? 'contained' : 'outlined'}
                                                onClick={() => setCoverMode('manual')}
                                            >
                                                URL Personal
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={coverMode === 'file' ? 'contained' : 'outlined'}
                                                onClick={() => setCoverMode('file')}
                                            >
                                                Subir imagen
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={coverMode === 'none' ? 'contained' : 'outlined'}
                                                onClick={() => {
                                                    setCoverMode('none');
                                                    setValue("coverUrl", "");
                                                    setCoverFile(null);
                                                }}
                                            >
                                                Sin portada
                                            </Button>
                                        </div>

                                        {coverMode === 'manual' && (
                                            <div className="addBook__group" style={{ marginTop: '1rem' }}>
                                                <input
                                                    type="url"
                                                    placeholder="https://ejemplo.com/portada.jpg"
                                                    {...register("coverUrl")}
                                                />
                                            </div>
                                        )}

                                        {coverMode === 'file' && (
                                            <div className="addBook__group" style={{ marginTop: '1rem' }}>
                                                <input
                                                    type="file"
                                                    id="coverFile"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    onChange={(e) => {
                                                        const f = e.target.files?.[0] || null;
                                                        setCoverFile(f);
                                                    }}
                                                />
                                                {coverFile && <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem' }}>{coverFile.name}</span>}
                                            </div>
                                        )}

                                        {coverMode === 'external' && watchedIsbn && (
                                            <div className="addBook__cover-preview">
                                                <img
                                                    src={watch("coverUrl") || getBestCoverUrl(watchedIsbn, prefillData?.coverUrl)}
                                                    alt="Vista previa"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = "/images/cover/fallback-front.png";
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Publishers, Date, Pages */}
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
                                        </div>
                                    </div>
                                </>)}

                            {/* Availability Section */}
                            <section className="addBook__availability">
                                <h3>Disponibilidad en tu biblioteca *</h3>

                                <div className="addBook__availability-options">
                                    <div className="addBook__group select-wrapper">
                                        <label>Tipo de disponibilidad</label>
                                        <select
                                            {...register("availabilityMode")}
                                            className="availability-select"
                                        >
                                            <option value="physical">Físico</option>
                                            <option value="digital">Digital</option>
                                            <option value="both">Ambos (Físico y Digital)</option>
                                        </select>
                                    </div>
                                    {(watchedAvailabilityMode === 'physical' || watchedAvailabilityMode === 'both') && (
                                        <div className="addBook__group physical-copies">
                                            <label htmlFor="physicalCopies">Cantidad de copias físicas *</label>
                                            <input
                                                type="number"
                                                id="physicalCopies"
                                                min="1"
                                                {...register("availability.physicalCopies", {
                                                    required: (watchedAvailabilityMode === 'physical' || watchedAvailabilityMode === 'both') ? "La cantidad de copias es obligatoria" : false,
                                                    min: { value: 1, message: "Debe haber al menos 1 copia" }
                                                })}
                                                placeholder="Ej: 5"
                                            />
                                            {errors.availability?.physicalCopies && <span className="error-text">{errors.availability.physicalCopies.message}</span>}
                                        </div>
                                    )}

                                    {(watchedAvailabilityMode === 'digital' || watchedAvailabilityMode === 'both') && (
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
                            </section>

                            {/* Submit Button */}
                            <div className="addBook__submit">
                                <Button
                                    type="submit"
                                    disabled={isPublishing}
                                >
                                    {isPublishing ? (
                                        <>
                                            <CircularProgress size={20} sx={{ mr: 1 }} />
                                            Publicando...
                                        </>
                                    ) : (
                                        "Publicar Libro"
                                    )}
                                </Button>
                            </div>
                        </>

                    )}
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

export default AddBook;