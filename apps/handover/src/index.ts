import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { compress, decompress } from 'shrink-string';
import { Hono } from 'hono';

interface Bindings {
	HANDOVER_STORE: KVNamespace;
	// ... other binding types
}

/** Shared payloads are small JSON documents; anything bigger is a mistake. */
export const MAX_VALUE_BYTES = 256 * 1024;

/** How long a handover lives — long enough to scan, short enough to forget. */
export const TTL_SECONDS = 60 * 30;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const inputSchema = z.object({
	value: z.string().min(1),
});

const app = new Hono<{ Bindings: Bindings }>();

app.post('/', async (c) => {
	// Payloads are user content — never log them.
	let body: unknown;
	try {
		body = await c.req.json();
	} catch {
		return new Response('Invalid JSON', { status: 422 });
	}

	const result = inputSchema.safeParse(body);

	if (!result.success) {
		return new Response(result.error.message, { status: 422 });
	}

	const { HANDOVER_STORE } = c.env;
	const { value } = result.data;

	if (new TextEncoder().encode(value).byteLength > MAX_VALUE_BYTES) {
		return new Response('Payload too large', { status: 413 });
	}

	const compressed = await compress(value);

	const uuid = uuidv4();
	await HANDOVER_STORE.put(uuid, compressed, {
		expirationTtl: TTL_SECONDS,
	});

	return Response.json(
		{
			uuid,
			ttl: TTL_SECONDS,
		},
		{
			status: 201,
		},
	);
});

app.get('/:uuid', async (c) => {
	const { HANDOVER_STORE } = c.env;
	const { uuid } = c.req.param();

	if (!UUID_PATTERN.test(uuid)) {
		return new Response('Invalid id', { status: 400 });
	}

	const value = await HANDOVER_STORE.get(uuid);

	if (!value) {
		return new Response('Not found', { status: 404 });
	}

	const decompressed = await decompress(value);

	return new Response(decompressed, { status: 200 });
});

export default app;
