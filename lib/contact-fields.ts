/** Browser-safe contact validation shared with feedback. */
export const CONTACT_LIMITS = { name: 100, email: 200, need: 4000, budget: 60 } as const;
export const BUDGETS = ["Free consultation", "Under £1k", "£1k–£5k", "£5k–£15k", "£15k+", "Not sure yet"] as const;

export interface ContactInput {
  name: string;
  email: string;
  need: string;
  budget: string;
}
export interface ContactResult {
  ok: boolean;
  message: string;
  /** Field values to put back after an error, so nothing typed is lost. */
  values?: ContactInput;
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function readContact(form: FormData): ContactInput {
  const get = (k: string) => String(form.get(k) ?? "").trim();
  return { name: get("name"), email: get("email").toLowerCase(), need: get("need"), budget: get("budget") };
}

/** Error message, or null when the message can be sent. */
export function validateContact(c: ContactInput): string | null {
  if (!c.name) return "Please add your name.";
  if (c.name.length > CONTACT_LIMITS.name) return "Your name is too long.";
  if (!EMAIL.test(c.email) || c.email.length > CONTACT_LIMITS.email) return "That doesn't look like an email address.";
  const messageError = validateMessageText(c.need);
  if (messageError) return messageError;
  if (!(BUDGETS as readonly string[]).includes(c.budget)) return "Please pick a budget (\"Not sure yet\" is fine).";
  return null;
}


export function validateMessageText(message:string,emptyMessage="Tell me a little about what you need."):string|null {
 if(!message.trim())return emptyMessage;
 if(message.length>CONTACT_LIMITS.need)return `Please keep it under ${CONTACT_LIMITS.need} characters.`;
 if(message.includes('\0'))return 'Text cannot contain NUL.';
 return null;
}
