import { WorkerEntrypoint } from "cloudflare:workers";

export class Entrypoint extends WorkerEntrypoint<Env> {
	async queue(batch: MessageBatch<unknown>): Promise<void> {
		try {
			const message = batch.messages[0];
			const data = message.body;
			// @ts-expect-error missing rpc types
			const response = await this.env.DATABASE.putQueens(data);
			console.log(response);
			message.ack();
		} catch (error) {
			console.error("Error processing queue message:", error);
			throw error;
		}
	}
}

export default Entrypoint;
