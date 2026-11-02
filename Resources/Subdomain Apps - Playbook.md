# Subdomain apps: playbook (TKT-71 and every new project)

Agreed with Jamie on 2026-11-02. R1–R4 are done; TKT-71 is the only open ticket and runs once,
just before the first subdomain app (or the public launch, whichever comes first).

## The model
- **Each new project is its own repo and Vercel project**, at `~/Documents/Developer/<project>/`,
  served on a subdomain such as `finance.<domain>`. jamieho-backroom is not changed per app.
- jamieho-backroom is the hub. Each app needs **one row in `public.apps`**. That row gives:
  - its Projects card;
  - its desktop icon;
  - who can open it, set from Settings.
- New projects follow the usual pipeline: grill → PRD → tickets, then build ticket by ticket.

## TKT-71: one-time setup (before the first subdomain app)
1. **Jamie:** buy the domain and add it to the Vercel project jamieho-backroom (apex + `www`).
2. **Claude:** set the Supabase auth cookie `domain` to `.<domain>` in `lib/supabase/*`, so one sign-in covers every
   subdomain. Test it, and update `/privacy` if anything changes.
3. **Jamie:**
   - Supabase → Auth → URL Configuration: set Site URL to `https://<domain>` and add `https://*.<domain>/**`
     to the redirect URLs.
   - Google Cloud → OAuth consent screen: add `<domain>` as an authorised domain and update the home and privacy links.
   - Verify `<domain>` in Search Console and re-submit Google brand verification.
4. **Optional:**
   - Verify the domain in Resend, so alerts can go to any address (e.g. jamieho.studio@gmail.com).
   - Set `RESEND_FROM`.

## Per new app
| The app needs… | Set it up like this |
|---|---|
| No login (public tool/demo) | Separate repo, Vercel project and (if any) database. Only add the `apps` row. |
| Jamie's shared login / invite list | Use the **same Supabase project** and the same `.<domain>` cookie setting. Put its tables in their own schema, enable RLS, guard reads with `rls.can_view_app('<app id>')`, and keep owner-only writes (see `tests/db/README.md`). Visibility and invites from Settings then apply automatically. |
| Its own users or sensitive data (e.g. Finance AI) | Its **own Supabase project** (isolated; sign-in separate from the website). It still gets an `apps` row for the card. Never copy private data into public repos. |

### Adding the `apps` row
Settings can change visibility but can't add apps yet. Claude adds the row through the Supabase connector,
with Jamie's OK:

```sql
insert into public.apps (id, name, icon, kind, url, visibility, tags, description, sort)
values ('<slug>', '<Name>', '<icon>', 'external', 'https://<slug>.<domain>', 'signed_in',
        array['<tech>', '<tech>'], '<one-line description>', 40);
```

After the row exists:
- The card appears on `/` and `/projects` within a day, or straight away after any Edit-site save.
- The desktop icon appears for anyone allowed to open the app.
- A future "Add app" form in Settings would make this self-serve.
