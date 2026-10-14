import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Fuel, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — FuelPoint Console" },
      {
        name: "description",
        content: "Request a password reset link for your FuelPoint admin account.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        // Show error from server (usually validation) but the server will never
        // reveal whether the email exists or not.
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Unable to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <span className="gradient-brand flex size-10 items-center justify-center rounded-xl text-primary-foreground">
            <Fuel className="size-5" />
          </span>
          <p className="font-semibold text-foreground">FuelPoint Admin</p>
        </div>

        {sent ? (
          /* ─── Success state ───────────────────────────────────────────── */
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-8 text-green-500 shrink-0" />
              <h2 className="text-2xl font-bold text-foreground">Check your email</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If this email is registered, a password reset link has been sent.
              Please check your inbox (and spam folder) for a message from FuelPoint Admin.
            </p>
            <p className="text-xs text-muted-foreground">
              The reset link expires in <strong>30 minutes</strong>.
            </p>
            <div className="pt-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <ArrowLeft className="size-4" />
                Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          /* ─── Form state ──────────────────────────────────────────────── */
          <>
            <h2 className="text-2xl font-bold text-foreground">Forgot your password?</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Enter the email address associated with your admin account and we'll send you a link
              to reset your password.
            </p>

            <form onSubmit={submit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    className="pl-9"
                    placeholder="admin@fuelpoint.in"
                    autoComplete="email"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Sending reset link…
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>

            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <ArrowLeft className="size-4" />
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
