import { WorkerEntrypoint } from "cloudflare:workers";
import { Container, getContainer } from "@cloudflare/containers";

export class QueensContainer extends Container {
	defaultPort = 8080;
	sleepAfter = "5m";
	enableInternet = true;

	async fetch(request: Request): Promise<Response> {
		return await this.containerFetch(request, this.defaultPort);
	}
}

export class Entrypoint extends WorkerEntrypoint<Env> {
	public async fetch(request: Request): Promise<Response> {
		try {
			const container = getContainer(this.env.CONTAINER);
			const res = await container.fetch(request);
			return res;
		} catch (error) {
			console.error("Error in fetch handler:", error);
			return new Response("Internal Server Error", { status: 500 });
		}
	}
	public async scheduledHandler(): Promise<void> {
		return;
	}

	public override async scheduled(_: ScheduledController): Promise<void> {
		try {
			await this.scheduledHandler();
		} catch (error) {
			if (Error.isError(error)) {
				console.error(
					`Caught error in scheduled handler: ${error.message}. Stack: ${error.stack}`,
				);
			}
		}
	}
}

export default Entrypoint;
