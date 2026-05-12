import type { Feature } from "@/types";
import "./featureCard.scss";

const FeatureCard = ({ feature }: { feature: Feature }) => {
    return (
        <div className="featureCard">
            {feature.icon}
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
        </div>
    )
}

export default FeatureCard;