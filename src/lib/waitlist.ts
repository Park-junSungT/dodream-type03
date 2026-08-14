/**
 * Waitlist submission.
 *
 * This is a fake-door MVP: with no endpoint configured, submissions are held
 * locally so the funnel can be exercised end to end. Point
 * `NEXT_PUBLIC_WAITLIST_ENDPOINT` at a real API (or swap `postToEndpoint` for
 * a Server Action) and nothing else in the UI has to change.
 */

export const WAITLIST_INTERESTS = [
  { value: "myself", label: "나를 위해" },
  { value: "family", label: "부모님 / 가족을 위해" },
  { value: "caregiver", label: "보호자를 위해" },
  { value: "other", label: "기타" },
] as const;

export type WaitlistInterest = (typeof WAITLIST_INTERESTS)[number]["value"];

export type WaitlistSubmission = {
  name: string;
  email: string;
  interest: WaitlistInterest;
};

export type WaitlistFieldErrors = Partial<
  Record<keyof WaitlistSubmission, string>
>;

export type WaitlistResult =
  | { ok: true }
  | { ok: false; message: string; fields?: WaitlistFieldErrors };

const ENDPOINT = process.env.NEXT_PUBLIC_WAITLIST_ENDPOINT;
const STORAGE_KEY = "dodream.waitlist";

/** Intentionally permissive — enough to catch typos, not to police addresses. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateWaitlist(
  submission: WaitlistSubmission,
): WaitlistFieldErrors {
  const errors: WaitlistFieldErrors = {};

  if (!submission.name.trim()) {
    errors.name = "이름을 입력해주세요.";
  }
  if (!submission.email.trim()) {
    errors.email = "이메일을 입력해주세요.";
  } else if (!EMAIL_PATTERN.test(submission.email.trim())) {
    errors.email = "이메일 형식을 확인해주세요.";
  }
  if (!submission.interest) {
    errors.interest = "하나를 선택해주세요.";
  }

  return errors;
}

export async function submitWaitlist(
  submission: WaitlistSubmission,
): Promise<WaitlistResult> {
  const fields = validateWaitlist(submission);
  if (Object.keys(fields).length > 0) {
    return { ok: false, message: "입력한 내용을 다시 확인해주세요.", fields };
  }

  const payload = {
    name: submission.name.trim(),
    email: submission.email.trim().toLowerCase(),
    interest: submission.interest,
    submittedAt: new Date().toISOString(),
  };

  try {
    if (ENDPOINT) {
      return await postToEndpoint(ENDPOINT, payload);
    }
    return await storeLocally(payload);
  } catch {
    return {
      ok: false,
      message: "문제가 발생했어요. 잠시 후 다시 시도해주세요.",
    };
  }
}

type StoredSubmission = WaitlistSubmission & { submittedAt: string };

async function postToEndpoint(
  endpoint: string,
  payload: StoredSubmission,
): Promise<WaitlistResult> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return {
      ok: false,
      message: "지금은 연결이 어려워요. 잠시 후 다시 시도해주세요.",
    };
  }
  return { ok: true };
}

/** Mocked persistence for the fake-door build. */
async function storeLocally(payload: StoredSubmission): Promise<WaitlistResult> {
  await new Promise((resolve) => setTimeout(resolve, 750));

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const existing: StoredSubmission[] = raw ? JSON.parse(raw) : [];
    existing.push(payload);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // Private browsing or a full quota shouldn't block the confirmation.
  }

  return { ok: true };
}
