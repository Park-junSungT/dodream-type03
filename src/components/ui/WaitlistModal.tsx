"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { experience, useExperience } from "@/lib/experience-store";
import {
  WAITLIST_INTERESTS,
  submitWaitlist,
  type WaitlistFieldErrors,
  type WaitlistInterest,
} from "@/lib/waitlist";
import { useReducedMotion } from "@/lib/use-reduced-motion";

type Status = "idle" | "submitting" | "done";

/**
 * The fake-door conversion.
 *
 * A real dialog: labelled, modal, focus-trapped, dismissible with Escape or a
 * click outside, and it hands focus back where it came from on close.
 */
export function WaitlistModal() {
  const open = useExperience((state) => state.waitlistOpen);
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? <WaitlistDialog reduced={reduced} /> : null}
    </AnimatePresence>
  );
}

function WaitlistDialog({ reduced }: { reduced: boolean }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const [status, setStatus] = useState<Status>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState<WaitlistInterest>("myself");
  const [errors, setErrors] = useState<WaitlistFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const close = useCallback(() => {
    experience.setWaitlistOpen(false);
  }, []);

  // Lock the page, remember where focus came from, and restore it on close.
  useEffect(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    document.body.setAttribute("data-scroll-locked", "true");
    const raf = requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(
        "input, button, [href], select, textarea",
      );
      first?.focus();
    });

    return () => {
      cancelAnimationFrame(raf);
      document.body.removeAttribute("data-scroll-locked");
      returnFocusRef.current?.focus?.();
    };
  }, []);

  // Escape closes; Tab cycles inside the panel.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [close]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setFormError(null);

    const result = await submitWaitlist({ name, email, interest });

    if (result.ok) {
      setErrors({});
      setStatus("done");
      experience.setWaitlistJoined(true);
      return;
    }

    setErrors(result.fields ?? {});
    setFormError(result.fields ? null : result.message);
    setStatus("idle");
  };

  const duration = reduced ? 0.15 : 0.5;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgb(8 8 10 / 0.55)" }}
        onClick={close}
        aria-hidden="true"
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        /*
         * The form is taller than a landscape phone, so the panel is capped to
         * the viewport and scrolls inside itself rather than running off both
         * edges and putting the first field out of reach.
         */
        className="relative max-h-[calc(100svh-2rem)] w-full max-w-[30rem] overflow-y-auto overscroll-contain rounded-[1.5rem] p-7 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.45)] sm:p-9"
        style={{
          backgroundColor: "var(--stage-bg)",
          border: "1px solid rgb(var(--stage-line) / 0.1)",
        }}
        initial={{ opacity: 0, y: reduced ? 0 : 28, scale: reduced ? 1 : 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: reduced ? 0 : 16, scale: reduced ? 1 : 0.99 }}
        transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-faint transition-colors hover:text-[rgb(var(--stage-ink))]"
        >
          <span className="sr-only">닫기</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 1L13 13M13 1L1 13"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {status === "done" ? (
          <div className="py-4">
            <p className="eyebrow">두드림</p>
            <h2 id={titleId} className="display-md mt-4">
              신청서가 등록 되었습니다.
            </h2>
            <p id={descriptionId} className="lede mt-4">
              이메일로 안내 메일을 보내드리겠습니다.
            </p>
            <button
              type="button"
              onClick={close}
              className="btn btn-ghost mt-8 w-full"
            >
              닫기
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <p className="eyebrow">스마트 지팡이 신청서</p>
            <h2 id={titleId} className="display-md mt-4">
              스마트 지팡이 신청
            </h2>
            <p id={descriptionId} className="lede mt-3 text-[0.9375rem]">
              이메일을 입력해 주시면 안내 메일을 보내드릴게요
            </p>

            <div className="mt-7 flex flex-col gap-5">
              <Field
                id="dd-name"
                label="이름"
                error={errors.name}
                input={
                  <input
                    id="dd-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    className="field-input"
                    placeholder="이름을 입력해주세요"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "dd-name-error" : undefined}
                  />
                }
              />

              <Field
                id="dd-email"
                label="이메일"
                error={errors.email}
                input={
                  <input
                    id="dd-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    className="field-input"
                    placeholder="이메일을 입력해주세요"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "dd-email-error" : undefined}
                  />
                }
              />

              <fieldset>
                <legend className="field-label">
                  누구를 위해 알아보고 계신가요?
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {WAITLIST_INTERESTS.map((option) => (
                    <label
                      key={option.value}
                      className="relative flex cursor-pointer items-center rounded-xl border px-3 py-3 text-[0.8125rem] transition-colors"
                      style={{
                        borderColor:
                          interest === option.value
                            ? "rgb(var(--stage-accent) / 0.65)"
                            : "rgb(var(--stage-line) / 0.14)",
                        backgroundColor:
                          interest === option.value
                            ? "rgb(var(--stage-accent) / 0.08)"
                            : "rgb(var(--stage-ink) / 0.02)",
                      }}
                    >
                      <input
                        type="radio"
                        name="interest"
                        value={option.value}
                        checked={interest === option.value}
                        onChange={() => setInterest(option.value)}
                        className="peer sr-only"
                      />
                      <span className="peer-focus-visible:underline">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            {formError ? (
              <p role="alert" className="mt-5 text-[0.8125rem] text-[#b4472f]">
                {formError}
              </p>
            ) : null}

            <button
              type="submit"
              className="btn btn-primary mt-7 w-full"
              disabled={status === "submitting"}
              style={{ opacity: status === "submitting" ? 0.65 : 1 }}
            >
              {status === "submitting" ? "신청 중…" : "바로가기"}
            </button>

            {/* <p className="mt-4 text-center text-[0.6875rem] leading-relaxed text-faint">
              입력하신 정보는 DoDream 소식 전달에만 사용합니다.
            </p> */}
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

function Field({
  id,
  label,
  error,
  input,
}: {
  id: string;
  label: string;
  error?: string;
  input: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {input}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-[0.75rem] text-[#b4472f]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
