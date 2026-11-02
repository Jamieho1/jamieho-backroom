"use client";
/**
 * Experience on the landing page (TKT-55). Visitors get the pre-rendered public list. In Edit site mode the
 * owner gets the full CV (hidden rows too) with an editor; everything new starts hidden.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useViewer } from "./viewer-provider";
import { ExperienceList } from "./experience-list";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { emptyItem, fromRows, SELECT, type Item } from "@/lib/experience";
import type { ExpResult } from "@/app/actions/experience";

import { ItemEditor } from "./experience-item-editor";

export interface ExperienceApi {
  load(): Promise<Item[]>;
  save(item: Item): Promise<ExpResult>;
  remove(id: string): Promise<ExpResult>;
  move(id: string, direction: -1 | 1): Promise<ExpResult>;
}

const defaultApi: ExperienceApi = {
  async load() {
    const sb = supabaseBrowser(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data, error } = await sb.from("experience_items").select(SELECT).order("sort");
    if (error) throw error;
    return fromRows((data ?? []) as never);
  },
  save: async (item) => (await import("@/app/actions/experience")).saveItem(item),
  remove: async (id) => (await import("@/app/actions/experience")).deleteItem(id),
  move: async (id, d) => (await import("@/app/actions/experience")).moveItem(id, d),
};

export function ExperienceSection({ items, api }: { items: Item[]; api?: ExperienceApi }) {
  const { editing } = useViewer();
  if (!editing) {
    if (!items.length) return null;
    return (
      <section className="block">
        <h2>Experience</h2>
        <ExperienceList items={items} />
      </section>
    );
  }
  return <ExperienceEditor api={api ?? defaultApi} />;
}

export function ExperienceEditor({ api }: { api: ExperienceApi }) {
  const router = useRouter();
  const [items, setItems] = useState<Item[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.load().then(setItems, () => setLoadError(true));
  }, [api]);

  const after = (r: ExpResult) => {
    if (r.ok && r.items) {
      setItems(r.items);
      router.refresh();
    }
  };

  return (
    <section className="block editing" aria-label="Editing Experience">
      <h2>Experience</h2>
      <p className="muted small">Only rows and bullets marked Public appear on the landing page. Everything new starts hidden.</p>
      {loadError ? <p role="alert" className="alert">Can&apos;t reach the data right now.</p> : null}
      {items === null && !loadError ? <p className="muted">Loading…</p> : null}
      {items?.map((it, idx) => (
        <ItemEditor
          key={it.id}
          initial={it}
          api={api}
          onSaved={after}
          canUp={idx > 0}
          canDown={idx < items.length - 1}
        />
      ))}
      {adding ? (
        <ItemEditor
          initial={emptyItem()}
          api={api}
          isNew
          onSaved={(r) => {
            after(r);
            if (r.ok) setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button type="button" className="btn" onClick={() => setAdding(true)} disabled={items === null}>
          Add role / project
        </button>
      )}
    </section>
  );
}
