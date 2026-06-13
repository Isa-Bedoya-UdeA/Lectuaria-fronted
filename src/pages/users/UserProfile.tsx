import { useEffect } from "react";
import { useParams } from "react-router-dom";
import useSEO from "@/hooks/useSEO";
import { useUserProfile } from "@/hooks/useUserProfile";
import { SITE_INFO } from "@/constants/siteInfo";
import { useAuth } from "@/context/AuthContext";
import { useFriendship } from "@/hooks/useFriendship";
import FriendReviewCard from "@/components/Cards/FriendReviewCard";
import FriendBookCard from "@/components/Cards/FriendBookCard";
import Button from "@/components/UI/Button";
import { Avatar } from "@mui/material";
import { cyan } from "@mui/material/colors";
import "./userProfile.scss";
import { Link } from "react-router-dom";

const UserProfile = () => {
    const { usernameSlug } = useParams<{ usernameSlug: string }>();
    const { user } = useAuth();
    const { profile, isLoading, error, fetchProfile, friendActivity } = useUserProfile(usernameSlug || "");
    const { sendRequest, removeFriend, isPending } = useFriendship();

    const getInitials = (fullName: string): string => {
        return fullName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    useEffect(() => {
        if (usernameSlug) {
            fetchProfile();
        }
    }, [usernameSlug, fetchProfile]);

    useSEO({
        title: profile ? `${profile.fullName} | ${SITE_INFO.name}` : "Perfil de usuario",
        description: profile ? `Perfil de ${profile.fullName} en ${SITE_INFO.name}.` : ""
    });

    const handleAddFriend = async () => {
        if (profile) {
            try {
                await sendRequest(profile.id);
                fetchProfile();
            } catch (err) {
                // Error handled by useFriendship
            }
        }
    };

    const handleRemoveFriend = async () => {
        if (profile) {
            try {
                await removeFriend(profile.id);
                fetchProfile();
            } catch (err) {
                // Error handled by useFriendship
            }
        }
    };

    if (isLoading && !profile) {
        return (
            <main className="userProfile">
                <div className="userProfile__container">
                    <div className="userProfile__loading">Cargando perfil...</div>
                </div>
            </main>
        );
    }

    if (error && !profile) {
        // Check if it's a private profile error
        const isPrivate = error?.includes("privado") || error?.includes("403");
        if (isPrivate) {
            return (
                <main className="userProfile">
                    <div className="userProfile__container">
                        <div className="userProfile__private">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <h2>Perfil privado</h2>
                            <p>Este perfil es privado y no está disponible para ti.</p>
                        </div>
                    </div>
                </main>
            );
        }
        return (
            <main className="userProfile">
                <div className="userProfile__container">
                    <div className="userProfile__error" role="alert">
                        <p>{error}</p>
                        <Button onClick={fetchProfile}>Reintentar</Button>
                    </div>
                </div>
            </main>
        );
    }

    if (!profile) {
        return (
            <main className="userProfile">
                <div className="userProfile__container">
                    <div className="userProfile__not-found">
                        <p>Usuario no encontrado</p>
                    </div>
                </div>
            </main>
        );
    }

    const isSelf = user && user.id === profile.id;
    const isFriend = profile?.friendshipStatus === "ACCEPTED";

    // Cada sub-seccion respeta su propia configuracion de privacidad del
    // dueno del perfil: PUBLIC lo ve cualquiera, FRIENDS solo amigos, PRIVATE
    // solo el dueno. Visitantes anonimos solo ven PUBLIC.
    const showReviews = isSelf
        || (profile.privacy?.reviewsVisibility === "PUBLIC")
        || (profile.privacy?.reviewsVisibility === "FRIENDS" && isFriend);
    const showReadingLists = isSelf
        || (profile.privacy?.readingListsVisibility === "PUBLIC")
        || (profile.privacy?.readingListsVisibility === "FRIENDS" && isFriend);
    const showReadingListsActivity = isSelf
        || (profile.privacy?.readingListsActivityVisibility === "PUBLIC")
        || (profile.privacy?.readingListsActivityVisibility === "FRIENDS" && isFriend);
    const showFriends = isSelf
        || (profile.privacy?.friendsVisibility === "PUBLIC")
        || (profile.privacy?.friendsVisibility === "FRIENDS" && isFriend);

    return (
        <main className="userProfile">
            <div className="userProfile__container">
                <section className="userProfile__card">
                    <article className="userProfile__avatar">
                        <Avatar
                            sx={{
                                bgcolor: cyan[500],
                                width: 120,
                                height: 120
                            }}
                            alt={profile.fullName || "User Avatar"}
                            src={profile.photoUrl || undefined}
                        >
                            {getInitials(profile.fullName)}
                        </Avatar>
                    </article>
                    <article className="userProfile__info">
                        <h1 className="userProfile__name">{profile.fullName}</h1>
                        <p className="userProfile__username">@{profile.username}</p>
                        {profile.biography && <p className="userProfile__bio">{profile.biography}</p>}

                        {!isSelf && user && user.userRole === "READER" && (
                            <div className="userProfile__actions">
                                {isFriend ? (
                                    <Button variant="outlined" onClick={handleRemoveFriend}>
                                        Eliminar amigo
                                    </Button>
                                ) : isPending ? (
                                    <Button variant="outlined" disabled>
                                        Solicitud enviada
                                    </Button>
                                ) : (
                                    <Button onClick={handleAddFriend}>
                                        Agregar amigo
                                    </Button>
                                )}
                            </div>
                        )}
                    </article>
                </section>

                {/* Reading Lists section */}
                {showReadingLists && profile.readingLists && profile.readingLists.length > 0 && (
                    <section className="userProfile__reading-lists">
                        <h2>Listas de lectura</h2>
                        <div className="userProfile__reading-lists__grid">
                            {profile.readingLists.map(list => (
                                <Link
                                    key={list.id}
                                    to={`/lists/${list.id}`}
                                    className="userProfile__reading-lists__card"
                                >
                                    <div style={{
                                        width: "2rem",
                                        height: "2rem",
                                        borderRadius: "0.3rem",
                                        background: "$primary",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="$white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                        </svg>
                                    </div>
                                    <h3>{list.name}</h3>
                                    <span>{list.bookCount} {list.bookCount === 1 ? "libro" : "libros"}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Friends section */}
                {showFriends && profile.friends && profile.friends.length > 0 && (
                    <section className="userProfile__friends">
                        <h2>Amigos</h2>
                        <div className="userProfile__friends__grid">
                            {profile.friends.map(friend => (
                                <Link
                                    key={friend.id}
                                    to={`/users/${friend.username}`}
                                    className="userProfile__friends__card"
                                >
                                    <Avatar
                                        sx={{ bgcolor: cyan[500], width: 48, height: 48 }}
                                        alt={friend.fullName}
                                        src={friend.photoUrl || undefined}
                                    >
                                        {getInitials(friend.fullName)}
                                    </Avatar>
                                    <h3>{friend.fullName}</h3>
                                    <span>@{friend.username}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Activity section - se muestra si el visitante tiene al menos una
                    sub-seccion visible segun la configuracion de privacidad del
                    dueno del perfil. Antes estaba limitada a isFriend, lo que
                    bloqueaba a visitantes anonimos incluso cuando la privacidad
                    estaba en PUBLIC. */}
                {friendActivity && friendActivity.length > 0 && (showReviews || showReadingListsActivity) && (
                    <section className="userProfile__activity">
                        <h2 className="userProfile__activity-title">Actividad reciente</h2>
                        <div className="userProfile__activity-sections">
                            {/* Reseñas recientes */}
                            {showReviews && friendActivity
                                .filter(activity => activity.activityType === 'BOOK_REVIEWED')
                                .length > 0 && (
                                    <div className="userProfile__activity-section">
                                        <h3 className="userProfile__section-title">Reseñas recientes</h3>
                                        <div className="userProfile__section-content">
                                            {friendActivity
                                                .filter(activity => activity.activityType === 'BOOK_REVIEWED')
                                                .slice(0, 3).map(review => (
                                                    <FriendReviewCard
                                                        key={review.id}
                                                        review={{
                                                            id: review.id.toString(),
                                                            bookId: review.bookId || 0,
                                                            userId: review.userId,
                                                            userName: review.userName,
                                                            createdAt: review.createdAt,
                                                            updatedAt: review.updatedAt || review.createdAt,
                                                            rating: review.rating || 0,
                                                            reviewText: review.reviewText || "",
                                                            status: (review.status as "draft" | "published" | "hidden" | "DRAFT" | "PUBLISHED") || "published",
                                                            helpfulCount: review.helpfulCount || 0
                                                        }}
                                                        bookTitle={review.listName || ""}
                                                        bookIsbn={review.bookIsbn || ""}
                                                    />
                                                ))}
                                        </div>
                                    </div>
                                )}

                            {/* Libros añadidos a listas */}
                            {showReadingListsActivity && friendActivity
                                .filter(activity => activity.activityType === 'BOOK_ADDED_TO_LIST')
                                .length > 0 && (
                                    <div className="userProfile__activity-section">
                                        <h3 className="userProfile__section-title">Libros añadidos a listas</h3>
                                        <div className="userProfile__section-content">
                                            {friendActivity
                                                .filter(activity => activity.activityType === 'BOOK_ADDED_TO_LIST')
                                                .slice(0, 3).map(book => (
                                                    <FriendBookCard
                                                        key={book.id}
                                                        book={{
                                                            id: book.bookId || 0,
                                                            isbn: parseInt(book.bookIsbn || "0"),
                                                            title: book.bookTitle || "",
                                                            coverUrl: book.bookCoverUrl,
                                                            authors: book.bookAuthors || [],
                                                            genres: [],
                                                            averageRating: 0,
                                                            ratingsCount: 0
                                                        }}
                                                        listName={book.listName || ""}
                                                        listId={book.listId as number || 0}
                                                        isPublic={book.isPublic || false}
                                                        publicToken={book.publicToken || undefined}
                                                        visibility={book.visibility}
                                                    />
                                                ))}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
};

export default UserProfile;