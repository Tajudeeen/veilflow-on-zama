"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Loader2, LockKeyhole, Shield, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { describeDecision, runPrivateStrategy, type VeilFlowResult } from "@/lib/veilflow";

type Phase = "idle" | "encrypting" | "submitted" | "evaluating" | "executing" | "complete" | "error";

const phaseCopy: Record<Phase, string> = {
  idle: "Ready",
  encrypting: "Encrypting intent locally",
  submitted: "Encrypted strategy submitted",
  evaluating: "Evaluating with fhEVM",
  executing: "Executing private decision",
  complete: "Result returned",
  error: "Action needs attention"
};

function Field({
  label,
  value,
  onChange,
  hint
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint: string;
}) {
  return (
    <label className="block rounded-lg border border-veil-line bg-veil-black/40 p-4">
      <span className="flex items-center justify-between gap-4 text-sm text-veil-muted">
        <span>{label}</span>
        <span className="font-medium text-veil-ink">{value}</span>
      </span>
      <input
        className="range mt-4"
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="mt-3 block text-xs leading-5 text-veil-muted">{hint}</span>
    </label>
  );
}

export function StrategyPanel() {
  const [risk, setRisk] = useState(42);
  const [allocation, setAllocation] = useState(68);
  const [condition, setCondition] = useState(58);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<VeilFlowResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const busy = ["encrypting", "submitted", "evaluating", "executing"].includes(phase);
  const showForm = phase === "idle" || phase === "error";

  const outcome = useMemo(() => describeDecision(result?.decisionCode ?? null), [result]);

  async function submit() {
    setError(null);
    setResult(null);

    try {
      setPhase("encrypting");
      await new Promise((resolve) => window.setTimeout(resolve, 350));
      setPhase("submitted");
      await new Promise((resolve) => window.setTimeout(resolve, 250));
      setPhase("evaluating");

      const privateResult = await runPrivateStrategy({ risk, allocation, condition });

      setPhase("executing");
      await new Promise((resolve) => window.setTimeout(resolve, 250));
      setResult(privateResult);
      setPhase("complete");
    } catch (caught) {
      setPhase("error");
      setError(caught instanceof Error ? caught.message : "The private execution flow failed.");
    }
  }

  return (
    <section id="engine" className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="rounded-lg border border-veil-line bg-veil-panel p-5 shadow-quiet sm:p-6"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-veil-yellow">Strategy Panel</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-normal text-veil-ink">Private inputs</h2>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-veil-line bg-veil-black">
              <LockKeyhole className="h-5 w-5 text-veil-yellow" aria-hidden="true" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <Field
                  label="Risk level"
                  value={risk}
                  onChange={setRisk}
                  hint="A private tolerance signal. High risk automatically reduces the execution size."
                />
                <Field
                  label="Allocation preference"
                  value={allocation}
                  onChange={setAllocation}
                  hint="A private allocation intent. It is never written as plaintext."
                />
                <Field
                  label="Trigger condition"
                  value={condition}
                  onChange={setCondition}
                  hint="A private threshold signal. If it does not pass, the engine reduces exposure."
                />
              </motion.div>
            ) : (
              <motion.div
                key="sealed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-lg border border-veil-line bg-veil-black/50 p-5"
              >
                <p className="text-sm text-veil-muted">Submitted strategy</p>
                <p className="mt-3 text-xl font-semibold text-veil-ink">Inputs sealed onchain</p>
                <p className="mt-3 text-sm leading-6 text-veil-muted">
                  Risk, allocation, and trigger values are now represented only as ciphertext handles.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-veil-purple px-5 text-sm font-semibold text-white transition hover:bg-veil-violet disabled:cursor-not-allowed disabled:opacity-65"
            type="button"
            disabled={busy}
            onClick={submit}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Shield className="h-4 w-4" />}
            {busy ? phaseCopy[phase] : "Encrypt & Submit"}
          </button>

          {error ? <p className="mt-4 text-sm leading-6 text-red-300">{error}</p> : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="rounded-lg border border-veil-line bg-veil-panel p-5 shadow-quiet sm:p-6"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-veil-yellow">Action State</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-normal text-veil-ink">Confidential flow</h2>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-veil-line bg-veil-black">
              <Wallet className="h-5 w-5 text-veil-purple" aria-hidden="true" />
            </div>
          </div>

          <div className="space-y-3">
            {(["encrypting", "submitted", "evaluating", "executing", "complete"] as Phase[]).map((item, index) => {
              const activeIndex = ["idle", "encrypting", "submitted", "evaluating", "executing", "complete"].indexOf(
                phase
              );
              const itemIndex = ["idle", "encrypting", "submitted", "evaluating", "executing", "complete"].indexOf(
                item
              );
              const done = activeIndex > itemIndex || phase === "complete";
              const active = phase === item;

              return (
                <div
                  className="flex min-h-14 items-center gap-4 rounded-lg border border-veil-line bg-veil-black/40 px-4"
                  key={item}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-veil-line">
                    {done ? (
                      <Check className="h-4 w-4 text-veil-yellow" aria-hidden="true" />
                    ) : active ? (
                      <Loader2 className="h-4 w-4 animate-spin text-veil-purple" aria-hidden="true" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-veil-line" />
                    )}
                  </div>
                  <span className={active || done ? "text-sm text-veil-ink" : "text-sm text-veil-muted"}>
                    {phaseCopy[item]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-lg border border-veil-line bg-veil-black p-5">
            <p className="text-sm text-veil-muted">Result View</p>
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="mt-3 text-2xl font-semibold text-veil-ink">{outcome}</p>
                  <p className="mt-3 break-all text-xs leading-5 text-veil-muted">Tx: {result.transactionHash}</p>
                </motion.div>
              ) : (
                <motion.p
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 text-lg font-medium text-veil-ink"
                >
                  No public intent exposed.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <a
        href="#why-fhe"
        className="mx-auto mt-10 flex w-fit items-center gap-2 text-sm font-medium text-veil-yellow transition hover:text-veil-ink"
      >
        Why this needs FHE <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </a>
    </section>
  );
}
