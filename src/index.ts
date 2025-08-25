import { SolutionFactory } from "./factory.ts";
import { PageController } from "./page-controller.ts";
import type { QueensSolution } from "./types.ts";

export async function main(): Promise<QueensSolution> {
	try {
		const solution = await SolutionFactory({
			pageController: await PageController(),
		});
		return solution;
	} catch (error) {
		console.error("Error finding solution:", error);
		throw error;
	}
}

const res = await main();
console.log(res);

// upload data to cloudflare
