export const getProviderLogo = (domain: string) => {
	const host = new URL(domain.includes("://") ? domain : `https://${domain}`)
		.host;
	const apiKey = process.env.LOGO_API_KEY!;
	const url = `https://cdn.brandfetch.io/domain/${host}?c=${apiKey}`;
	return url;
};
