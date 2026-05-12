import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useFriendship } from "@/hooks/useFriendship";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/UI/Button";
import { SITE_INFO } from "@/constants/siteInfo";
import useSEO from "@/hooks/useSEO";
import { Avatar } from "@mui/material";
import { cyan } from "@mui/material/colors";
import "./userProfile.scss";

const UserProfile = () => {
    const { usernameSlug } = useParams<{ usernameSlug: string }>();
    const { user } = useAuth();
    const { profile, isLoading, error, fetchProfile } = useUserProfile(usernameSlug || "");
    const { sendRequest, removeFriend } = useFriendship();

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
    const isFriend = profile.friendshipStatus === "ACCEPTED";
    const isPending = profile.friendshipStatus === "PENDING";

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

                        {!isSelf && user && user.userRole === "NORMAL" && (
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
            </div>
        </main>
    );
};

export default UserProfile;
