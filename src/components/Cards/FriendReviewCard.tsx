import { Link } from "react-router-dom";
import { Rating } from "@mui/material";
import type { Review } from "@/types";
import "./friendReviewCard.scss";

interface FriendReviewCardProps {
    review: Review;
    bookTitle: string;
    bookIsbn: string;
}

const FriendReviewCard = ({ review, bookTitle, bookIsbn }: FriendReviewCardProps) => {
    return (
        <Link to={`/books/${bookIsbn}`} className="friendReviewCard">
            <div className="friendReviewCard__book-info">
                <h4 className="friendReviewCard__book-title">{bookTitle}</h4>
                <div className="friendReviewCard__rating">
                    <Rating
                        name={`friend-review-${review.id}`}
                        value={review.rating}
                        precision={0.5}
                        readOnly
                        size="small"
                    />
                    <span className="friendReviewCard__rating-value">{review.rating}</span>
                </div>
            </div>
            <div className="friendReviewCard__review-content">
                <p className="friendReviewCard__review-text">{review.reviewText}</p>
                <div className="friendReviewCard__review-meta">
                    <span className="friendReviewCard__date">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Fecha desconocida"}
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default FriendReviewCard;
