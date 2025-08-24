import puppeteer from "puppeteer";

export async function main(): Promise<string> {
	const browser = await puppeteer.launch({
		headless: true,
		defaultViewport: null,
		executablePath: "/usr/bin/google-chrome",
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});
	const context = await browser.createBrowserContext();
	const page = await context.newPage();
	await page.goto("https://example.com");

	const result = await page.evaluate(() => {
		return document.title;
	});
	console.log(result);

	await browser.close();
	return result;
}
