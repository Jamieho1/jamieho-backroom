import type { Metadata } from "next";
import { loadContentReview } from "@/lib/content-drafts/review";
import { ContentReviewList } from "@/components/content-drafts/review-list";
import "./review.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Review content · Jamie Ho", robots: { index: false, follow: false } };
export default async function ContentReviewPage() {
  const review = await loadContentReview();
  return <main className="app-page" data-app="content-review"><div className="app-page-content content-review-page">
    <h1>Review content</h1><p className="muted">Review proposed section edits before making them live.</p>
    <ContentReviewList {...review} />
  </div></main>;
}
