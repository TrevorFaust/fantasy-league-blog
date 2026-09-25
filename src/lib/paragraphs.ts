export function splitParagraphs(block: string) {
  return block.split(/\n{2,}/);
}

export function replaceParagraph(block: string, paragraphIndex: number, text: string) {
  const parts = splitParagraphs(block);
  if (paragraphIndex < 0 || paragraphIndex >= parts.length) return null;
  parts[paragraphIndex] = text.replace(/\r\n/g, "\n").trim();
  return parts.join("\n\n");
}
