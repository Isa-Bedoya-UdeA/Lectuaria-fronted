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
import type { UserSearchResponseDTO, ReadingStatisticsDTO } from "@/types";
import type { NotificationPreference } from "@/types/notifications";
import { getNotificationPreferences, resetNotificationPreferences, updateNotificationPreference } from "@/services/notificationService";
import { getReadingStatistics } from "@/services/userProfileService";

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

    const { totalBooksRead, averageRatingGiven, mostReadGenres, booksReadByMonth, yearComparison } = stats;
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
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </div>
                    <div className="reading-stats__card-info">
                        <span className="reading-stats__card-value">
                            {averageRatingGiven > 0 ? averageRatingGiven.toFixed(1) : "N/A"}
                            {averageRatingGiven > 0 && <span className="reading-stats__card-star"> ⭐</span>}
                        </span>
                        <span className="reading-stats__card-label">Calificación Promedio</span>
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
                                    <div className="reading-stats__monthly-bar-container">
                                        <div className="reading-stats__monthly-count">{item.booksRead} {item.booksRead === 1 ? 'libro' : 'libros'}</div>
                                        <div className="reading-stats__monthly-bar-wrapper">
                                            <div
                                                className="reading-stats__monthly-bar"
                                                style={{
                                                    height: `${Math.min(item.booksRead * 12, 80)}px`,
                                                    '--bar-width': `${(item.booksRead / maxBooks) * 100}%`
                                                } as React.CSSProperties}
                                            />
                                        </div>
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

const Profile = () => {
    const { user, logout, updateProfile, isLoading, error, clearError } = useAuth();
    const [value, setValue] = useState<number>(0);
    const [isEditing, setIsEditing] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
    const [preferencesLoading, setPreferencesLoading] = useState(false);

    const { friends, requests, searchResults, loading, loadFriends, loadPendingRequests, searchUsers, sendRequest, acceptRequest, rejectRequest, cancelRequest, removeFriend } = useFriendship();
    const { lists, fetchLists } = useUserLists({ autoFetch: false });

    useEffect(() => {
        loadFriends();
        loadPendingRequests();
        fetchLists();
    }, [loadFriends, loadPendingRequests, fetchLists]);

    // Handle tab from URL query param
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'requests') {
            setValue(3);
        } else if (tab === 'friends' || tab === 'amigos') {
            setValue(2);
        } else if (tab === 'notifications') {
            setValue(1);
        } else if ((tab === 'estadisticas' || tab === 'statistics') && user?.userRole === 'READER') {
            setValue(4);
        }
    }, [searchParams, user]);

    useEffect(() => {
        if (user && value === 1) {
            fetchNotificationPreferences();
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

    const handleChange = (_: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
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
                                <div className="profile__friends">
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
                            <Tab label="Notificaciones" {...a11yProps(1)} />
                            <Tab label={`Amigos (${friends.length})`} {...a11yProps(2)} />
                            <Tab label={`Solicitudes (${requests.length})`} {...a11yProps(3)} />
                            {user?.userRole === "READER" && (
                                <Tab label="Estadísticas de Lectura" {...a11yProps(4)} />
                            )}
                        </Tabs>
                    </Box>
                    <CustomTabPanel value={value} index={0} className="profile__general__tab">
                        <button
                            onClick={() => navigate("/lists")}
                            className="profile__lists_btn"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7v14m-9-3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4a4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3a3 3 0 0 0-3-3z" /></svg>
                            <span>Mis listas de lectura</span>
                        </button>
                        <button className="profile__edit_btn" onClick={() => setIsEditing(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0a2.34 2.34 0 0 0 3.319 1.915a2.34 2.34 0 0 1 2.33 4.033a2.34 2.34 0 0 0 0 3.831a2.34 2.34 0 0 1-2.33 4.033a2.34 2.34 0 0 0-3.319 1.915a2.34 2.34 0 0 1-4.659 0a2.34 2.34 0 0 0-3.32-1.915a2.34 2.34 0 0 1-2.33-4.033a2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" /><circle cx="12" cy="12" r="3" /></g></svg>
                            <span>Editar perfil</span>
                        </button>
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
                        {preferencesLoading ? (
                            <p>Cargando preferencias...</p>
                        ) : (
                            <div className="profile__preferences">
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
                                    {friends.length > 0 ? (
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
                        {requests.length > 0 ? (
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