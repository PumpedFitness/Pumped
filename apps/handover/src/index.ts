import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { compress, decompress } from 'shrink-string';
import { Hono } from 'hono';
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

interface Bindings {
	HANDOVER_STORE: KVNamespace;
	// ... other binding types
}

const inputSchema = z.object({
	value: z.string(),
});

const app = new Hono<{ Bindings: Bindings }>();

app.post('/', async (c) => {
	const body = await c.req.json();

	console.log({ body });

	const result = inputSchema.safeParse(body);

	if (!result.success) {
		return new Response(result.error.message, { status: 422 });
	}

	const { HANDOVER_STORE } = c.env;
	const { value } = result.data;

	const compressed = await compress(value);

	const ttl = 60 * 30;

	const uuid = uuidv4();
	await HANDOVER_STORE.put(uuid, compressed, {
		expirationTtl: ttl,
	});

	return Response.json(
		{
			uuid,
			ttl,
		},
		{
			status: 201,
		},
	);
});

app.get('/:uuid', async (c) => {
	const { HANDOVER_STORE } = c.env;
	const { uuid } = c.req.param();

	const value = await HANDOVER_STORE.get(uuid);

	if (!value) {
		return new Response('Not found', { status: 404 });
	}

	const decompressed = await decompress(value);

	return new Response(decompressed, { status: 200 });
});

export default app;
