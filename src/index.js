import { getClosedPositions } from './getClosedPositions.js';

export default {

	async fetch(request, env, ctx) {

		const data = await getClosedPositions(request, env, ctx)

		const jsonData = JSON.stringify(data, null, 2);

		// Return the JSON data when the worker URL is visited
		return new Response(jsonData, {
			headers: { "content-type": "application/json" },
		});

		// Return a simple message when the worker URL is visited
		// return new Response("Cloudflare worker is running.", {
		// 	headers: { "content-type": "text/plain" },
		// });
	},

	async scheduled(event, env, ctx) {
		// Call processRequest on the cron schedule
		return getClosedPositions(event, env, ctx);
	},

};
