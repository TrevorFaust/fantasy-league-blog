const PATTERNS: Array<[RegExp, string]> = [
  [/\bfuck(ing|er|ed|s)?\b/gi, "f**k$1"],
  [/\bshit(show|ty|s)?\b/gi, "s**t$1"],
  [/\bass(hole|es)?\b/gi, "a**$1"],
  [/\bbitch(es|y)?\b/gi, "b**ch$1"],
  [/\bdick(s)?\b/gi, "d**k$1"],
  [/\bcock(s)?\b/gi, "c**k$1"],
  [/\bpussy\b/gi, "p***y"],
  [/\bcunt(s)?\b/gi, "c**t$1"],
  [/\bdamn(ed)?\b/gi, "d**n$1"],
  [/\bhell\b/gi, "h**l"],
];

export function applySafeMode(text: string, enabled: boolean): string {
  if (!enabled) return text;
  let out = text;
  for (const [re, rep] of PATTERNS) {
    out = out.replace(re, rep);
  }
  // League name specifically
  out = out.replace(/Seacocks/gi, "Sea*****");
  return out;
}
