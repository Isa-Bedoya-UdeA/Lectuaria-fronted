import { useNavigate } from "react-router-dom";
import type { SharedBook } from "@/types/shared";
import "./sharedBookCard.scss";

const SharedBookCard = ({ sharedBook }: { sharedBook: SharedBook }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (sharedBook.isbn) {
            navigate(`/books/${sharedBook.isbn}`);
        }
    };

    return (
        <article className="sharedBookCard" onClick={handleClick}>
            <img
                src={sharedBook.coverUrl || "/images/cover/fallback-front.png"}
                alt={sharedBook.title}
                className="sharedBookCard__cover"
            />
            <div className="sharedBookCard__content">
                <h3 className="sharedBookCard__title">
                    {sharedBook.title}
                </h3>
                
                <div className="sharedBookCard__sharedInfo">
                    <p className="sharedBookCard__owner">
                        Compartido por: <strong>{sharedBook.ownerName}</strong>
                    </p>
                    
                    {sharedBook.message && (
                        <p className="sharedBookCard__message">
                            "{sharedBook.message}"
                        </p>
                    )}
                    
                    <p className="sharedBookCard__date">
                        {new Date(sharedBook.sharedAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </article>
    );
};

export default SharedBookCard;
