import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { replaceParagraph } from "@/lib/paragraphs";

const FILES = [
  path.join(process.cwd(), "src/content/live.json"),
  path.join(process.cwd(), "src/content/site.json"),
];

type Store = {
  seasons?: Record<string, { posts?: { slug: string; blocks: string[] }[] }>;
};

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Editing is only available locally" }, { status: 403 });
  }

  const body = (await request.json()) as {
    season?: number;
    slug?: string;
    blockIndex?: number;
    paragraphIndex?: number;
    text?: string;
  };

  if (
    typeof body.season !== "number" ||
    !body.slug ||
    typeof body.blockIndex !== "number" ||
    typeof body.paragraphIndex !== "number" ||
    typeof body.text !== "string"
  ) {
    return NextResponse.json({ error: "Missing paragraph" }, { status: 400 });
  }

  const text = body.text.trim();
  if (!text) {
    return NextResponse.json({ error: "Paragraph can’t be empty" }, { status: 400 });
  }

  for (const file of FILES) {
    const raw = await fs.readFile(file, "utf8");
    const data = JSON.parse(raw) as Store;
    const post = data.seasons?.[String(body.season)]?.posts?.find((item) => item.slug === body.slug);
    const block = post?.blocks[body.blockIndex];
    if (!post || typeof block !== "string") continue;

    const next = replaceParagraph(block, body.paragraphIndex, text);
    if (next == null) {
      return NextResponse.json({ error: "Paragraph not found" }, { status: 404 });
    }

    post.blocks[body.blockIndex] = next;
    await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    return NextResponse.json({ ok: true, text });
  }

  return NextResponse.json({ error: "Post not found" }, { status: 404 });
}
