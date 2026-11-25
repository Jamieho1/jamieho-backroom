/**
 * Tables that belong to PassLoop's own repo now (PL4). They stay in the shared database (nothing is dropped) and are
 * exported by PassLoop's manifest, so this site's scripts/export-tables.json must NOT list them.
 */
export const PASSLOOP_TABLES = [
  "notes", "question_notes", "practice_code", "practice_attempts", "practice_stars", "practice_cases", "practice_complexities", "practice_submissions",
  "user_resumes", "resume_templates",
  "interview_behavioral_themes", "interview_behavioral_questions", "interview_behavioral_custom_questions", "interview_behavioral_answers",
  "companies", "company_questions", "interview_experiences",
  "system_design_questions", "system_design_quiz_attempts", "system_design_progress", "system_design_whiteboards", "system_design_attempts",
] as const;
