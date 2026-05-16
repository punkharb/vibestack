import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
      <div className="max-w-2xl space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Claude Web Blueprint
        </h1>
        <p className="text-muted-foreground text-lg">
          Next.js 16 · Tailwind · shadcn/ui · Supabase · Express. Clone, rename,
          build.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/login" className={buttonVariants()}>
          Sign in
        </Link>
        <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
          Dashboard
        </Link>
      </div>
    </main>
  );
}
