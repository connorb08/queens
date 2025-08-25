import chromium from "@sparticuz/chromium";
import {
	type Browser,
	type BrowserContext,
	launch,
	type Page,
} from "puppeteer-core";
import config from "./config.ts";
import type { Graph } from "./graph.ts";

const ariaLabelRegex = /of color\s*([^,]+)/i;

function delay(time: number) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

async function PageController(): Promise<IPageController> {
	// #region Setup

	const url = config.Urls.Queens;
	let browser: Browser | null = null;
	let context: BrowserContext | null = null;
	let page: Page | null = null;

	// #endregion

	// #region Methods
	async function start(): Promise<void> {
		console.log("starting...");
		browser = await launch({
			headless: true,
			args: [
				...chromium.args.filter((arg) => arg !== "--single-process"),
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-dev-shm-usage",
				"--disable-gpu",
				"--no-zygote",
				"--disable-web-security",
				"--disable-features=IsolateOrigins,site-per-process",
				"--disable-site-isolation-trials",
				"--disable-features=site-per-process",
				"--disable-accelerated-2d-canvas",
				"--disable-background-timer-throttling",
				"--disable-backgrounding-occluded-windows",
				"--disable-renderer-backgrounding",
				"--disable-features=TranslateUI",
				"--disable-ipc-flooding-protection",
				"--disable-default-apps",
				"--window-size=1920,1080",
			],
			executablePath: await chromium.executablePath(),
			defaultViewport: { width: 1280, height: 720 },
			// ignoreDefaultArgs: ["--enable-automation"],
			// protocolTimeout: 120000, // Increase protocol timeout
		});

		await delay(1000);

		context = await browser.createBrowserContext({
			downloadBehavior: {
				policy: "deny",
			},
		});

		console.log("opening new page...");
		page = await context.newPage();
		await delay(1000);
		console.log("new page opened...");
		console.log("setting user agent...");
		await page.setUserAgent(config.userAgent);
		await delay(1000);
		console.log("user agent set...");
		console.log("going to page url...");
		await page.goto(url, {
			waitUntil: ["domcontentloaded", "networkidle2"],
		});
		console.log("page opened...");
		console.log("clicking button...");
		await page.waitForSelector("#launch-footer-start-button");

		await page.locator("#launch-footer-start-button").click();
		console.log("clicked...");
	}

	async function constructGraph(graph: Graph): Promise<void> {
		if (!(browser && page)) {
			throw new Error("Page controller has not been started.");
		}

		const tableCells = await page.$$("div.queens-cell-with-border");
		graph.sideLength = Math.sqrt(tableCells.length);

		// Optimize by batching attribute requests for each cell
		const cellsInfo = await Promise.all(
			tableCells.map(async (cell) => {
				// Get all attributes in one batch to reduce DOM queries
				const [cellIdx, cellColor, ariaLabel, colorValue] = await Promise.all([
					cell.evaluate((e) => e.getAttribute("data-cell-idx")),
					cell.evaluate((e) => e.getAttribute("class")),
					cell.evaluate((e) => e.getAttribute("aria-label")),
					cell.evaluate((element) => {
						return window.getComputedStyle(element).backgroundColor;
					}),
				]);

				return { cellIdx, cellColor, ariaLabel, colorValue };
			}),
		);

		// Process cells data synchronously to avoid async overhead
		for (const cellInfo of cellsInfo) {
			const { cellIdx, cellColor, ariaLabel, colorValue } = cellInfo;

			const cellId = +(cellIdx ?? -1);
			const colorId = +(cellColor?.split("-").slice(-1)[0]?.trim() ?? -1);

			const [, colorName = ""] = ariaLabel?.match(ariaLabelRegex) ?? [];

			if (cellId === -1) {
				console.error("Invalid cell index found:", cellIdx);
				throw new Error("Invalid cell index found");
			}

			if (colorId === -1) {
				console.error("No color found for cell", cellIdx);
				throw new Error("No color found for cell");
			}

			graph.addCell({
				id: cellId,
				rowId: Math.floor(cellId / graph.sideLength),
				columnId: cellId % graph.sideLength,
				colorInfo: {
					id: colorId,
					name: colorName.trim(),
					value: colorValue,
				},
			});
		}
	}

	// #endregion

	// #region Dispose

	async function disposeAsync(): Promise<void> {
		page = null;
		if (context) {
			await context.close();
			context = null;
		}
		if (browser) {
			await browser.close();
			browser = null;
		}
	}

	// #endregion

	// #region Return

	return {
		start,
		constructGraph,
		[Symbol.asyncDispose]: disposeAsync,
	};

	// #endregion
}

export { PageController };

export type IPageController = {
	start(): Promise<void>;
	constructGraph(graph: Graph): Promise<void>;
	[Symbol.asyncDispose](): Promise<void>;
};
