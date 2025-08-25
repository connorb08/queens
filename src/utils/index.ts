export function* combinations<T>(
	set: Set<T>,
	k: number,
): Generator<Set<T>, void, unknown> {
	const items = Array.from(set);

	yield* generateCombinations(items, k, 0, []);
}

function* generateCombinations<T>(
	items: T[],
	k: number,
	start: number,
	current: T[],
): Generator<Set<T>, void, unknown> {
	if (current.length === k) {
		yield new Set(current);
		return;
	}

	for (let i = start; i < items.length; i++) {
		const item = items[i];
		if (item !== undefined) {
			current.push(item);
			yield* generateCombinations(items, k, i + 1, current);
			current.pop();
		}
	}
}
