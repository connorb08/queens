export type Config = {
	readonly userAgent: string;
	readonly Urls: {
		readonly Queens: string;
	};
	readonly Cloudflare: {
		readonly QueueId: string;
		readonly ApiToken: string;
		readonly AccountId: string;
	};
};

const config = {
	userAgent:
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
	Urls: {
		Queens: "https://www.linkedin.com/games/view/queens/desktop",
	},
	Cloudflare: {
		QueueId: process.env["QUEUE_ID"] || "",
		ApiToken: process.env["CLOUDFLARE_API_TOKEN"] || "",
		AccountId: process.env["CLOUDFLARE_ACCOUNT_ID"] || "",
	},
} satisfies Config;

export default config;
