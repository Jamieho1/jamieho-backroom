import type { ExperienceRow } from "@/lib/experience";
import type { ContentOperation } from "./allowlist";

/** Sequential snapshot overlay: identical keys/defaults to SQL, before filtering publication for Home. */
export function overlayExperience(live: ExperienceRow[], operations: ContentOperation[]): ExperienceRow[] {
  const items = new Map(live.map(row => [row.id, { ...row, experience_bullets: [] as NonNullable<ExperienceRow['experience_bullets']> }]));
  const bullets = new Map(live.flatMap(row => (row.experience_bullets ?? []).map(bullet => [bullet.id, { ...bullet, item_id: row.id }] as const)));
  for (const operation of operations) {
    if (operation.table === 'experience_items') {
      const current = items.get(operation.key);
      if (operation.op === 'insert') {
        if (current) throw Error('Experience insert key already exists.');
        items.set(operation.key, { id: operation.key, kind: 'role', org: '', dates: '', location: '', summary: '', sort: 100, public: false, experience_bullets: [], ...operation.fields, draftChanged: true });
      } else {
        if (!current) throw Error('Experience target no longer exists.');
        items.set(operation.key, { ...current, ...operation.fields, draftChanged: true });
      }
    } else if (operation.table === 'experience_bullets') {
      const current = bullets.get(operation.key);
      if (operation.op === 'insert') {
        if (current) throw Error('Bullet insert key already exists.');
        if (!items.has(operation.fields.item_id)) throw Error('Bullet parent item does not exist.');
        bullets.set(operation.key, {id:operation.key, sort:100, public:false, ...operation.fields, draftChanged:true});
      } else {
        if (!current) throw Error('Bullet target no longer exists.');
        const oldParent = items.get(current.item_id); if (oldParent) oldParent.draftChanged = true;
        if (operation.op === 'delete') bullets.delete(operation.key);
        else {
          const next = { ...current, ...operation.fields, draftChanged:true };
          if (!items.has(next.item_id)) throw Error('Bullet parent item does not exist.');
          bullets.set(operation.key,next);
        }
      }
      const parentId=operation.op === 'delete' ? current?.item_id : bullets.get(operation.key)?.item_id;
      const parent=parentId ? items.get(parentId) : undefined; if (parent) parent.draftChanged=true;
    }
  }
  for (const bullet of bullets.values()) items.get(bullet.item_id)?.experience_bullets.push(bullet);
  return [...items.values()];
}
export function publicExperienceRows(rows:ExperienceRow[]):ExperienceRow[] {
  return rows.filter(row=>row.public).map(row=>({...row,experience_bullets:(row.experience_bullets??[]).filter(b=>b.public&&b.text.trim())}));
}
