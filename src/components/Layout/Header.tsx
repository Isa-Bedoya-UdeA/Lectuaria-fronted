import { SITE_INFO } from "@/constants/siteInfo";
import { PATHS } from "@/constants/routes";
import { Avatar, IconButton, Popover, Tooltip } from "@mui/material";
import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import StyledBadge from "../UI/StyledBadge";
import "./header.scss";
import { cyan } from "@mui/material/colors";
import { useAuth } from "@/context/AuthContext";
import { useUserLists } from "@/hooks/useUserLists";
import type { Notification } from "@/types/notifications";
import NotificationCard from "../Cards/NotificationCard";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteAllNotifications } from "@/services/notificationService";

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { lists, fetchLists } = useUserLists({ autoFetch: false });

    // Helper to check if we're on a specific profile tab
    const isOnProfileTab = (tab?: string) => {
        const isOnProfile = location.pathname === PATHS.PROFILE;
        if (!isOnProfile) return false;
        if (!tab) return location.search === '' || location.search === '?';
        return location.search === `?tab=${tab}` || location.search === `&tab=${tab}`;
    };

    useEffect(() => {
        if (user && user.userRole !== "LIBRARIAN") {
            fetchLists();
        }
    }, [user, fetchLists]);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            fetchUnreadCount();
            
            // Configurar polling automático cada 30 segundos
            const interval = setInterval(() => {
                fetchNotifications();
                fetchUnreadCount();
            }, 30000);
            
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const count = await getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error("Error fetching unread count:", error);
        }
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleClose();
        navigate(PATHS.HOME);
    };

    const handleNotificationsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setNotificationsAnchorEl(event.currentTarget);
    };

    const handleNotificationsClose = () => {
        setNotificationsAnchorEl(null);
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await markAsRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
            fetchUnreadCount();
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const handleDelete = (id: number) => {
        setNotifications(notifications.filter(n => n.id !== id));
        fetchUnreadCount();
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const handleDeleteAll = async () => {
        try {
            await deleteAllNotifications();
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error("Error deleting all notifications:", error);
        }
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    const notificationsOpen = Boolean(notificationsAnchorEl);
    const notificationsId = notificationsOpen ? 'notifications-popover' : undefined;

    const getInitials = (fullName: string): string => {
        return fullName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <header>
            <section className="header__icon">
                <NavLink
                    to={PATHS.HOME}
                    className={({ isActive }) => isActive ? "active" : ""}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M11 22H5.5a1 1 0 0 1 0-5h4.501M21 22l-1.879-1.878" /><path d="M3 19.5v-15A2.5 2.5 0 0 1 5.5 2H18a1 1 0 0 1 1 1v8" /><circle cx="17" cy="18" r="3" /></g></svg>
                    <span>{SITE_INFO.name}</span>
                </NavLink>
            </section>
            <section className="header__menu">
                <nav className={`header__nav ${isOpen ? 'active' : ''}`}>
                    <ul>
                        <li onClick={() => setIsOpen(false)}>
                            <NavLink
                                to={PATHS.HOME}
                                className={({ isActive }) => isActive ? "active" : ""}
                            >
                                Inicio
                            </NavLink>
                        </li>
                        <li onClick={() => setIsOpen(false)}>
                            <NavLink
                                to={PATHS.BOOKS}
                                className={({ isActive }) => isActive ? "active" : ""}
                            >
                                Libros
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </section>
            <section className="header__tools">
                {user && user.userRole !== "LIBRARIAN" && (
                    <Tooltip title="Mis listas" className="header__lists">
                        <NavLink
                            to={PATHS.LISTS}
                            className={({ isActive }) => isActive ? "active" : ""}
                        >
                            <IconButton aria-label="favorites">
                                <StyledBadge badgeContent={lists.length} color="primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z" /></svg>
                                </StyledBadge>
                            </IconButton>
                        </NavLink>
                    </Tooltip>
                )}
                {user && (
                    <Tooltip title="Notificaciones" className="header__notifications">
                        <IconButton aria-label="notifications" onClick={handleNotificationsClick}>
                            <StyledBadge badgeContent={unreadCount} color="primary" invisible={unreadCount === 0}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                            </StyledBadge>
                        </IconButton>
                    </Tooltip>
                )}
                <Popover
                    id={notificationsId}
                    open={notificationsOpen}
                    anchorEl={notificationsAnchorEl}
                    onClose={handleNotificationsClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    className="header__notifications-popover"
                >
                    <div className="notifications-dropdown">
                        <div className="notifications-dropdown__header">
                            <h3>Notificaciones</h3>
                            <div className="notifications-dropdown__actions">
                                {unreadCount > 0 && (
                                    <Tooltip title="Marcar todo como leído">
                                        <button onClick={handleMarkAllAsRead} className="notifications-dropdown__action-btn">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></g></svg>
                                        </button>
                                    </Tooltip>
                                )}
                                {notifications.length > 0 && (
                                    <Tooltip title="Eliminar todas">
                                        <button onClick={handleDeleteAll} className="notifications-dropdown__action-btn">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></g></svg>
                                        </button>
                                    </Tooltip>
                                )}
                            </div>
                        </div>
                        <div className="notifications-dropdown__list">
                            {notifications.length === 0 ? (
                                <p className="notifications-dropdown__empty">No tienes notificaciones</p>
                            ) : (
                                notifications.map(notification => (
                                    <NotificationCard
                                        key={notification.id}
                                        notification={notification}
                                        onMarkAsRead={handleMarkAsRead}
                                        onDelete={handleDelete}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </Popover>
                <article className="header__account">
                    <Tooltip title={user ? user.fullName : "Mi cuenta"}>
                        <button onClick={handleClick}>
                            <Avatar
                                sx={{
                                    bgcolor: cyan[500],
                                    width: 35,
                                    height: 35
                                }}
                                alt={user?.fullName || "User Avatar"}
                                src={user?.photoUrl || undefined}
                            >
                                {user ? getInitials(user.fullName) : "U"}
                            </Avatar>
                        </button>
                    </Tooltip>
                    <Popover
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        className="header__popover"
                    >
                        {!user ? (
                            <>
                                <NavLink
                                    to={PATHS.SIGNIN}
                                    className={({ isActive }) => isActive ? "active" : ""}
                                    onClick={handleClose}
                                >
                                    Iniciar Sesión
                                </NavLink>
                                <NavLink
                                    to={PATHS.SIGNUP}
                                    className={({ isActive }) => isActive ? "active" : ""}
                                    onClick={handleClose}
                                >
                                    Crear cuenta
                                </NavLink>
                            </>
                                ) : (
                                    <>
                                        {user.userRole === "LIBRARIAN" ? (
                                            <NavLink
                                                to={PATHS.MY_LIBRARY}
                                                className={() => isOnProfileTab() && location.pathname === PATHS.MY_LIBRARY ? "active-link" : ""}
                                                onClick={handleClose}
                                            >
                                                Mi biblioteca
                                            </NavLink>
                                        ) : (
                                            <>
                                                <button
                                                    className={`profile-nav-btn ${isOnProfileTab() ? "active-link" : ""}`}
                                                    onClick={() => { navigate(PATHS.PROFILE); handleClose(); }}
                                                >
                                                    Mi cuenta
                                                </button>
                                                <button
                                                    className={`profile-nav-btn ${isOnProfileTab("estadisticas") ? "active-link" : ""}`}
                                                    onClick={() => { navigate(`${PATHS.PROFILE}?tab=estadisticas`); handleClose(); }}
                                                >
                                                    Estadísticas de lectura
                                                </button>
                                                <button
                                                    className={`profile-nav-btn ${isOnProfileTab("social") ? "active-link" : ""}`}
                                                    onClick={() => { navigate(`${PATHS.PROFILE}?tab=social`); handleClose(); }}
                                                >
                                                    Actividad social
                                                </button>
                                                <button
                                                    className={`profile-nav-btn ${isOnProfileTab("amigos") ? "active-link" : ""}`}
                                                    onClick={() => { navigate(`${PATHS.PROFILE}?tab=amigos`); handleClose(); }}
                                                >
                                                    Mis amigos
                                                </button>
                                                <NavLink
                                                    to={PATHS.SHARED_WITH_ME}
                                                    className={() => location.pathname === PATHS.SHARED_WITH_ME ? "active-link" : ""}
                                                    onClick={handleClose}
                                                >
                                                    Compartidos conmigo
                                                </NavLink>
                                            </>
                                        )}
                                <button className="logout-btn" onClick={handleLogout}>
                                    Cerrar Sesión
                                </button>
                            </>
                        )}
                    </Popover>
                </article>

                <button
                    className="navbar__toggle"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu">
                    {isOpen ?
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="m15 9l-6 6m0-6l6 6" /></g></svg>
                        :
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5h16M4 12h16M4 19h16" /></svg>
                    }
                </button>
            </section>
        </header>
    );
};

export default Header;