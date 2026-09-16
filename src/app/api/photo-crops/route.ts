import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { clampCrop, type PhotoCropMap } from "@/lib/photo-crops";

const FILE = path.join(process.cwd(), "src/content/photo-crops.json");

async function readCrops(): Promise<PhotoCropMap> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return JSON.parse(raw) as PhotoCropMap;
  } catch {
    return {};
  }
}

export async function GET() {
  return NextResponse.json(await readCrops());
}

export async function POST(request: Request) {
  const body = (await request.json()) as { key?: string; crop?: { x: number; y: number; scale: number } };
  if (!body.key || !body.crop) {
    return NextResponse.json({ error: "Missing key or crop" }, { status: 400 });
  }

  const crops = await readCrops();
  crops[body.key] = clampCrop(body.crop);
  await fs.writeFile(FILE, `${JSON.stringify(crops, null, 2)}\n`, "utf8");
  return NextResponse.json(crops);
}
