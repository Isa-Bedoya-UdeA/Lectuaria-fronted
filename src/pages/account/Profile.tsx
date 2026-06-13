import { Box, Tab, Tabs, Avatar } from "@mui/material";
import { cyan } from "@mui/material/colors";
import "./profile.scss";
import Toast, { type ToastType } from "@/components/UI/Toast";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import Button from "@/components/UI/Button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { PATHS } from "@/constants/routes";
import { SITE_INFO } from "@/constants/siteInfo";
import useSEO from "@/hooks/useSEO";
import type { ProfileUpdateRequest } from "@/types/auth";
import { useFriendship } from "@/hooks/useFriendship";
import FriendCard from "../../components/Cards/FriendCard";
import { useUserLists } from "@/hooks/useUserLists";
import type { UserSearchResponseDTO, ReadingStatisticsDTO, SocialStatisticsDTO } from "@/types";
import type { NotificationPreference } from "@/types/notifications";
import { getNotificationPreferences, resetNotificationPreferences, updateNotificationPreference } from "@/services/notificationService";
import { getPrivacySettings, updatePrivacySettings } from "@/services/privacyService";
import { getReadingStatistics, getSocialStatistics } from "@/services/userProfileService";
import type { Visibility } from "@/types/userProfile";
import api from "@/config/api";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    className?: string;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, className, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            className={className}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const ReadingStatisticsSection = ({ usernameSlug }: { usernameSlug: string }) => {
    const [stats, setStats] = useState<ReadingStatisticsDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getReadingStatistics(usernameSlug);
                setStats(data);
            } catch (err) {
                console.error("Error fetching reading stats:", err);
                setError("No se pudieron cargar las estadísticas de lectura.");
            } finally {
                setLoading(false);
            }
        };

        if (usernameSlug) {
            fetchStats();
        }
    }, [usernameSlug]);

    if (loading) {
        return <div className="profile__stats-loading">Cargando tus estadísticas de lectura...</div>;
    }

    if (error || !stats) {
        return <div className="profile__stats-error">{error || "No hay estadísticas disponibles."}</div>;
    }

    const { totalBooksRead, reviewsCount, mostReadGenres, booksReadByMonth, yearComparison } = stats;
    const maxBooks = booksReadByMonth && booksReadByMonth.length > 0
        ? Math.max(...booksReadByMonth.map(m => m.booksRead), 1)
        : 1;

    return (
        <div className="reading-stats">
            <h2 className="reading-stats__title">Mi Actividad de Lectura</h2>
            <p className="reading-stats__subtitle">
                Análisis y métricas de tus libros leídos, calificaciones e intereses literarios.
            </p>

            <div className="reading-stats__grid">
                <div className="reading-stats__card">
                    <div className="reading-stats__card-icon reading-stats__card-icon--primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                    </div>
                    <div className="reading-stats__card-info">
                        <span className="reading-stats__card-value">{totalBooksRead}</span>
                        <span className="reading-stats__card-label">Libros Leídos</span>
                    </div>
                </div>

                <div className="reading-stats__card">
                    <div className="reading-stats__card-icon reading-stats__card-icon--secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                    </div>
                    <div className="reading-stats__card-info">
                        <span className="reading-stats__card-value">{reviewsCount ?? 0}</span>
                        <span className="reading-stats__card-label">Reseñas Escritas</span>
                    </div>
                </div>

                {yearComparison && (
                    <div className="reading-stats__card reading-stats__card--full">
                        <div className="reading-stats__card-icon reading-stats__card-icon--success">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="20" x2="18" y2="10" />
                                <line x1="12" y1="20" x2="12" y2="4" />
                                <line x1="6" y1="20" x2="6" y2="14" />
                            </svg>
                        </div>
                        <div className="reading-stats__card-info">
                            <div className="reading-stats__comparison-text">
                                Comparación anual: <strong>{yearComparison.currentYearBooks} libros</strong> en {yearComparison.currentYear} vs <strong>{yearComparison.previousYearBooks} libros</strong> en {yearComparison.previousYear}.
                            </div>
                            <div className={`reading-stats__comparison-badge ${yearComparison.difference >= 0 ? 'positive' : 'negative'}`}>
                                {yearComparison.difference >= 0 ? (
                                    <span>+{yearComparison.difference} libros que el año pasado 🎉</span>
                                ) : (
                                    <span>{yearComparison.difference} libros que el año pasado</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="reading-stats__details">
                <div className="reading-stats__section">
                    <h3 className="reading-stats__section-title">Mis Géneros Preferidos</h3>
                    {mostReadGenres && mostReadGenres.length > 0 ? (
                        <div className="reading-stats__genres-list">
                            {mostReadGenres.map((genre) => {
                                const maxCount = Math.max(...mostReadGenres.map(g => g.count), 1);
                                const percentage = (genre.count / maxCount) * 100;
                                return (
                                    <div key={genre.genreId} className="reading-stats__genre-item">
                                        <div className="reading-stats__genre-info">
                                            <span className="reading-stats__genre-name">{genre.genreName}</span>
                                            <span className="reading-stats__genre-count">{genre.count} {genre.count === 1 ? 'libro' : 'libros'}</span>
                                        </div>
                                        <div className="reading-stats__progress-bar-bg">
                                            <div
                                                className="reading-stats__progress-bar-fill"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="reading-stats__empty">Aún no hay suficientes lecturas registradas para clasificar tus géneros.</p>
                    )}
                </div>

                <div className="reading-stats__section">
                    <h3 className="reading-stats__section-title">Progreso Mensual</h3>
                    {booksReadByMonth && booksReadByMonth.length > 0 ? (
                        <div className="reading-stats__monthly-list">
                            {booksReadByMonth.map((item, idx) => (
                                <div key={idx} className="reading-stats__monthly-item">
                                    <span className="reading-stats__monthly-month">{item.month}</span>
                                    <div className="reading-stats__monthly-data">
                                        <div className="reading-stats__monthly-bar-wrapper">
                                            <div
                                                className={`reading-stats__monthly-bar${item.booksRead === 0 ? ' reading-stats__monthly-bar--zero' : ''}`}
                                                style={{
                                                    width: `${(item.booksRead / maxBooks) * 100}%`
                                                }}
                                            />
                                        </div>
                                        <span className="reading-stats__monthly-count">
                                            {item.booksRead} {item.booksRead === 1 ? 'libro' : 'libros'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="reading-stats__empty">Aún no hay registro de progreso mensual de lectura.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const SocialActivitiesSection = ({ usernameSlug }: { usernameSlug: string }) => {
    const [stats, setStats] = useState<SocialStatisticsDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getSocialStatistics(usernameSlug);
                setStats(data);
            } catch (err) {
                console.error("Error fetching social stats:", err);
                setError("No se pudieron cargar las estadísticas sociales.");
            } finally {
                setLoading(false);
            }
        };

        if (usernameSlug) {
            fetchStats();
        }
    }, [usernameSlug]);

    if (loading) {
        return <div className="profile__stats-loading">Cargando tus estadísticas sociales...</div>;
    }

    if (error || !stats) {
        return <div className="profile__stats-error">{error || "No hay estadísticas disponibles."}</div>;
    }

    return (
        <div className="social-stats">
            <h2 className="social-stats__title">Mi Actividad Social</h2>
            <p className="social-stats__subtitle">
                Tu presencia en la comunidad lectora: amigos, listas compartidas y libros intercambiados.
            </p>

            <div className="social-stats__grid">
                <div className="social-stats__card">
                    <div className="social-stats__card-icon social-stats__card-icon--primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <div className="social-stats__card-info">
                        <span className="social-stats__card-value">{stats.friendsCount}</span>
                        <span className="social-stats__card-label">Amigos</span>
                    </div>
                </div>

                <div className="social-stats__card">
                    <div className="social-stats__card-icon social-stats__card-icon--secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="8" y1="6" x2="21" y2="6" />
                            <line x1="8" y1="12" x2="21" y2="12" />
                            <line x1="8" y1="18" x2="21" y2="18" />
                            <line x1="3" y1="6" x2="3.01" y2="6" />
                            <line x1="3" y1="12" x2="3.01" y2="12" />
                            <line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                    </div>
                    <div className="social-stats__card-info">
                        <span className="social-stats__card-value">{stats.listsSharedByFriends}</span>
                        <span className="social-stats__card-label">Listas Recibidas de Amigos</span>
                    </div>
                </div>

                <div className="social-stats__card">
                    <div className="social-stats__card-icon social-stats__card-icon--success">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="8" y1="6" x2="21" y2="6" />
                            <line x1="8" y1="12" x2="21" y2="12" />
                            <line x1="8" y1="18" x2="21" y2="18" />
                            <line x1="3" y1="6" x2="3.01" y2="6" />
                            <line x1="3" y1="12" x2="3.01" y2="12" />
                            <line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                    </div>
                    <div className="social-stats__card-info">
                        <span className="social-stats__card-value">{stats.listsIShared}</span>
                        <span className="social-stats__card-label">Listas que Compartí</span>
                    </div>
                </div>

                <div className="social-stats__card">
                    <div className="social-stats__card-icon social-stats__card-icon--purple">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                    </div>
                    <div className="social-stats__card-info">
                        <span className="social-stats__card-value">{stats.booksSharedWithFriends}</span>
                        <span className="social-stats__card-label">Libros Compartidos con Amigos</span>
                    </div>
                </div>

                <div className="social-stats__card">
                    <div className="social-stats__card-icon social-stats__card-icon--highlight">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                    </div>
                    <div className="social-stats__card-info">
                        <span className="social-stats__card-value">{stats.booksSharedByFriends}</span>
                        <span className="social-stats__card-label">Libros Recibidos de Amigos</span>
                    </div>
                </div>
            </div>

            {stats.booksSharedWithFriends === 0 && stats.booksSharedByFriends === 0 &&
             stats.listsSharedByFriends === 0 && stats.listsIShared === 0 && (
                <p className="social-stats__empty">
                    Aún no has intercambiado libros ni listas con nadie. ¡Comparte tus lecturas favoritas con tus amigos!
                </p>
            )}
        </div>
    );
};

// Helper function to compute tab value from URL params
const getTabFromParams = (searchParams: URLSearchParams, userRole?: string): number => {
    const tab = searchParams.get('tab');
    if (tab === 'requests') return 3;
    if (tab === 'friends' || tab === 'amigos') return 2;
    if (tab === 'notifications' || tab === 'settings') return 1;
    if ((tab === 'estadisticas' || tab === 'statistics') && userRole === 'READER') return 4;
    if ((tab === 'social' || tab === 'actividad') && userRole === 'READER') return 5;
    return 0;
};

const Profile = () => {
    const { user, logout, updateProfile, isLoading, error, clearError } = useAuth();
    const [searchParams] = useSearchParams();
    const [value, setValue] = useState<number>(() => getTabFromParams(searchParams, user?.userRole));
    const [isEditing, setIsEditing] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
    const [preferencesLoading, setPreferencesLoading] = useState(false);

    const [privacySettings, setPrivacySettings] = useState<{
        profileVisibility: Visibility;
        reviewsVisibility: Visibility;
        readingListsVisibility: Visibility;
        readingListsActivityVisibility: Visibility;
        friendsVisibility: Visibility;
    } | null>(null);
    const [privacyLoading, setPrivacyLoading] = useState(false);
    const [privacySaving, setPrivacySaving] = useState(false);
    const [privacySuccess, setPrivacySuccess] = useState(false);
    const [privacyError, setPrivacyError] = useState<string | null>(null);

    const { friends, requests, searchResults, loading, friendsLoaded, requestsLoaded, loadFriends, loadPendingRequests, searchUsers, sendRequest, acceptRequest, rejectRequest, cancelRequest, removeFriend } = useFriendship();
    const { lists, fetchLists } = useUserLists({ autoFetch: false });

    // Handle tab changes from URL query param (for browser back/forward navigation)
    useEffect(() => {
        setValue(getTabFromParams(searchParams, user?.userRole));
    }, [searchParams, user?.userRole]);

    // Load data when user is available
    useEffect(() => {
        if (user) {
            loadFriends();
            loadPendingRequests();
            fetchLists();
        }
    }, [user, loadFriends, loadPendingRequests, fetchLists]);

    useEffect(() => {
        if (user && value === 1) {
            fetchNotificationPreferences();
            fetchPrivacySettings();
        }
    }, [user, value]);

    const fetchNotificationPreferences = async () => {
        setPreferencesLoading(true);
        try {
            const data = await getNotificationPreferences();
            setPreferences(data);
        } catch (error) {
            console.error("Error fetching notification preferences:", error);
        } finally {
            setPreferencesLoading(false);
        }
    };

    const fetchPrivacySettings = async () => {
        setPrivacyLoading(true);
        try {
            const data = await getPrivacySettings();
            setPrivacySettings({
                profileVisibility: data.profileVisibility,
                reviewsVisibility: data.reviewsVisibility,
                readingListsVisibility: data.readingListsVisibility,
                readingListsActivityVisibility: data.readingListsActivityVisibility,
                friendsVisibility: data.friendsVisibility
            });
        } catch (error) {
            console.error("Error fetching privacy settings:", error);
        } finally {
            setPrivacyLoading(false);
        }
    };

    const handleResetPreferences = async () => {
        try {
            await resetNotificationPreferences();
            await fetchNotificationPreferences();
        } catch (error) {
            console.error("Error resetting notification preferences:", error);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length > 0) {
                searchUsers(searchQuery);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, searchUsers]);

    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<ProfileUpdateRequest>({
        defaultValues: {
            username: user?.username || "",
            photoUrl: user?.photoUrl || "",
            biography: user?.biography || ""
        }
    });

    // Change password state
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [changePasswordLoading, setChangePasswordLoading] = useState(false);
    const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
    const [changePasswordSuccess, setChangePasswordSuccess] = useState(false);
    const [changePasswordForm, setChangePasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Reset form when user changes or editing starts
    useEffect(() => {
        if (isEditing && user) {
            reset({
                username: user.username || "",
                photoUrl: user.photoUrl || "",
                biography: user.biography || ""
            });
        }
    }, [isEditing, user, reset]);

    // Map tab index to URL
    const getTabUrl = (tabIndex: number): string => {
        switch (tabIndex) {
            case 1: return `${PATHS.PROFILE}?tab=settings`;
            case 2: return `${PATHS.PROFILE}?tab=amigos`;
            case 3: return `${PATHS.PROFILE}?tab=requests`;
            case 4: return `${PATHS.PROFILE}?tab=estadisticas`;
            case 5: return `${PATHS.PROFILE}?tab=social`;
            default: return PATHS.PROFILE;
        }
    };

    const handleChange = (_: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        // Update URL when tab changes. Se usa navigate (no pushState) para que
        // React Router notifique a useLocation() en otros componentes (ej. el
        // popover del Header), evitando que el resaltado del item activo quede
        // desincronizado al cambiar de tab.
        const newUrl = getTabUrl(newValue);
        navigate(newUrl);
    };

    const handleLogout = () => {
        logout();
        navigate(PATHS.HOME);
    };

    const onSubmit = async (data: ProfileUpdateRequest) => {
        try {
            await updateProfile(data);
            setToast({ message: "Perfil actualizado exitosamente", type: "success" });
            setIsEditing(false);
        } catch {
            // Error handled by useAuth hook
        }
    };

    useSEO({
        title: `${user?.fullName || "Mi Perfil"} | ${SITE_INFO.name}`,
        description: `Perfil de ${user?.fullName} en ${SITE_INFO.name}. Mira sus listas, libros y conecta con otros lectores.`,
        keywords: "perfil, libros, comunidad, listas de lectura, Medellín"
    });

    return (
        <main className="profile">
            <div className="profile__container">
                {isEditing ? (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <section className="profile__userCard profile__userCard--edit">
                            <article className="profile__avatar-edit">
                                <div className="avatar-wrapper">
                                    <img src={watch("photoUrl") || user?.photoUrl} alt="Avatar preview" />
                                    <label htmlFor="avatar-url-input" className="pencil-overlay">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1l1-4Z" /></g></svg>
                                    </label>
                                </div>
                                <input
                                    id="avatar-url-input"
                                    type="text"
                                    className="profile__edit-input"
                                    placeholder="URL de la imagen de perfil"
                                    {...register("photoUrl")}
                                />
                            </article>
                            <article className="profile__info-edit">
                                <div className="profile__edit-group">
                                    <label>Nombre de usuario</label>
                                    <input
                                        type="text"
                                        className="profile__edit-input"
                                        placeholder="Tu nombre de usuario"
                                        {...register("username", {
                                            required: "El nombre de usuario es requerido",
                                            minLength: { value: 3, message: "Mínimo 3 caracteres" }
                                        })}
                                    />
                                    {errors.username && <span className="error-text">{errors.username.message}</span>}
                                </div>
                                <div className="profile__edit-group">
                                    <label>Biografía</label>
                                    <textarea
                                        className="profile__edit-textarea"
                                        placeholder="Cuéntanos algo sobre ti..."
                                        maxLength={500}
                                        {...register("biography")}
                                    />
                                    <small>{watch("biography")?.length || 0}/500</small>
                                </div>
                                <div className="profile__edit-actions">
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? "Guardando..." : "Guardar"}
                                    </Button>
                                    <Button type="button" variant="outlined" onClick={() => setIsEditing(false)} disabled={isLoading}>
                                        Cancelar
                                    </Button>
                                </div>
                            </article>
                        </section>
                    </form>
                ) : (
                    <section className="profile__userCard">
                        <article className="profile__avatar">
                            <Avatar
                                sx={{ bgcolor: cyan[500], width: 80, height: 80 }}
                                alt={user?.fullName || "User Avatar"}
                                src={user?.photoUrl || undefined}
                            >
                                {user ? user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) : "U"}
                            </Avatar>
                        </article>
                        <article className="profile__info">
                            <h1 className="profile__name">{user?.fullName}</h1>
                            <p className="profile__username">@{user?.username}</p>
                            {user?.biography && <p className="profile__bio">{user.biography}</p>}
                            <div className="profile__stats">
                                <div className="profile__lists" onClick={() => navigate("/lists")} style={{ cursor: 'pointer' }}>
                                    <h3>{lists.length}</h3>
                                    <p>Listas</p>
                                </div>
                                <div
                                    className="profile__friends"
                                    onClick={() => navigate(`${PATHS.PROFILE}?tab=friends`)}
                                    style={{ cursor: 'pointer' }}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            navigate(`${PATHS.PROFILE}?tab=friends`);
                                        }
                                    }}
                                >
                                    <h3>{friends.length}</h3>
                                    <p>Amigos</p>
                                </div>
                            </div>
                        </article>
                    </section>
                )}
                <section className="profile__tabs">
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            aria-label="profile tabs"
                        >
                            <Tab label="General" {...a11yProps(0)} />
                            <Tab label="Configuración" {...a11yProps(1)} />
                            <Tab label={`Amigos (${friends.length})`} {...a11yProps(2)} />
                            <Tab label={`Solicitudes (${requests.length})`} {...a11yProps(3)} />
                            {user?.userRole === "READER" && (
                                <Tab label="Estadísticas de Lectura" {...a11yProps(4)} />
                            )}
                            {user?.userRole === "READER" && (
                                <Tab label="Actividad Social" {...a11yProps(5)} />
                            )}
                        </Tabs>
                    </Box>
                    <CustomTabPanel value={value} index={0} className="profile__general__tab">
<button
                            className="profile__edit_btn"
                            onClick={() => setIsEditing(true)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0a2.34 2.34 0 0 0 3.319 1.915a2.34 2.34 0 0 1 2.33 4.033a2.34 2.34 0 0 0 0 3.831a2.34 2.34 0 0 1-2.33 4.033a2.34 2.34 0 0 0-3.319 1.915a2.34 2.34 0 0 1-4.659 0a2.34 2.34 0 0 0-3.32-1.915a2.34 2.34 0 0 1-2.33-4.033a2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" /><circle cx="12" cy="12" r="3" /></g></svg>
                            <span>Editar perfil</span>
                        </button>
                        <button
                            className="profile__change-password_btn"
                            onClick={() => setShowChangePassword(!showChangePassword)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></g></svg>
                            <span>Cambiar contraseña</span>
                        </button>
                        {showChangePassword && (
                            <div className="profile__change-password-form">
                                <h3>Cambiar Contraseña</h3>
                                {changePasswordSuccess && (
                                    <p className="profile__change-password-success">¡Contraseña actualizada exitosamente!</p>
                                )}
                                {changePasswordError && (
                                    <p className="profile__change-password-error">{changePasswordError}</p>
                                )}
                                <div className="profile__change-password-group">
                                    <label>Contraseña actual</label>
                                    <div className="profile__passwordWrapper">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            placeholder="********"
                                            value={changePasswordForm.currentPassword}
                                            onChange={(e) => setChangePasswordForm({ ...changePasswordForm, currentPassword: e.target.value })}
                                        />
                                        <button type="button" className="auth__passwordToggle" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                            {showCurrentPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 18l-.722-3.25M2 8a10.645 10.645 0 0 0 20 0m-2 7l-1.726-2.05M4 15l1.726-2.05M9 18l.722-3.25" /></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M2.062 12.348a1 1 0 0 1 0-.696a10.75 10.75 0 0 1 19.876 0a1 1 0 0 1 0 .696a10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></g></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="profile__change-password-group">
                                    <label>Nueva contraseña</label>
                                    <div className="profile__passwordWrapper">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="********"
                                            value={changePasswordForm.newPassword}
                                            onChange={(e) => setChangePasswordForm({ ...changePasswordForm, newPassword: e.target.value })}
                                        />
                                        <button type="button" className="auth__passwordToggle" onClick={() => setShowNewPassword(!showNewPassword)}>
                                            {showNewPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 18l-.722-3.25M2 8a10.645 10.645 0 0 0 20 0m-2 7l-1.726-2.05M4 15l1.726-2.05M9 18l.722-3.25" /></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M2.062 12.348a1 1 0 0 1 0-.696a10.75 10.75 0 0 1 19.876 0a1 1 0 0 1 0 .696a10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></g></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="profile__change-password-group">
                                    <label>Confirmar nueva contraseña</label>
                                    <div className="profile__passwordWrapper">
                                        <input
                                            type={showConfirmNewPassword ? "text" : "password"}
                                            placeholder="********"
                                            value={changePasswordForm.confirmPassword}
                                            onChange={(e) => setChangePasswordForm({ ...changePasswordForm, confirmPassword: e.target.value })}
                                        />
                                        <button type="button" className="auth__passwordToggle" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>
                                            {showConfirmNewPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 18l-.722-3.25M2 8a10.645 10.645 0 0 0 20 0m-2 7l-1.726-2.05M4 15l1.726-2.05M9 18l.722-3.25" /></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M2.062 12.348a1 1 0 0 1 0-.696a10.75 10.75 0 0 1 19.876 0a1 1 0 0 1 0 .696a10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></g></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <Button
                                    onClick={async () => {
                                        try {
                                            setChangePasswordLoading(true);
                                            setChangePasswordError(null);
                                            setChangePasswordSuccess(false);

                                            if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
                                                setChangePasswordError("Las contraseñas no coinciden");
                                                return;
                                            }
                                            if (changePasswordForm.newPassword.length < 8) {
                                                setChangePasswordError("La contraseña debe tener al menos 8 caracteres");
                                                return;
                                            }
                                            if (!/[A-Z]/.test(changePasswordForm.newPassword)) {
                                                setChangePasswordError("La contraseña debe tener al menos una mayúscula");
                                                return;
                                            }
                                            if (!/\d/.test(changePasswordForm.newPassword)) {
                                                setChangePasswordError("La contraseña debe tener al menos un número");
                                                return;
                                            }

                                            await api.post("/auth/change-password", {
                                                currentPassword: changePasswordForm.currentPassword,
                                                newPassword: changePasswordForm.newPassword,
                                                confirmPassword: changePasswordForm.confirmPassword
                                            });

                                            setChangePasswordSuccess(true);
                                            setChangePasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                                            setTimeout(() => {
                                                setShowChangePassword(false);
                                                setChangePasswordSuccess(false);
                                            }, 2000);
                                        } catch (err: any) {
                                            setChangePasswordError(err?.response?.data?.message || "No se pudo cambiar la contraseña");
                                        } finally {
                                            setChangePasswordLoading(false);
                                        }
                                    }}
                                    disabled={changePasswordLoading}
                                >
                                    {changePasswordLoading ? "Guardando..." : "Guardar nueva contraseña"}
                                </Button>
                            </div>
                        )}
                        <button
                            className="profile__shared_btn"
                            onClick={() => navigate(PATHS.SHARED_WITH_ME)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.59 13.51l6.83 3.98m-.01-10.98l-6.82 3.98" /></g></svg>
                            <span>Compartidos conmigo</span>
                        </button>
                        <button className="profile__logout_btn" onClick={handleLogout}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m16 17l5-5l-5-5m5 5H9m0 9H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /></svg>
                            <span>Cerrar sesión</span>
                        </button>
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={1} className="profile__notifications__tab">
                        {preferencesLoading && privacyLoading ? (
                            <p>Cargando configuración...</p>
                        ) : (
                            <>
                                {/* Privacy Settings */}
                                <div className="profile__privacy-settings">
                                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem", fontWeight: 700, color: "$text-color" }}>Privacidad</h3>
                                    <p style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", color: "$gray-dark" }}>
                                        Controla quién puede ver tu información en los perfiles públicos y de amigos.
                                    </p>

                                    {privacyError && <p className="profile__privacy-error">{privacyError}</p>}
                                    {privacySuccess && <p className="profile__privacy-success">¡Configuración guardada!</p>}

                                    {privacySettings && (
                                        <>
                                            <div className="profile__privacy-item">
                                                <div className="profile__privacy-info">
                                                    <h4>Visibilidad del perfil</h4>
                                                    <p>Quién puede ver tu perfil cuando te buscan por nombre de usuario.</p>
                                                </div>
                                                <select
                                                    className="profile__privacy-select"
                                                    value={privacySettings.profileVisibility}
                                                    onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value as Visibility })}
                                                >
                                                    <option value="PUBLIC">Público</option>
                                                    <option value="FRIENDS">Solo amigos</option>
                                                    <option value="PRIVATE">Privado</option>
                                                </select>
                                            </div>

                                            <div className="profile__privacy-item">
                                                <div className="profile__privacy-info">
                                                    <h4>Reseñas</h4>
                                                    <p>Quién puede ver las reseñas publicadas en tu perfil.</p>
                                                </div>
                                                <select
                                                    className="profile__privacy-select"
                                                    value={privacySettings.reviewsVisibility}
                                                    onChange={(e) => setPrivacySettings({ ...privacySettings, reviewsVisibility: e.target.value as Visibility })}
                                                >
                                                    <option value="PUBLIC">Público</option>
                                                    <option value="FRIENDS">Solo amigos</option>
                                                    <option value="PRIVATE">Privado</option>
                                                </select>
                                            </div>

                                            <div className="profile__privacy-item">
                                                <div className="profile__privacy-info">
                                                    <h4>Listas de lectura</h4>
                                                    <p>Quién puede ver las listas que has creado.</p>
                                                </div>
                                                <select
                                                    className="profile__privacy-select"
                                                    value={privacySettings.readingListsVisibility}
                                                    onChange={(e) => setPrivacySettings({ ...privacySettings, readingListsVisibility: e.target.value as Visibility })}
                                                >
                                                    <option value="PUBLIC">Público</option>
                                                    <option value="FRIENDS">Solo amigos</option>
                                                    <option value="PRIVATE">Privado</option>
                                                </select>
                                            </div>

                                            <div className="profile__privacy-item">
                                                <div className="profile__privacy-info">
                                                    <h4>Actividad de libros en listas</h4>
                                                    <p>Quién puede ver los libros que añades a tus listas en la actividad.</p>
                                                </div>
                                                <select
                                                    className="profile__privacy-select"
                                                    value={privacySettings.readingListsActivityVisibility}
                                                    onChange={(e) => setPrivacySettings({ ...privacySettings, readingListsActivityVisibility: e.target.value as Visibility })}
                                                >
                                                    <option value="PUBLIC">Público</option>
                                                    <option value="FRIENDS">Solo amigos</option>
                                                    <option value="PRIVATE">Privado</option>
                                                </select>
                                            </div>

                                            <div className="profile__privacy-item">
                                                <div className="profile__privacy-info">
                                                    <h4>Lista de amigos</h4>
                                                    <p>Quién puede ver tu lista de amigos.</p>
                                                </div>
                                                <select
                                                    className="profile__privacy-select"
                                                    value={privacySettings.friendsVisibility}
                                                    onChange={(e) => setPrivacySettings({ ...privacySettings, friendsVisibility: e.target.value as Visibility })}
                                                >
                                                    <option value="PUBLIC">Público</option>
                                                    <option value="FRIENDS">Solo amigos</option>
                                                    <option value="PRIVATE">Privado</option>
                                                </select>
                                            </div>

                                            <div className="profile__privacy-legend">
                                                <p><strong>Público</strong> — cualquier persona</p>
                                                <p><strong>Solo amigos</strong> — solo personas que te han aceptado como amigo</p>
                                                <p><strong>Privado</strong> — solo tú</p>
                                            </div>

                                            {privacySaving ? (
                                                <p className="profile__privacy-saving">Guardando...</p>
                                            ) : (
                                                <Button
                                                    onClick={async () => {
                                                        try {
                                                            setPrivacySaving(true);
                                                            setPrivacyError(null);
                                                            setPrivacySuccess(false);
                                                            await updatePrivacySettings(privacySettings);
                                                            setPrivacySuccess(true);
                                                            setTimeout(() => setPrivacySuccess(false), 3000);
                                                        } catch (err: any) {
                                                            setPrivacyError(err?.response?.data?.message || "No se pudo guardar la configuración");
                                                        } finally {
                                                            setPrivacySaving(false);
                                                        }
                                                    }}
                                                >
                                                    Guardar configuración de privacidad
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Notification Preferences */}
                                <div className="profile__preferences">
                                    <h3 style={{ margin: "1.5rem 0 0.5rem 0", fontSize: "1rem", fontWeight: 700, color: "$text-color" }}>Notificaciones</h3>
                                    {preferences.map(pref => (
                                        <div key={pref.id} className="profile__preference-item">
                                            <div className="profile__preference-info">
                                                <h4>{pref.notificationType === 'FRIENDSHIP' ? 'Amistades' : pref.notificationType === 'REVIEW' ? 'Reseñas' : 'Compartidos'}</h4>
                                                <p>{pref.notificationType === 'FRIENDSHIP' ? 'Recibir notificaciones sobre solicitudes de amistad' : pref.notificationType === 'REVIEW' ? 'Recibir notificaciones cuando amigos publiquen reseñas' : 'Recibir notificaciones cuando compartan libros contigo'}</p>
                                            </div>
                                            <label className="profile__preference-toggle">
                                                <input
                                                    type="checkbox"
                                                    checked={pref.isEnabled}
                                                    onChange={async () => {
                                                        try {
                                                            const updated = await updateNotificationPreference(pref.notificationType, !pref.isEnabled);
                                                            setPreferences(preferences.map(p => p.id === updated.id ? updated : p));
                                                        } catch (error) {
                                                            console.error("Error updating preference:", error);
                                                        }
                                                    }}
                                                />
                                                <span className="profile__preference-slider"></span>
                                            </label>
                                        </div>
                                    ))}
                                    <button className="profile__reset-preferences" onClick={handleResetPreferences}>
                                        Restablecer valores predeterminados
                                    </button>
                                </div>
                            </>
                        )}
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={2} className="profile__friends__tab">
                        <div className="profile__searchUsers">
                            <form onSubmit={(e) => e.preventDefault()}>
                                <input
                                    type="text"
                                    placeholder="Buscar lectores por nombre o usuario..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </form>
                        </div>

                        {searchQuery.trim().length > 0 ? (
                            <div className="profile__results">
                                <p>Resultados de búsqueda</p>
                                {loading ? (
                                    <p className="profile__empty">Buscando...</p>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((u: UserSearchResponseDTO) => (
                                        <FriendCard
                                            key={u.id}
                                            user={u}
                                            onAdd={sendRequest}
                                            onRemove={removeFriend}
                                            onCancel={cancelRequest}
                                            onAccept={acceptRequest}
                                            onReject={rejectRequest}
                                        />
                                    ))
                                ) : (
                                    <p className="profile__empty">No se encontraron usuarios.</p>
                                )}
                            </div>
                        ) : (
                            <div className="profile__userFriends">
                                <p>Mis amigos</p>
                                <div className="profile__friendsList">
                                    {!friendsLoaded ? (
                                        <p className="profile__empty">Cargando tus amigos...</p>
                                    ) : friends.length > 0 ? (
                                        [...friends].sort((a, b) => a.fullName.localeCompare(b.fullName)).map(f => (
                                            <FriendCard key={f.id} user={f} onRemove={removeFriend} />
                                        ))
                                    ) : (
                                        <p className="profile__empty">Aún no tienes amigos. ¡Busca usuarios arriba y conecta con otros lectores!</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={3} className="profile__pending__tab">
                        {!requestsLoaded ? (
                            <p className="profile__empty">Buscando solicitudes...</p>
                        ) : requests.length > 0 ? (
                            <div className="profile__pendingList">
                                {requests.map((r: UserSearchResponseDTO) => (
                                    <FriendCard
                                        key={r.id}
                                        user={r}
                                        onAccept={acceptRequest}
                                        onReject={rejectRequest}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="profile__empty">No tienes solicitudes pendientes.</p>
                        )}
                    </CustomTabPanel>
                    {user?.userRole === "READER" && (
                        <CustomTabPanel value={value} index={4} className="profile__statistics__tab">
                            <ReadingStatisticsSection usernameSlug={user.username} />
                        </CustomTabPanel>
                    )}
                    {user?.userRole === "READER" && (
                        <CustomTabPanel value={value} index={5} className="profile__social__tab">
                            <SocialActivitiesSection usernameSlug={user.username} />
                        </CustomTabPanel>
                    )}
                </section>
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Error Toast */}
            {error && (
                <Toast
                    message={error}
                    type="error"
                    onClose={clearError}
                />
            )}
        </main>
    );
};

export default Profile;