import { SolutionFactory } from "./factory.ts";
import { PageController } from "./page-controller.ts";
import { PublishMessage } from "./publish.ts";

export async function main(): Promise<void> {
	try {
		const solution = await SolutionFactory({
			pageController: await PageController(),
		});
		console.log(solution);
		const response = await PublishMessage(solution);
		console.log(response);
	} catch (error) {
		console.error("Error finding solution:", error);
		throw error;
	}
}

// upload data to cloudflare
