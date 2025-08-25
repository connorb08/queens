import { Graph } from "./graph.ts";
import type { IPageController } from "./page-controller.ts";
import type { QueensSolution } from "./types.ts";

/**
 * SolutionFactory
 *
 * This module handles the Queens game on LinkedIn
 *
 * It initializes the game, finds the solution, and returns the result.
 */
const SolutionFactory = async ({
	pageController,
}: {
	pageController: IPageController;
}): Promise<QueensSolution> => {
	// logger.debug("Starting SolutionFactory");
	const graph = new Graph();
	await pageController.start();
	await pageController.constructGraph(graph);
	await pageController.dispose();
	return graph.findSolution();
};

export { SolutionFactory };
