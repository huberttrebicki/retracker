export const CATEGORY_METADATA_FIELDS: Record<
	string,
	{ key: string; label: string }[]
> = {
	"Live Streaming & Creator Support": [
		{ key: "channelName", label: "Channel / Creator Name" },
	],
	"Streaming & Video Entertainment": [{ key: "plan", label: "Plan" }],
	"Music & Audio": [{ key: "plan", label: "Plan" }],
	"Cloud Storage & Backup": [
		{ key: "storageAmount", label: "Storage Plan" },
	],
	"Internet & Telecom": [
		{ key: "phoneNumber", label: "Phone Number" },
		{ key: "plan", label: "Plan" },
	],
	"Developer Tools & Hosting": [{ key: "plan", label: "Plan / Tier" }],
	"AI & Machine Learning": [{ key: "plan", label: "Plan / Tier" }],
};
