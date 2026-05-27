import { Menu, MenuItem } from "@mui/material";
import "./shareMenu.scss";
import { useAuth } from "@/context/AuthContext";

interface ShareMenuProps {
    onShareWithFriends: () => void;
    onCopyLink: () => void;
    anchorEl: HTMLElement | null;
    onClose: () => void;
    onShareWithFriendsStart?: () => void;
}

const ShareMenu = ({ onShareWithFriends, onCopyLink, anchorEl, onClose, onShareWithFriendsStart }: ShareMenuProps) => {
    const open = Boolean(anchorEl);
    const { user } = useAuth();
    const isReader = user && user.userRole === 'READER';

    const handleShareWithFriends = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        e.nativeEvent.stopImmediatePropagation();
        onShareWithFriendsStart?.();
        onClose();
        onShareWithFriends();
    };

    const handleCopyLink = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        e.nativeEvent.stopImmediatePropagation();
        onClose();
        setTimeout(() => {
            onCopyLink();
        }, 50);
    };

    const handleMenuItemClick = (handler: (e: React.MouseEvent) => void) => (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        handler(e);
    };

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            className="shareMenu"
            container={document.body}
            disableAutoFocusItem
        >
            {isReader && (
                <MenuItem
                    onClick={handleMenuItemClick(handleShareWithFriends)}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        e.nativeEvent.stopImmediatePropagation();
                    }}
                    disableRipple
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.59 13.51l6.83 3.98m-.01-10.98l-6.82 3.98" /></g></svg>
                    <span>Compartir con amigos</span>
                </MenuItem>
            )}
            <MenuItem
                onClick={handleMenuItemClick(handleCopyLink)}
                onMouseDown={(e) => {
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                }}
                disableRipple
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></g></svg>
                <span>Copiar enlace</span>
            </MenuItem>
        </Menu>
    );
};

export default ShareMenu;
