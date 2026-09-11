import { notFound } from "next/navigation";
import { SeasonHub } from "@/components/SeasonHub";
import { getSeason } from "@/lib/content";

export function generateStaticParams() {
  return [{ year: "2023" }, { year: "2024" }, { year: "2025" }];
}

export default async function SeasonPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const season = getSeason(Number(year));
  if (!season) notFound();
  return <SeasonHub season={season} />;
}
