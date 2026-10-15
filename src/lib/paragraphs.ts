export function splitParagraphs(block: string) {
  return block.split(/\n{2,}/);
}

export function replaceParagraph(block: string, paragraphIndex: number, text: string) {
  const parts = splitParagraphs(block);
  if (paragraphIndex < 0 || paragraphIndex >= parts.length) return null;
  const next = text.replace(/\r\n/g, "\n").trim();
  if (next) parts[paragraphIndex] = next;
  else parts.splice(paragraphIndex, 1);
  return parts.filter((part) => part.trim()).join("\n\n");
}
