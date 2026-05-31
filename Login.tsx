// ============================================================
// src/pages/Login.tsx
// Tela de autenticação.
// Visual alinhado ao dark theme do app existente.
// Simples: email + senha. Suporte a cadastro e login.
// ============================================================

import { useState } from "react";

interface LoginProps {
  onSignIn: (email: string, password: string) => Promise<{ error: string | null }>;
  onSignUp: (email: string, password: string) => Promise<{ error: string | null }>;
}

export function Login({ onSignIn, onSignUp }: LoginProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cls =
    "w-full rounded-xl px-4 py-3 text-sm text-white border border-white/10 outline-none focus:border-indigo-500 transition";
  const sty = { background: "rgba(255,255,255,0.06)" };

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === "login") {
      const { error } = await onSignIn(email, password);
      if (error) setError(error);
    } else {
      const { error } = await onSignUp(email, password);
      if (error) {
        setError(error);
      } else {
        setMessage(
          "Conta criada! Verifique seu e-mail para confirmar o cadastro, depois faça login."
        );
        setMode("login");
      }
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "#0a0f1a", fontFamily: "'DM Sans',system-ui,sans-serif" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/10 p-8 flex flex-col gap-6"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        {/* Logo / Título */}
        <div className="text-center">
          <p className="text-2xl font-bold text-white tracking-tight">
            Controle do Semestre
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {mode === "login" ? "Acesse sua conta" : "Crie sua conta"}
          </p>
        </div>

        {/* Campos */}
        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cls}
            style={sty}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <input
            type="password"
            placeholder="Senha (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cls}
            style={sty}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        {/* Erro */}
        {error && (
          <div
            className="rounded-xl px-4 py-3 text-sm text-red-400 border border-red-500/30"
            style={{ background: "rgba(239,68,68,0.08)" }}
          >
            {error}
          </div>
        )}

        {/* Mensagem de sucesso */}
        {message && (
          <div
            className="rounded-xl px-4 py-3 text-sm text-emerald-400 border border-emerald-500/30"
            style={{ background: "rgba(16,185,129,0.08)" }}
          >
            {message}
          </div>
        )}

        {/* Botão principal */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
        >
          {loading
            ? "Aguarde..."
            : mode === "login"
            ? "Entrar"
            : "Criar conta"}
        </button>

        {/* Alternar modo */}
        <button
          onClick={() => {
            setMode((m) => (m === "login" ? "signup" : "login"));
            setError(null);
            setMessage(null);
          }}
          className="text-xs text-slate-500 hover:text-slate-300 transition text-center"
        >
          {mode === "login"
            ? "Não tem conta? Criar conta"
            : "Já tem conta? Entrar"}
        </button>
      </div>
    </div>
  );
}
