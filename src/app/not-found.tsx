import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-mist">404</p>
      <h1 className="mt-4 font-display text-5xl">That cut doesn&apos;t exist.</h1>
      <Link href="/studio" className="mt-8 inline-block rounded-xl bg-volt text-white hover:bg-slate-800 px-5 py-2 font-semibold">
        Back to studio
      </Link>
    </main>
  );
}
