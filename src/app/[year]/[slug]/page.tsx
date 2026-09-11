import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostContent } from "@/components/PostContent";
import { getAllPostParams, getPost, getSeason } from "@/lib/content";

export function generateStaticParams() {
  return getAllPostParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string; slug: string }>;
}): Promise<Metadata> {
  const { year, slug } = await params;
  const post = getPost(Number(year), slug);
  return { title: post?.title ?? "Post" };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ year: string; slug: string }>;
}) {
  const { year, slug } = await params;
  const y = Number(year);
  const post = getPost(y, slug);
  const season = getSeason(y);
  if (!post || !season) notFound();

  const idx = season.posts.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? season.posts[idx - 1] : null;
  const next = idx >= 0 && idx < season.posts.length - 1 ? season.posts[idx + 1] : null;

  return (
    <div>
      <div className="mx-auto w-[min(100%-1.5rem,48rem)] pt-6">
        <Link href={`/${year}`} className="text-sm text-accent hover:underline">
          ← {season.title}
        </Link>
      </div>
      <PostContent post={post} />
      <nav className="mx-auto flex w-[min(100%-1.5rem,48rem)] justify-between gap-4 border-t border-line py-8 text-sm">
        {prev ? (
          <Link href={`/${year}/${prev.slug}`} className="text-muted hover:text-accent">
            ← {prev.hubLabel}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/${year}/${next.slug}`} className="text-muted hover:text-accent">
            {next.hubLabel} →
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
