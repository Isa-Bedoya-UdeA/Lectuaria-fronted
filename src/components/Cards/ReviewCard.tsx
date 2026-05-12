import { Avatar, Rating } from "@mui/material";
import { cyan } from "@mui/material/colors";
import type { Review } from "@/types";
import Button from "@/components/UI/Button";
import "./reviewCard.scss";

interface ReviewCardProps {
    review: Review;
    isOwnReview?: boolean;
    onEdit?: (review: Review) => void;
    onDelete?: (reviewId: string) => void;
}

const ReviewCard = ({ review, isOwnReview = false, onEdit, onDelete }: ReviewCardProps) => {
    return (
        <div className="reviewCard">
            <div className="reviewCard__header">
                <div className="reviewCard__user">
                    <Avatar
                        sx={{
                            bgcolor: cyan[500],
                            width: 40,
                            height: 40
                        }}
                        alt={review.userName}
                    >
                        {review.userName?.charAt(0)}
                    </Avatar>
                    <div className="reviewCard__userInfo">
                        <h3>{review.userName}</h3>
                    </div>
                </div>
                <div className="reviewCard__rating">
                    <Rating
                        name="review-rating"
                        value={review.rating}
                        precision={0.5}
                        readOnly
                        size="small"
                    />
                    <p className="reviewCard__date">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Fecha desconocida"}
                    </p>
                </div>
                {(isOwnReview || review.isOwnReview) && (
                    <div className="reviewCard__actions">
                        <Button layout="icon" onClick={() => onEdit?.(review)} aria-label="Editar reseña">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497zM15 5l4 4" />
                            </svg>
                        </Button>
                        <Button layout="icon" onClick={() => onDelete?.(review.id)} aria-label="Eliminar reseña">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11v6m4-6v6m5-11v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                        </Button>
                    </div>
                )}
            </div>
            <p className="reviewCard__content">
                {review.reviewText || ""}
            </p>
        </div>
    );
};

export default ReviewCard;