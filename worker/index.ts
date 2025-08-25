import { WorkerEntrypoint } from "cloudflare:workers";

export class Entrypoint extends WorkerEntrypoint<Env> {
	public async fetch(request: Request): Promise<Response> {
		return new Response();
	}
}

export default Entrypoint;
