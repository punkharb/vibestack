"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type MeResponse = { user: { id: string; email: string | null } };

export default function DashboardPage() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<MeResponse>("/me")
      .then(setMe)
      .catch((e) => setError(e?.message ?? "Failed to load /me"));
  }, []);

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Protected route. Example of frontend calling the Express backend with
          a Supabase bearer token.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>GET /me (backend)</CardTitle>
          <CardDescription>
            Authenticated call to the Express API, verified via Supabase JWT.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-destructive text-sm">{error}</p>}
          {!error && !me && (
            <p className="text-muted-foreground text-sm">Loading…</p>
          )}
          {me && (
            <pre className="bg-muted overflow-auto rounded-md p-3 text-sm">
              {JSON.stringify(me, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
