export type Config = {
	readonly userAgent: string;
	readonly Urls: {
		readonly Queens: string;
	};
};

const config = {
	userAgent:
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
	Urls: {
		Queens: "https://www.linkedin.com/games/view/queens/desktop",
	},
} satisfies Config;

export default config;
