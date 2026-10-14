import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Fuel,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — FuelPoint Console" },
      {
        name: "description",
        content: "Set a new password for your FuelPoint admin account.",
      },
    ],
  }),
  component: ResetPasswordPage,
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) || "",
  }),
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // If no token in URL, show an error immediately
  const missingToken = !token;

  // Auto-redirect to login 4 seconds after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate({ to: "/" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_URL}/auth/token-reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        toast.success("Password successfully changed.");
      } else {
        setError(data.error || "Failed to reset password. The link may have expired.");
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

        {missingToken ? (
          /* ─── Missing token state ─────────────────────────────────────── */
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="size-8 text-yellow-500 shrink-0" />
              <h2 className="text-2xl font-bold text-foreground">Invalid reset link</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This password reset link is invalid or missing a token. Please request a new reset
              link from the login page.
            </p>
            <div className="pt-4 flex gap-3">
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Request new link
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <ArrowLeft className="size-4" />
                Back to sign in
              </Link>
            </div>
          </div>
        ) : success ? (
          /* ─── Success state ───────────────────────────────────────────── */
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-8 text-green-500 shrink-0" />
              <h2 className="text-2xl font-bold text-foreground">Password successfully changed</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your admin password has been updated. You will be redirected to the login page in a
              few seconds.
            </p>
            <div className="pt-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <ArrowLeft className="size-4" />
                Sign in now
              </Link>
            </div>
          </div>
        ) : (
          /* ─── Reset form ──────────────────────────────────────────────── */
          <>
            <h2 className="text-2xl font-bold text-foreground">Set a new password</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Enter your new password below. Must be at least 8 characters.
            </p>

            <form onSubmit={submit} className="mt-8 space-y-5">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError("");
                    }}
                    className="pl-9 pr-10"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError("");
                    }}
                    className="pl-9 pr-10"
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Resetting password…
                  </>
                ) : (
                  "Set New Password"
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
