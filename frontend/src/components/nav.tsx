"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function Nav({ email }: { email: string | null }) {
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <Link href="/dashboard" className="font-semibold">
          Blueprint
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            Dashboard
          </Link>
          <Link
            href="/settings"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            Settings
          </Link>
          {email && (
            <span className="text-muted-foreground ml-2 text-sm">{email}</span>
          )}
          <Button size="sm" variant="outline" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </nav>
    </header>
  );
}
