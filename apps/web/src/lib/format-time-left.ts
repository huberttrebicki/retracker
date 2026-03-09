export function formatTimeLeft(endsAt: string): string {
	const end = new Date(endsAt);
	const now = new Date();
	const diffMs = end.getTime() - now.getTime();

	if (diffMs <= 0) return "Expired";

	const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (days > 30) {
		const months = Math.floor(days / 30);
		const remainingDays = days % 30;
		return remainingDays > 0
			? `${months} months ${remainingDays} days left`
			: `${months} months left`;
	}

	if (days > 0) return `${days} days left`;

	return "Less than a day left";
}
