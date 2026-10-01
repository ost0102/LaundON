/**
 * Simulates the small amount of latency a real IoT server round-trip would
 * have, so loading states in the UI are exercised during development.
 */
export function simulateNetworkDelay(minMs = 150, maxMs = 350): Promise<void> {
  const delay = minMs + Math.random() * (maxMs - minMs);
  return new Promise((resolve) => setTimeout(resolve, delay));
}
