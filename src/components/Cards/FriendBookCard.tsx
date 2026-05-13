import { Link } from "react-router-dom";
import type { BookSummary } from "@/types";
import "./friendBookCard.scss";

interface FriendBookCardProps {
    book: BookSummary;
    listName: string;
    listId?: number;
    isPublic?: boolean;
    publicToken?: string;
    visibility?: string;
}

const FriendBookCard = ({ book, listName, listId, isPublic = false, publicToken, visibility }: FriendBookCardProps) => {
    const listLink = publicToken 
        ? `/shared/${publicToken}` 
        : listId && isPublic && !publicToken
            ? `/shared/lists/${listId}` 
            : listId && visibility === "LISTED" && !publicToken
                ? `/lists/${listId}`
                : null;

    return (
        <div className="friendBookCard">
            <div className="friendBookCard__book-info">
                <Link to={`/books/${book.isbn}`} className="friendBookCard__book-link">
                    <div className="friendBookCard__book-cover">
                        <img 
                            src={book.coverUrl || "/broken-image.jpg"} 
                            alt={book.title}
                            loading="lazy"
                        />
                    </div>
                    <div className="friendBookCard__book-details">
                        <h4 className="friendBookCard__book-title">{book.title}</h4>
                        <p className="friendBookCard__book-authors">{book.authors?.join(", ")}</p>
                    </div>
                </Link>
                {listName && listLink && (
                    <div className="friendBookCard__list-info">
                        <span className="friendBookCard__list-label">Lista:</span>
                        <Link to={listLink} className="friendBookCard__list-link">
                            {listName}
                        </Link>
                    </div>
                )}
                {listName && (!listLink) && (
                    <div className="friendBookCard__list-info">
                        <span className="friendBookCard__list-label">Lista:</span>
                        <span className="friendBookCard__list-name">{listName}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FriendBookCard;
