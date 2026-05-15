import React from "react";
import type { LibraryAvailability } from "@/types";
import "./libraryCard.scss";

interface LibraryCardProps {
    availability: LibraryAvailability;
}

const LibraryCard: React.FC<LibraryCardProps> = ({ availability }) => {
    const { library, physicalAvailable, digitalAvailable, digitalPlatform } = availability;

    return (
        <div className="library-card">
            <div className="library-card__header">
                <div className="library-card__logo">
                    {library.name.charAt(0)}
                </div>
                <div className="library-card__info">
                    <h3>{library.name}</h3>
                    <p className="library-card__zone">{library.zoneName || "Ubicación general"}</p>
                </div>
            </div>
            
            <div className="library-card__body">
                {library.description && (
                    <div className="library-card__description">
                        <p>{library.description}</p>
                    </div>
                )}
                <div className="library-card__contact">
                    <p><strong>Dirección:</strong> {library.address}</p>
                    <p><strong>Teléfono:</strong> {library.phone}</p>
                    <p><strong>Horarios:</strong> {library.openingHours}</p>
                </div>

                <div className="library-card__formats">
                    {physicalAvailable && (
                        <span className="badge available">
                            Físico
                        </span>
                    )}
                    {digitalAvailable && (
                        <span className="badge available">
                            Digital
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LibraryCard;
