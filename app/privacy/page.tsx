import { Desktop } from "@/components/desktop";
import type { Metadata } from "next";
import { PASSLOOP_PRIVACY_URL } from "@/lib/passloop";

export const metadata: Metadata = {
  title: "Privacy policy · Jamie Ho",
  description: "What this site collects, why, and how to have it deleted.",
};

const UPDATED = "24 November 2026";

/**
 * Privacy policy (needed for Google sign-in to be published). Keep it true to what the code does:
 * update it in the same change whenever a ticket starts collecting something new.
 */
export default function Privacy() {
  const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  return (
    <Desktop apps={[]} initialApp="privacy" discoverApps content={<div className="page prose">
      <h1>Privacy policy</h1>
      <p className="muted">Last updated {UPDATED}</p>

      <p>
        This is the personal website of Jamie Ho, an individual software engineer in London, UK. Jamie is the data
        controller for the information below. The site is not run by a company and does not sell or share personal data.
      </p>

      <h2>What is collected</h2>
      <ul>
        <li>
          <strong>Reading the public pages</strong> collects nothing that identifies you. Vercel Web Analytics counts page views
          (the page, the referring site, and your rough country, browser and device type) without cookies and without storing
          your IP address. The site sets no tracking or advertising cookies.
        </li>
        <li>
          <strong>Signing in with Google</strong> (optional) shares your name, email address and profile picture from your Google
          account. Nothing else from your Google account is requested.
        </li>
        <li>
          <strong>Sign-in records</strong>: the date and time of each sign-in, and which apps you open on each day, so the site owner
          can see who has visited the signed-in area. A cookie keeps you signed in; it is needed for sign-in to work and is removed when you sign out.
        </li>
        <li>
          <strong>Articles</strong> are stored in Supabase. Signed-in readers can pin published articles; the article ID, account ID and pin date are stored privately to sync their list across devices. Readers can unpin them; deleting an account or article removes its pins. These records follow the retention and backup periods below. The owner can save private drafts and publish articles and reference links for everyone to read. They are retained and backed up for the periods below. Pictures in an article are served from the site's own Supabase storage, or occasionally from another site that hosts them, which sees your IP address like any web request. Videos load from YouTube (privacy-enhanced mode) only after you press play; until then nothing is requested from YouTube.
        </li>
        <li>
          <strong>The owner’s legacy CV, Behavioral stories and answers</strong> are stored in Supabase. Only the owner can read hidden CV entries, private stories, story links, preparation outlines and follow-ups. CV entries and bullets appear publicly in the journey only when marked Public, with a Public parent entry. Nothing on the PassLoop site grants access to this private material. These records follow the retention and encrypted-backup periods below.
        </li>
        <li>
          <strong>Website feedback</strong> (optional) stores your Problem/Idea selection, message and optional local page link in the owner’s inbox and email alerts. It does not request your name or email; captured page links omit query parameters. It uses the same short-lived coded IP spam limits and encrypted backups as contact messages.
        </li>
        <li>
          <strong>The contact form</strong> (optional): your name, email address, reason for getting in touch, optional message, and (for project briefs) selected services, budget and timeline, so Jamie can
          read and answer it. To stop spam, a one-way coded version of your IP address (not the address itself) is stored with the
          message and wiped after one hour. Each message is also forwarded to Jamie by email.
        </li>
        <li>
          <strong>PassLoop</strong> (interview practice) is a separate service with its own privacy page. This site no longer collects PassLoop practice, notes, resume or interview data. For now both sites use the same sign-in and database project, so one account works on both. Read{" "}
          <a href={PASSLOOP_PRIVACY_URL}>the PassLoop privacy policy</a> for what that service does.
        </li>
        <li>
          <strong>Hosting logs</strong>: the hosting providers keep standard technical logs (such as IP address and browser type) for
          security and reliability.
        </li>
      </ul>

      <h2>Why it is used</h2>
      <p>
        Only to let you sign in, to decide which parts of the site you can open, to let the site owner see who has signed in, and to
        read and reply to messages you send, and keep the owner’s resume entries, Behavioral stories, answer preparation and articles available across devices.
        The legal basis is legitimate interest in running a personal portfolio site, and your choice to sign in.
      </p>

      <h2>Who processes it</h2>
      <ul>
        <li>Supabase (database and sign-in), hosted in London, UK.</li>
        <li>Vercel (website hosting and cookieless page-view counts).</li>
        <li>Google (only when you choose &quot;Sign in with Google&quot;).</li>
        <li>Resend (sends Jamie an email when a contact message or website feedback arrives).</li>
        <li>GitHub (runs the daily health check and stores the encrypted weekly backup).</li>
      </ul>

      <h2>How long it is kept</h2>
      <p>
        Your profile, sign-in records, contact messages and website feedback, plus the owner’s saved resume entries, Behavioral stories, answer preparation and articles, are kept until you ask for them to be deleted, or until the site no longer
        needs them. The coded IP address on a message is wiped after one hour. An encrypted weekly backup of the site&apos;s data is
        kept for 90 days, so deleted data is fully gone from backups within 90 days.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask to see, correct or delete your data, or object to its use, under UK GDPR.
        {contact ? (
          <>
            {" "}
            Email <a href={`mailto:${contact}`}>{contact}</a> and it will be handled within 30 days.
          </>
        ) : (
          " Use the contact details on the home page and it will be handled within 30 days."
        )}{" "}
        You can also remove this site&apos;s access from your Google account at any time at{" "}
        <a href="https://myaccount.google.com/permissions">myaccount.google.com/permissions</a>. You may complain to the UK
        Information Commissioner&apos;s Office (ico.org.uk).
      </p>

      <h2>Changes</h2>
      <p>If this site starts collecting anything new, this page is updated first, with a new date at the top.</p>
    </div>} />
  );
}
