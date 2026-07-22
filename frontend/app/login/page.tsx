"use client";

import { useState } from "react";
import Link from "next/link";
import { useLogin } from "@/hooks/useAuth";
import { Button, ErrorNote } from "@/components/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login.mutate({ email, password });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-3xl font-semibold text-plum">Pantry</p>
          <p className="mt-1 text-sm text-ink-soft">Welcome back. Let's see what's cooking.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-lg border border-line bg-white p-6"
        >
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-plum"
              placeholder="you@example.com"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-plum"
              placeholder="••••••••"
            />
          </label>

          {login.isError && <ErrorNote message={(login.error as Error).message} />}

          <Button type="submit" disabled={login.isPending} className="mt-1">
            {login.isPending ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-ink-soft">
          No account yet?{" "}
          <Link href="/register" className="font-medium text-plum hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
