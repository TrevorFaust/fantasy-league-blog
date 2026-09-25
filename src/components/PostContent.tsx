"use client";

import { useEffect, useState } from "react";
import { useSafeMode } from "@/components/SafeModeProvider";
import { RankingPhoto } from "@/components/RankingPhoto";
import type { Post } from "@/lib/content";
import { splitParagraphs } from "@/lib/paragraphs";
import { isRankHeader, parsePost } from "@/lib/rankings";

const canEdit = process.env.NODE_ENV === "development";

type Slice = { text: string; blockIndex: number; paragraphIndex: number };

function slicesFor(blocks: string[]) {
  const intro: Slice[] = [];
  const byRank = new Map<number, Slice[]>();
  let rank: number | null = null;

  blocks.forEach((block, blockIndex) => {
    if (isRankHeader(block)) {
      const match = block.match(/^(\d{1,2})/);
      rank = match ? Number(match[1]) : null;
      return;
    }
    const slices = splitParagraphs(block).map((text, paragraphIndex) => ({
      text,
      blockIndex,
      paragraphIndex,
    }));
    if (rank == null) {
      intro.push(...slices);
    } else {
      const list = byRank.get(rank) ?? [];
      list.push(...slices);
      byRank.set(rank, list);
    }
  });

  return { intro, byRank };
}

function EditableParagraph({
  slice,
  season,
  slug,
  className,
}: {
  slice: Slice;
  season: number;
  slug: string;
  className: string;
}) {
  const { filter } = useSafeMode();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(slice.text);
  const [draft, setDraft] = useState(slice.text);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editing) return;
    setValue(slice.text);
    setDraft(slice.text);
  }, [slice.text, editing]);

  if (!canEdit) {
    return <p className={className}>{filter(slice.text)}</p>;
  }

  if (!editing) {
    return (
      <div>
        <p className={className}>{filter(slice.text)}</p>
        <button
          type="button"
          className="mt-2 text-xs font-semibold tracking-[0.14em] text-ink/45 uppercase hover:text-ink"
          onClick={() => {
            setDraft(slice.text);
            setValue(slice.text);
            setError("");
            setEditing(true);
          }}
        >
          Edit
        </button>
      </div>
    );
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/post-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          season,
          slug,
          blockIndex: slice.blockIndex,
          paragraphIndex: slice.paragraphIndex,
          text: draft,
        }),
      });
      const payload = (await response.json()) as { error?: string; text?: string };
      if (!response.ok || !payload.text) {
        setError(payload.error || "Couldn’t save");
        return;
      }
      setValue(payload.text);
      setEditing(false);
    } catch {
      setError("Couldn’t save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flow-root">
      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={Math.min(18, Math.max(5, draft.split("\n").length + 3))}
        className={`${className} box-border w-full resize-y border border-line bg-bg px-3 py-3`}
      />
      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="border border-ink bg-ink px-4 py-1.5 text-xs font-semibold tracking-[0.14em] text-bg uppercase disabled:opacity-50"
        >
          {saving ? "Saving" : "Save"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => setEditing(false)}
          className="border border-line px-4 py-1.5 text-xs font-semibold tracking-[0.14em] uppercase"
        >
          Cancel
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

export function PostContent({ post }: { post: Post }) {
  const { filter } = useSafeMode();
  const { rankings } = parsePost(post);
  const { intro, byRank } = slicesFor(post.blocks);

  return (
    <article>
      <header className="border-b border-line bg-mint">
        <div className="mx-auto w-[min(100%-1.5rem,72rem)] py-14 text-center sm:py-20">
          <p className="mb-5 text-xs font-semibold tracking-[0.2em] text-ink/70 uppercase">
            {post.season} season
          </p>
          <h1 className="italic-shadow font-[family-name:var(--font-display)] text-[clamp(2.6rem,8vw,6.2rem)] leading-[0.92] italic">
            {filter(post.title)}
          </h1>
        </div>
      </header>

      {intro.length > 0 ? (
        <div className="mx-auto w-[min(100%-1.5rem,46rem)] space-y-5 py-12 text-center text-[1.08rem] leading-8 text-ink/90">
          {intro.map((slice) => (
            <EditableParagraph
              key={`${slice.blockIndex}-${slice.paragraphIndex}`}
              slice={slice}
              season={post.season}
              slug={post.slug}
              className="whitespace-pre-wrap"
            />
          ))}
        </div>
      ) : null}

      {rankings.length > 0 ? (
        <div>
          {rankings.map((entry, index) => {
            const photoLeft = index % 2 === 0;
            return (
              <section
                key={`${entry.rank}-${entry.title}`}
                className="overflow-hidden border-t border-line bg-panel px-5 py-10 sm:px-8 md:px-12"
              >
                {entry.image || post.images.length === 0 ? (
                  <RankingPhoto
                    year={post.season}
                    title={entry.title}
                    src={entry.image?.src}
                    alt={filter(entry.image?.alt || entry.title)}
                    photoLeft={photoLeft}
                  />
                ) : null}
                <h2 className="text-center font-[family-name:var(--font-display)] text-3xl leading-[1.12] sm:text-5xl">
                  {filter(`${entry.rank}. ${entry.title}`)}
                </h2>
                {entry.stats.length > 0 ? (
                  <dl className="mt-4 space-y-1 text-center text-[1.12rem] font-semibold leading-7 text-ink sm:text-xl">
                    {entry.stats.map((stat) => (
                      <div key={stat.label}>
                        <dt className="inline">{filter(stat.label)}: </dt>
                        <dd className="inline">{filter(stat.value)}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                <div className="mt-6 space-y-4 text-center text-[1.05rem] leading-7 text-ink/90">
                  {(byRank.get(entry.rank) ?? []).map((slice) => (
                    <EditableParagraph
                      key={`${slice.blockIndex}-${slice.paragraphIndex}-${slice.text.slice(0, 32)}`}
                      slice={slice}
                      season={post.season}
                      slug={post.slug}
                      className="whitespace-pre-wrap"
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="mx-auto w-[min(100%-1.5rem,46rem)] space-y-5 py-10 text-center text-[1.08rem] leading-8">
          {post.blocks.map((block, blockIndex) =>
            splitParagraphs(block).map((text, paragraphIndex) => (
              <EditableParagraph
                key={`${blockIndex}-${paragraphIndex}`}
                slice={{ text, blockIndex, paragraphIndex }}
                season={post.season}
                slug={post.slug}
                className="whitespace-pre-wrap"
              />
            )),
          )}
        </div>
      )}
    </article>
  );
}
