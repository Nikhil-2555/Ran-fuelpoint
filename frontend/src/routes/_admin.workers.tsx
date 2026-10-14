import { createFileRoute } from "@tanstack/react-router";
import { Activity, BadgePercent, Search, UserCheck, Wrench, Pencil, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { apiFetch } from "@/services/adminService";
import { useMemo, useState } from "react";
import { HorizontalBarChart } from "@/components/admin/charts";
import { Column, DataTable } from "@/components/admin/DataTable";
import { PageHeader, Panel, StatCard, StatusBadge } from "@/components/admin/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdmin } from "@/lib/admin-store";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  relativeDays,
} from "@/services/adminService";
import type { Worker } from "@/services/types";

export const Route = createFileRoute("/_admin/workers")({
  head: () => ({
    meta: [
      { title: "Workers — FuelPoint Admin" },
      {
        name: "description",
        content: "Manage pump workers, monitor scans, transactions handled and discount processed.",
      },
      { property: "og:title", content: "Workers — FuelPoint Admin" },
      {
        property: "og:description",
        content: "Worker performance: scans, customers scanned and discount processed.",
      },
    ],
  }),
  component: WorkersPage,
});

function WorkersPage() {
  const { workers, transactions, saveWorker, deleteWorker } = useAdmin();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [shift, setShift] = useState("all");
  const [selected, setSelected] = useState<Worker | null>(null);
  
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletingWorker, setDeletingWorker] = useState<Worker | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const filtered = useMemo(
    () =>
      workers.filter(
        (w) =>
          (status === "all" || w.status === status) &&
          (shift === "all" || w.shift === shift) &&
          (w.name.toLowerCase().includes(query.toLowerCase()) ||
            w.id.toLowerCase().includes(query.toLowerCase()) ||
            w.email.toLowerCase().includes(query.toLowerCase())),
      ),
    [workers, query, status, shift],
  );

  const totals = useMemo(
    () => ({
      scans: workers.reduce((s, w) => s + w.scans, 0),
      discount: workers.reduce((s, w) => s + w.discountProcessed, 0),
      active: workers.filter((w) => w.status === "active").length,
    }),
    [workers],
  );



  const columns: Column<Worker>[] = [
    {
      key: "name",
      header: "Worker",
      sortValue: (w) => w.name,
      render: (w) => (
        <div className="flex items-center gap-3">
          <span className="gradient-brand flex size-9 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground">
            {w.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </span>
          <div>
            <p className="font-medium text-foreground">{w.name}</p>
            <p className="text-xs text-muted-foreground">
              {w.id} · {w.shift} shift
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortValue: (w) => w.status,
      render: (w) => <StatusBadge status={w.status} />,
    },
    {
      key: "scans",
      header: "Scans",
      align: "right",
      sortValue: (w) => w.scans,
      render: (w) => formatNumber(w.scans),
    },
    {
      key: "customers",
      header: "Customers",
      align: "right",
      sortValue: (w) => w.customersScanned,
      render: (w) => formatNumber(w.customersScanned),
    },
    {
      key: "transactions",
      header: "Transactions",
      align: "right",
      sortValue: (w) => w.transactions,
      render: (w) => formatNumber(w.transactions),
    },
    {
      key: "discount",
      header: "Discount processed",
      align: "right",
      sortValue: (w) => w.discountProcessed,
      render: (w) => (
        <span className="font-medium text-teal">{formatCurrency(w.discountProcessed)}</span>
      ),
    },
    {
      key: "last",
      header: "Last activity",
      align: "right",
      sortValue: (w) => w.lastActivity,
      render: (w) => (
        <span className="text-xs text-muted-foreground">{relativeDays(w.lastActivity)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (w) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setEditingWorker(w)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setDeletingWorker(w)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  const workerTxns = selected
    ? transactions.filter((t) => t.workerId === selected.id).slice(0, 8)
    : [];

  return (
    <>
      <PageHeader
        title="Workers"
        subtitle="Scanning activity and discount handling per worker."
        actions={
          <Button
            onClick={() => setEditingWorker({
              id: "",
              name: "",
              email: "",
              phone: "",
              shift: "Morning",
              status: "active",
              joinedAt: new Date().toISOString(),
              scans: 0,
              customersScanned: 0,
              transactions: 0,
              discountProcessed: 0,
              lastActivity: new Date().toISOString(),
              password: "",
            })}
          >
            <Plus className="size-4" /> New Worker
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total workers" value={formatNumber(workers.length)} icon={Wrench} />
        <StatCard
          label="Active workers"
          value={formatNumber(totals.active)}
          icon={UserCheck}
          tone="teal"
        />
        <StatCard
          label="Total scans"
          value={formatNumber(totals.scans)}
          icon={Activity}
          tone="navy"
        />
        <StatCard
          label="Discount processed"
          value={formatCurrency(totals.discount)}
          icon={BadgePercent}
          tone="teal"
        />
      </div>

      {/* Full-width Worker Directory */}
      <Panel
        title="Worker directory"
        description="Search, filter and sort the team"
        className="mt-6"
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex min-w-56 flex-1 items-center gap-2 rounded-lg border border-border px-3 py-2">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, ID or email"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <Select value={shift} onValueChange={setShift}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All shifts</SelectItem>
              <SelectItem value="Morning">Morning</SelectItem>
              <SelectItem value="Evening">Evening</SelectItem>
              <SelectItem value="Night">Night</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DataTable rows={filtered} columns={columns} pageSize={10} onRowClick={setSelected} />
      </Panel>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>
                  {selected.email} · {selected.id} · {selected.shift} shift · joined {formatDate(selected.joinedAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Scans", formatNumber(selected.scans)],
                  ["Customers", formatNumber(selected.customersScanned)],
                  ["Transactions", formatNumber(selected.transactions)],
                  ["Discount", formatCurrency(selected.discountProcessed)],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-lg border border-border bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">{l}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{v}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-border">
                <p className="border-b border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase">
                  Recent activity
                </p>
                <ul className="scrollbar-thin max-h-64 divide-y divide-border overflow-y-auto">
                  {workerTxns.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                    >
                      <span>
                        <span className="font-medium">{t.customerName}</span>
                        <span className="block text-xs text-muted-foreground">
                          {formatDateTime(t.createdAt)} · {t.fuel}
                        </span>
                      </span>
                      <span className="text-right">
                        {formatCurrency(t.amount)}
                        <span className="block text-xs text-teal">
                          −{formatCurrency(t.discountAmount)}
                        </span>
                      </span>
                    </li>
                  ))}
                  {workerTxns.length === 0 && (
                    <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No transactions recorded.
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex items-center justify-between gap-3">
                <StatusBadge status={selected.status} />
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      setDeletingWorker(selected);
                      setSelected(null);
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingWorker(selected);
                      setSelected(null);
                    }}
                  >
                    Edit
                  </Button>
                  <Button variant="default" onClick={() => setSelected(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Worker Dialog */}
      <Dialog open={!!editingWorker} onOpenChange={(o) => {
        if (!o) {
          setEditingWorker(null);
          setFieldErrors({});
        }
      }}>
        <DialogContent className="sm:max-w-md">
          {editingWorker && (
            <>
              <DialogHeader>
                <DialogTitle>{editingWorker.id ? "Edit Worker" : "Create Worker"}</DialogTitle>
                <DialogDescription>
                  Update basic info and shift assignment.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="w-name">Full name</Label>
                    <Input
                      id="w-name"
                      placeholder="e.g. Ramesh Singh"
                      value={editingWorker.name}
                      onChange={(e) => {
                        setEditingWorker({ ...editingWorker, name: e.target.value });
                        if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" });
                      }}
                      className={fieldErrors.name ? "border-destructive" : ""}
                    />
                    {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="w-phone">Phone number</Label>
                    <Input
                      id="w-phone"
                      placeholder="e.g. 9876543210"
                      value={editingWorker.phone}
                      onChange={(e) => {
                        setEditingWorker({ ...editingWorker, phone: e.target.value });
                        if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: "" });
                      }}
                      className={fieldErrors.phone ? "border-destructive" : ""}
                    />
                    {fieldErrors.phone && <p className="text-xs text-destructive">{fieldErrors.phone}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="w-email">Email</Label>
                  <Input
                    id="w-email"
                    type="email"
                    placeholder="e.g. ramesh@fuelpoint.in"
                    value={editingWorker.email}
                    onChange={(e) => {
                      setEditingWorker({ ...editingWorker, email: e.target.value });
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                    }}
                    className={fieldErrors.email ? "border-destructive" : ""}
                  />
                  {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="w-password">{editingWorker.id ? "New Password" : "Password"}</Label>
                    <div className="relative">
                      <Input
                        id="w-password"
                        type={showPassword ? "text" : "password"}
                        placeholder={editingWorker.id ? "Leave blank to keep unchanged" : "Create password"}
                        value={editingWorker.password || ""}
                        onChange={(e) => setEditingWorker({ ...editingWorker, password: e.target.value })}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="w-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="w-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Shift</Label>
                    <Select
                      value={editingWorker.shift}
                      onValueChange={(v: "Morning" | "Evening" | "Night") => setEditingWorker({ ...editingWorker, shift: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Morning">Morning</SelectItem>
                        <SelectItem value="Evening">Evening</SelectItem>
                        <SelectItem value="Night">Night</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={editingWorker.status}
                      onValueChange={(v: "active" | "offline" | "suspended") => setEditingWorker({ ...editingWorker, status: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => {
                  setEditingWorker(null);
                  setConfirmPassword("");
                  setFieldErrors({});
                }}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!editingWorker.name.trim() || !editingWorker.email.trim() || !editingWorker.phone.trim()) {
                      toast.error("Name, email, and phone are required.");
                      return;
                    }
                    if (editingWorker.password && editingWorker.password !== confirmPassword) {
                      toast.error("Passwords do not match.");
                      return;
                    }

                    try {
                      if (!editingWorker.id) {
                        // Create worker in backend database
                        const API_URL = import.meta.env.VITE_API_URL;
                        const res = await apiFetch(`${API_URL}/workers`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            name: editingWorker.name,
                            email: editingWorker.email,
                            phone: editingWorker.phone,
                            password: editingWorker.password,
                            shift: editingWorker.shift || "Morning",
                            status: editingWorker.status || "active",
                          }),
                        });

                        const result = await res.json();
                        if (!res.ok) {
                          if (result.details) {
                            const errs: Record<string, string> = {};
                            result.details.forEach((e: any) => {
                              errs[e.path[e.path.length - 1]] = e.message;
                            });
                            setFieldErrors(errs);
                            return;
                          }
                          throw new Error(result.error || result.message || "Failed to create worker");
                        }

                        // Sync with frontend local state
                        saveWorker({
                          ...editingWorker,
                          id: result.data.id,
                          joined: result.data.joined_at ? new Date(result.data.joined_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
                          scans: 0,
                          discountProcessed: 0,
                        });
                        toast.success("Worker created successfully");
                      } else {
                        // Update worker in DB
                        const API_URL = import.meta.env.VITE_API_URL;
                        const res = await apiFetch(`${API_URL}/workers/${editingWorker.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            name: editingWorker.name,
                            email: editingWorker.email,
                            phone: editingWorker.phone,
                            shift: editingWorker.shift || "Morning",
                            status: editingWorker.status || "active",
                          }),
                        });
                        const result = await res.json();
                        if (!res.ok) {
                          if (result.details) {
                            const errs: Record<string, string> = {};
                            result.details.forEach((e: any) => {
                              errs[e.path[e.path.length - 1]] = e.message;
                            });
                            setFieldErrors(errs);
                            return;
                          }
                          throw new Error(result.error || result.message || "Failed to update worker");
                        }
                        
                        saveWorker(editingWorker);
                        toast.success("Worker updated successfully");
                      }
                      setEditingWorker(null);
                      setConfirmPassword("");
                      setFieldErrors({});
                    } catch (err: any) {
                      toast.error(err.message || "Failed to save worker");
                    }
                  }}
                >
                  {editingWorker.id ? "Update Worker" : "Create Worker"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Worker Alert */}
      <AlertDialog open={!!deletingWorker} onOpenChange={(o) => !o && setDeletingWorker(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the worker profile for{" "}
              <span className="font-semibold text-foreground">{deletingWorker?.name}</span>.
              They will no longer be able to log in or process scans.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deletingWorker) {
                  try {
                    const API_URL = import.meta.env.VITE_API_URL;
                    const res = await apiFetch(`${API_URL}/workers/${deletingWorker.id}`, {
                      method: "DELETE"
                    });
                    if (!res.ok) {
                      const data = await res.json();
                      throw new Error(data.message || data.error || "Failed to delete worker");
                    }
                    deleteWorker(deletingWorker.id);
                    toast.success("Worker deleted");
                    setDeletingWorker(null);
                  } catch (err: any) {
                    toast.error(err.message || "Failed to delete worker");
                  }
                }
              }}
            >
              Delete worker
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
