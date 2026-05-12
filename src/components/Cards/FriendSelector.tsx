import type { UserSearchResponseDTO } from "@/types";
import { Avatar } from "@mui/material";
import { cyan } from "@mui/material/colors";
import "./friendSelector.scss";

interface FriendSelectorProps {
    friends: UserSearchResponseDTO[];
    selectedFriends: number[];
    onSelectionChange: (selectedIds: number[]) => void;
}

const getInitials = (name: string): string => {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
};

const FriendSelector = ({ friends, selectedFriends, onSelectionChange }: FriendSelectorProps) => {
    const handleToggleFriend = (friendId: number) => {
        if (selectedFriends.includes(friendId)) {
            onSelectionChange(selectedFriends.filter(id => id !== friendId));
        } else {
            onSelectionChange([...selectedFriends, friendId]);
        }
    };

    return (
        <div className="friendSelector">
            <h3>Seleccionar amigos</h3>
            <div className="friendSelector__list">
                {friends.length > 0 ? (
                    friends.map(friend => (
                        <label key={friend.id} className="friendSelector__item">
                            <input
                                type="checkbox"
                                checked={selectedFriends.includes(friend.id)}
                                onChange={() => handleToggleFriend(friend.id)}
                            />
                            <div className="friendSelector__info">
                                <Avatar
                                    sx={{ bgcolor: cyan[500], width: 40, height: 40 }}
                                    alt={friend.fullName}
                                    src={friend.photoUrl || undefined}
                                    className="friendSelector__avatar"
                                >
                                    {getInitials(friend.fullName)}
                                </Avatar>
                                <div className="friendSelector__details">
                                    <span className="friendSelector__name">{friend.fullName}</span>
                                    <span className="friendSelector__username">@{friend.username}</span>
                                </div>
                            </div>
                        </label>
                    ))
                ) : (
                    <p className="friendSelector__empty">No tienes amigos para compartir.</p>
                )}
            </div>
        </div>
    );
};

export default FriendSelector;
