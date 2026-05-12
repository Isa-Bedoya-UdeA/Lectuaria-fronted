import { useEffect, useState } from "react";
import { type Review } from "@/types";

export function useFetchReviews() {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetch("/public/data/reviews.json")
			.then((res) => res.json())
			.then((data) => {
				setReviews(data);
				setLoading(false);
			})
			.catch(() => {
				setError("Error al cargar reseñas");
				setLoading(false);
			});
	}, []);

	return { reviews, loading, error };
}
