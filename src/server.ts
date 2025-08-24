import { serve } from "bun";
import { main } from ".";

const server = serve({
	port: 8080,
	fetch: async () => {
		const res = await main();
		return new Response(res, { status: 200 });
	},
});
console.log(`Starting server at http://${server.hostname}:${server.port}`);
