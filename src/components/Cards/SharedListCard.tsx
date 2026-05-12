import { useNavigate } from "react-router-dom";
import type { SharedList } from "@/types/shared";
import "./sharedListCard.scss";

const SharedListCard = ({ sharedList }: { sharedList: SharedList }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (sharedList.publicToken) {
            navigate(`/shared/${sharedList.publicToken}`);
        } else {
            navigate(`/public/lists/${sharedList.listId}`);
        }
    };

    return (
        <article className="sharedListCard" onClick={handleClick}>
            <div className="sharedListCard__content">
                <h3 className="sharedListCard__title">
                    {sharedList.listName}
                </h3>
                
                {sharedList.listDescription && (
                    <p className="sharedListCard__description">
                        {sharedList.listDescription}
                    </p>
                )}
                
                <div className="sharedListCard__sharedInfo">
                    <p className="sharedListCard__owner">
                        Compartido por: <strong>{sharedList.ownerName}</strong>
                    </p>
                    
                    {sharedList.books && (
                        <div className="sharedListCard__booksInfo">
                            <p className="sharedListCard__booksCount">
                                {sharedList.books.length} libros
                            </p>
                            <span className="sharedListCard__chip">
                                {sharedList.books.length} libros
                            </span>
                        </div>
                    )}
                    
                    <p className="sharedListCard__date">
                        {new Date(sharedList.sharedAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </article>
    );
};

export default SharedListCard;
