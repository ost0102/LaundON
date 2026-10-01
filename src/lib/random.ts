/** Deterministic PRNG (mulberry32) so the same seed always produces the same sequence. */
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringToSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** A reproducible `Math.random`-like function derived purely from a string key. */
export function createSeededRandom(seedKey: string): () => number {
  return mulberry32(hashStringToSeed(seedKey));
}

export function pickWeighted<T>(rand: () => number, options: { value: T; weight: number }[]): T {
  const total = options.reduce((sum, option) => sum + option.weight, 0);
  let threshold = rand() * total;

  for (const option of options) {
    threshold -= option.weight;
    if (threshold <= 0) return option.value;
  }

  return options[options.length - 1].value;
}
