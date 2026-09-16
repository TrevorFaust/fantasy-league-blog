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
      <div className="border-b border-line bg-bg-elev">
        <div className="mx-auto w-[min(100%-1.5rem,72rem)] py-4">
          <Link href={`/${year}`} className="text-sm tracking-wide uppercase hover:underline">
            ← {season.title}
          </Link>
        </div>
      </div>
      <PostContent post={post} />
      <nav className="mx-auto flex w-[min(100%-1.5rem,72rem)] justify-between gap-4 border-t border-line py-8 text-sm">
        {prev ? (
          <Link href={`/${year}/${prev.slug}`} className="hover:underline">
            ← {prev.hubLabel}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/${year}/${next.slug}`} className="hover:underline">
            {next.hubLabel} →
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
