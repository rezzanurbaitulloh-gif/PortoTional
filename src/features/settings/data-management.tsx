"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DataManagement() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function deleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { deleteAccountAction } = await import("@/actions/account");
      const res = await deleteAccountAction({ password });
      if (!res.ok) throw new Error(res.error);
      toast.success("Account deleted. Goodbye — and good luck out there.");
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Deletion failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-ivory">Export my data</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">
          Download everything PortoTional stores about you as a single JSON
          file.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-2">
          <a href="/api/export" download>
            <Download /> Export my data
          </a>
        </Button>
      </div>

      {!confirming ? (
        <div>
          <p className="text-sm font-medium text-danger">Delete account</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            Permanently removes your profile, CVs, files, website and public
            presence. This cannot be undone.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 border-danger/40 text-danger hover:bg-danger/10"
            onClick={() => setConfirming(true)}
          >
            <Trash2 /> Delete account…
          </Button>
        </div>
      ) : (
        <form
          onSubmit={deleteAccount}
          className="rounded-lg border border-danger/40 bg-danger/[0.04] p-4"
        >
          <Label htmlFor="del-pw" className="text-sm font-medium text-danger">
            Confirm with your password
          </Label>
          <p className="mt-1 text-xs text-muted">
            This is final. All data will be permanently erased.
          </p>
          <Input
            id="del-pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="mt-2 max-w-xs"
          />
          <div className="mt-3 flex gap-2">
            <Button type="submit" variant="destructive" size="sm" disabled={busy}>
              <Trash2 /> {busy ? "Deleting…" : "Delete forever"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => {
                setConfirming(false);
                setPassword("");
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
