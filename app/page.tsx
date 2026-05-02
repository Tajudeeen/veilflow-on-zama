import { ArrowDown, LockKeyhole, ShieldCheck } from "lucide-react";
import { StrategyPanel } from "@/components/StrategyPanel";

export default function Home() {
  return (
    <main className="min-h-screen bg-veil-black text-veil-ink">
      <section className="mx-auto flex min-h-[92vh] w-full max-w-6xl flex-col justify-between px-5 py-6 sm:px-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-veil-line bg-veil-panel">
              <LockKeyhole className="h-4 w-4 text-veil-yellow" aria-hidden="true" />
            </div>
            <span className="text-base font-semibold">VeilFlow</span>
          </div>
          <span className="rounded-full border border-veil-line px-3 py-1 text-xs text-veil-muted">Sepolia fhEVM</span>
        </nav>

        <div className="max-w-3xl pb-12 pt-24 sm:pb-16">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-veil-line bg-veil-panel px-3 py-1 text-sm text-veil-muted">
            <ShieldCheck className="h-4 w-4 text-veil-yellow" aria-hidden="true" />
            Private Strategy Engine for Onchain Finance
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.04] tracking-normal text-veil-ink sm:text-6xl">
            Execute strategy without revealing intent.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-veil-muted">
            VeilFlow encrypts financial strategy inputs, evaluates them with Zama&apos;s fhEVM, and returns only the
            decision outcome. It is a confidential decision layer, not a trading platform.
          </p>
          <a
            href="#engine"
            className="mt-9 inline-flex min-h-12 items-center gap-3 rounded-lg bg-veil-purple px-5 text-sm font-semibold text-white transition hover:bg-veil-violet"
          >
            Open engine <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <div className="grid gap-4 border-t border-veil-line pt-6 text-sm text-veil-muted sm:grid-cols-3">
          <p>Public DeFi leaks intent before action.</p>
          <p>Strategy thresholds become exploitable signals.</p>
          <p>FHE computes while inputs remain encrypted.</p>
        </div>
      </section>

      <StrategyPanel />

      <section id="why-fhe" className="border-t border-veil-line bg-veil-panel/60">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
          <div>
            <p className="text-sm font-medium text-veil-yellow">Why FHE</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-veil-ink">Onchain finance exposes actions.</h2>
            <p className="mt-4 text-base leading-7 text-veil-muted">
              VeilFlow protects intent. Strategy values are encrypted before submission, branch logic runs over encrypted
              types, and the contract never decrypts sensitive state.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Leakage", "Plain thresholds reveal positioning before execution."],
              ["Front-running", "Visible intent becomes a market signal for others."],
              ["Institutional fit", "Private mandates need verifiable execution without public strategy disclosure."]
            ].map(([title, body]) => (
              <article className="rounded-lg border border-veil-line bg-veil-black p-5" key={title}>
                <h3 className="text-base font-semibold text-veil-ink">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-veil-muted">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
