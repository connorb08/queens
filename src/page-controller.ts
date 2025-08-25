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

async function PageController(): Promise<IPageController> {
	// #region Setup

	const url = config.Urls.Queens;
	let browser: Browser | null = null;
	let context: BrowserContext | null = null;
	let page: Page | null = null;

	// #endregion

	// #region Methods
	async function start(): Promise<void> {
		browser = await launch({
			headless: true,
			executablePath: await chromium.executablePath(),
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
			defaultViewport: { width: 1280, height: 720 },
		});
		context = await browser.createBrowserContext({
			downloadBehavior: {
				policy: "deny",
			},
			// userAgent:
			// 	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			// viewport: { width: 1280, height: 720 },
			// ignoreHTTPSErrors: true,
		});

		page = await context.newPage();
		page.setUserAgent(config.userAgent);
		await page.goto(url);
		await page.locator("#launch-footer-start-button").click();
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

	function dispose() {
		(async () => await disposeAsync())();
	}

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
		dispose: disposeAsync,
		[Symbol.dispose]: dispose,
		[Symbol.asyncDispose]: disposeAsync,
	};

	// #endregion
}

export { PageController };

export type IPageController = {
	start(): Promise<void>;
	constructGraph(graph: Graph): Promise<void>;
	dispose(): Promise<void>;
	[Symbol.dispose](): void;
	[Symbol.asyncDispose](): Promise<void>;
};
