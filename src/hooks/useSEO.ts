import { useEffect } from "react";

interface SEOProps {
	title: string;
	description?: string;
	keywords?: string;
}

const useSEO = ({ title, description, keywords }: SEOProps) => {
	useEffect(() => {
		document.title = title;

		if (description) {
			let metaDesc = document.querySelector('meta[name="description"]');
			if (metaDesc) {
				metaDesc.setAttribute("content", description);
			} else {
				metaDesc = document.createElement("meta");
				metaDesc.setAttribute("name", "description");
				metaDesc.setAttribute("content", description);
				document.head.appendChild(metaDesc);
			}
		}

		if (keywords) {
			let metaKeys = document.querySelector('meta[name="keywords"]');
			if (metaKeys) {
				metaKeys.setAttribute("content", keywords);
			} else {
				metaKeys = document.createElement("meta");
				metaKeys.setAttribute("name", "keywords");
				metaKeys.setAttribute("content", keywords);
				document.head.appendChild(metaKeys);
			}
		}
	}, [title, description, keywords]);
};

export default useSEO;
