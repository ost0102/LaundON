const MAX_CHUNK_LENGTH = 500;

/** Splits text on sentence boundaries, packing sentences into chunks up to MAX_CHUNK_LENGTH chars. */
export function chunkText(text: string): string[] {
  const sentences = text
    .split(/(?<=[.!?。])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length > MAX_CHUNK_LENGTH && current) {
      chunks.push(current);
      current = sentence;
    } else {
      current = candidate;
    }
  }

  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text.trim()];
}
