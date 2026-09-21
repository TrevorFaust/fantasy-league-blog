import { notFound } from "next/navigation";
import { SeasonHub } from "@/components/SeasonHub";
import { getSeason, getSeasonYears } from "@/lib/content";

export function generateStaticParams() {
  return getSeasonYears().map((year) => ({ year }));
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
