import { SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import { MAX_VALUE_BYTES, TTL_SECONDS } from '../src/index';

const BASE = 'https://handover.test/';

function post(body: unknown) {
	return SELF.fetch(BASE, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: typeof body === 'string' ? body : JSON.stringify(body),
	});
}

describe('handover', () => {
	it('stores a value and returns it by id', async () => {
		const value = JSON.stringify({ app: 'pumped', name: 'Übung — Kniebeuge' });
		const created = await post({ value });
		expect(created.status).toBe(201);

		const { uuid, ttl } = (await created.json()) as { uuid: string; ttl: number };
		expect(ttl).toBe(TTL_SECONDS);

		const fetched = await SELF.fetch(`${BASE}${uuid}`);
		expect(fetched.status).toBe(200);
		expect(await fetched.text()).toBe(value);
	});

	it('rejects a body without a string value', async () => {
		expect((await post({ value: 42 })).status).toBe(422);
		expect((await post({ value: '' })).status).toBe(422);
		expect((await post('not json')).status).toBe(422);
	});

	it('rejects a value over the size limit', async () => {
		const response = await post({ value: 'x'.repeat(MAX_VALUE_BYTES + 1) });
		expect(response.status).toBe(413);
	});

	it('answers 404 for an unknown id', async () => {
		const response = await SELF.fetch(`${BASE}00000000-0000-4000-8000-000000000000`);
		expect(response.status).toBe(404);
	});

	it('answers 400 for something that is not an id', async () => {
		const response = await SELF.fetch(`${BASE}not-a-uuid`);
		expect(response.status).toBe(400);
	});
});
