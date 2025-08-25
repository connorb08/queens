import config from "./config";

export const PublishMessage = async (message: object): Promise<object> => {
	const ACCOUNT_ID = config.Cloudflare.AccountId;
	const QUEUE_ID = config.Cloudflare.QueueId;
	const CLOUDFLARE_API_TOKEN = config.Cloudflare.ApiToken;

	const request = new Request(
		`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/queues/${QUEUE_ID}/messages`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ body: message }),
		},
	);

	const response = await fetch(request);
	return await response.json();
};
