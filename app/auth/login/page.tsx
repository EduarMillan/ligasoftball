"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Credenciales inválidas.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Liga <span className="text-amber-500">Softball</span>
          </h1>
          <p className="text-sm text-zinc-400">Acceso de administrador</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="admin@ejemplo.com"
            required
            autoComplete="email"
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Contraseña"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Iniciar Sesión
          </Button>
        </form>

        <p className="text-[11px] text-zinc-600 text-center">
          Desarrollada por Ing. Eduardo Millán Nuñez
        </p>
      </div>
    </div>
  );
}
