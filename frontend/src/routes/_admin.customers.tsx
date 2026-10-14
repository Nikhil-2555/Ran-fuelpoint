import { createFileRoute } from "@tanstack/react-router";
import { apiFetch } from "@/services/adminService";
import { Fuel, Search, UserPlus, Users, UserCheck, Pencil, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Column, DataTable } from "@/components/admin/DataTable";
import { GroupPill, PageHeader, Panel, StatCard, StatusBadge } from "@/components/admin/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdmin } from "@/lib/admin-store";
import {
  DEFAULT_GROUP_ID,
  buildOverview,
  exportCsv,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  relativeDays,
} from "@/services/adminService";
import type { Customer } from "@/services/types";

export const Route = createFileRoute("/_admin/customers")({
  head: () => ({
    meta: [
      { title: "Customers — FuelPoint Admin" },
      {
        name: "description",
        content:
          "Manage registered customers, assign discount groups and review fuelling activity.",
      },
      { property: "og:title", content: "Customers — FuelPoint Admin" },
      {
        property: "og:description",
        content: "Customer registrations, group assignment and discount received.",
      },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const { customers, groups, transactions, workers, assignCustomerGroup, saveCustomer, deleteCustomer } = useAdmin();
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const overview = useMemo(
    () => buildOverview(customers, workers, groups, transactions),
    [customers, workers, groups, transactions],
  );
  const groupName = (id: string) => groups.find((g) => g.id === id)?.name ?? "Unassigned";
  const groupPercent = (id: string) => groups.find((g) => g.id === id)?.discountPercent ?? 0;

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) =>
          (groupFilter === "all" || c.groupId === groupFilter) &&
          (statusFilter === "all" || c.status === statusFilter) &&
          (c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.phone.includes(query) ||
            c.id.toLowerCase().includes(query.toLowerCase())),
      ),
    [customers, query, groupFilter, statusFilter],
  );

  const selected = customers.find((c) => c.id === selectedId) ?? null;
  const selectedTxns = selected
    ? transactions.filter((t) => t.customerId === selected.id).slice(0, 8)
    : [];

  const columns: Column<Customer>[] = [
    {
      key: "name",
      header: "Customer",
      sortValue: (c) => c.name,
      render: (c) => (
        <div>
          <p className="font-medium text-foreground">{c.name}</p>
          <p className="text-xs text-muted-foreground">
            {c.phone} · {c.id}
          </p>
        </div>
      ),
    },
    {
      key: "group",
      header: "Group",
      sortValue: (c) => groupName(c.groupId),
      render: (c) =>
        c.groupId === DEFAULT_GROUP_ID ? (
          <span className="inline-flex items-center rounded-full bg-warning/18 px-2.5 py-1 text-xs font-semibold text-warning">
            Unassigned
          </span>
        ) : (
          <GroupPill name={groupName(c.groupId)} percent={groupPercent(c.groupId)} />
        ),
    },
    {
      key: "registered",
      header: "Registered",
      sortValue: (c) => c.registeredAt,
      render: (c) => <span className="text-sm">{formatDate(c.registeredAt)}</span>,
    },
    { key: "status", header: "Status", sortValue: (c) => c.status, render: (c) => <StatusBadge status={c.status} /> },
    {
      key: "txns",
      header: "Transactions",
      align: "right",
      sortValue: (c) => c.transactions,
      render: (c) => formatNumber(c.transactions),
    },
    {
      key: "discount",
      header: "Discount received",
      align: "right",
      sortValue: (c) => c.discountReceived,
      render: (c) => <span className="font-medium text-teal">{formatCurrency(c.discountReceived)}</span>,
    },
    {
      key: "last",
      header: "Last activity",
      align: "right",
      sortValue: (c) => c.lastActivity ?? "",
      render: (c) => <span className="text-xs text-muted-foreground">{relativeDays(c.lastActivity)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (c) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setEditingCustomer(c)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setDeletingCustomer(c)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="Registrations, group assignment and fuelling history."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                exportCsv(
                  "customers.csv",
                  filtered.map((c) => ({
                    ID: c.id,
                    Name: c.name,
                    Phone: c.phone,
                    Group: groupName(c.groupId),
                    Registered: formatDate(c.registeredAt),
                    Transactions: c.transactions,
                    Discount: c.discountReceived,
                    Status: c.status,
                  })),
                )
              }
            >
              Export CSV
            </Button>
            <Button
              onClick={() => setEditingCustomer({
                id: "",
                name: "",
                phone: "",
                email: "",
                vehicle: "",
                groupId: DEFAULT_GROUP_ID,
                status: "active",
                registeredAt: new Date().toISOString(),
                lastActivity: null,
                transactions: 0,
                totalSpend: 0,
                discountReceived: 0,
                password: "",
              })}
            >
              <Plus className="size-4" /> New Customer
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total customers" value={formatNumber(overview.totalCustomers)} icon={Users} />
        <StatCard
          label="New registrations"
          value={formatNumber(overview.newRegistrations7d)}
          icon={UserPlus}
          tone="warning"
          hint="last 7 days"
        />
        <StatCard
          label="Active customers"
          value={formatNumber(overview.activeCustomers)}
          icon={UserCheck}
          tone="teal"
        />
        <StatCard
          label="Used the pump"
          value={formatNumber(overview.usedPumpCustomers)}
          icon={Fuel}
          tone="navy"
          hint={`${overview.unassignedCustomers} awaiting group`}
        />
      </div>

      <Panel
        title="Customer directory"
        description="Click a row to open the customer profile and activity"
        className="mt-6"
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex min-w-56 flex-1 items-center gap-2 rounded-lg border border-border px-3 py-2">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, phone or customer ID"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <Select value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All groups</SelectItem>
              {groups.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable
          rows={filtered}
          columns={columns}
          pageSize={10}
          onRowClick={(c) => setSelectedId(c.id)}
        />
      </Panel>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <DialogContent className="sm:max-w-xl">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between pr-6">
                  <div>
                    <DialogTitle>{selected.name}</DialogTitle>
                    <DialogDescription>
                      {selected.email} · {selected.id} · {selected.phone} · {selected.vehicle}
                    </DialogDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      title="Edit customer"
                      onClick={() => {
                        setEditingCustomer(selected);
                        setSelectedId(null);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      title="Delete customer"
                      onClick={() => {
                        setDeletingCustomer(selected);
                        setSelectedId(null);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mt-2">
                {[
                  ["Registered", formatDate(selected.registeredAt)],
                  ["Transactions", formatNumber(selected.transactions)],
                  ["Total spend", formatCurrency(selected.totalSpend)],
                  ["Discount", formatCurrency(selected.discountReceived)],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-lg border border-border bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">{l}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{v}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-border p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Discount group
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Select
                    value={selected.groupId}
                    onValueChange={(v) => {
                      assignCustomerGroup(selected.id, v);
                      toast.success("Group updated", {
                        description: `${selected.name} moved to ${groupName(v)}.`,
                      });
                    }}
                  >
                    <SelectTrigger className="w-60"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {groups
                        .filter((g) => g.active || g.id === selected.groupId)
                        .map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.name} — {g.discountPercent}%
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              <div className="rounded-lg border border-border">
                <p className="border-b border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase">
                  Recent activity
                </p>
                <ul className="scrollbar-thin max-h-56 divide-y divide-border overflow-y-auto">
                  {selectedTxns.map((t) => (
                    <li key={t.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <span>
                        {t.fuel} · {t.litres} L
                        <span className="block text-xs text-muted-foreground">
                          {formatDateTime(t.createdAt)} · {t.workerName}
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
                  {selectedTxns.length === 0 && (
                    <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                      This customer hasn't fuelled yet.
                    </li>
                  )}
                </ul>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* Edit Customer Dialog */}
      <Dialog open={!!editingCustomer} onOpenChange={(o) => {
        if (!o) {
          setEditingCustomer(null);
          setConfirmPassword("");
          setFieldErrors({});
        }
      }}>
        <DialogContent className="sm:max-w-md">
          {editingCustomer && (
            <>
              <DialogHeader>
                <DialogTitle>{editingCustomer.id ? "Edit Customer" : "Create Customer"}</DialogTitle>
                <DialogDescription>
                  Update contact details or manually override customer status.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="c-name">Full name</Label>
                    <Input
                      id="c-name"
                      placeholder="e.g. Anil Kumar"
                      value={editingCustomer.name}
                      onChange={(e) => {
                        setEditingCustomer({ ...editingCustomer, name: e.target.value });
                        if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" });
                      }}
                      className={fieldErrors.name ? "border-destructive" : ""}
                    />
                    {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="c-phone">Phone number</Label>
                    <Input
                      id="c-phone"
                      placeholder="e.g. 9876543210"
                      value={editingCustomer.phone}
                      onChange={(e) => {
                        setEditingCustomer({ ...editingCustomer, phone: e.target.value });
                        if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: "" });
                      }}
                      className={fieldErrors.phone ? "border-destructive" : ""}
                    />
                    {fieldErrors.phone && <p className="text-xs text-destructive">{fieldErrors.phone}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-email">Email</Label>
                  <Input
                    id="c-email"
                    type="email"
                    placeholder="e.g. anil@example.com"
                    value={editingCustomer.email}
                    onChange={(e) => {
                      setEditingCustomer({ ...editingCustomer, email: e.target.value });
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                    }}
                    className={fieldErrors.email ? "border-destructive" : ""}
                  />
                  {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="c-password">{editingCustomer.id ? "New Password" : "Password"}</Label>
                    <div className="relative">
                      <Input
                        id="c-password"
                        type={showPassword ? "text" : "password"}
                        placeholder={editingCustomer.id ? "Leave blank to keep unchanged" : "Create password"}
                        value={editingCustomer.password || ""}
                        onChange={(e) => setEditingCustomer({ ...editingCustomer, password: e.target.value })}
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
                    <Label htmlFor="c-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="c-confirm-password"
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
                    <Label>Group Assignment</Label>
                    <Select
                      value={editingCustomer.groupId}
                      onValueChange={(v) => setEditingCustomer({ ...editingCustomer, groupId: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {groups.filter(g => g.active || g.id === editingCustomer.groupId).map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={editingCustomer.status}
                      onValueChange={(v: "active" | "inactive" | "pending") => setEditingCustomer({ ...editingCustomer, status: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => {
                  setEditingCustomer(null);
                  setConfirmPassword("");
                  setFieldErrors({});
                }}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!editingCustomer.name.trim() || !editingCustomer.email.trim() || !editingCustomer.phone.trim()) {
                      toast.error("Name, email, and phone are required.");
                      return;
                    }
                    if (editingCustomer.password && editingCustomer.password !== confirmPassword) {
                      toast.error("Passwords do not match.");
                      return;
                    }

                    try {
                      if (!editingCustomer.id) {
                        // Create customer in DB
                        const API_URL = import.meta.env.VITE_API_URL;
                        const res = await apiFetch(`${API_URL}/customers`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            name: editingCustomer.name,
                            phone: editingCustomer.phone,
                            email: editingCustomer.email,
                            vehicle: editingCustomer.vehicle,
                            password: editingCustomer.password,
                            group_id: editingCustomer.groupId,
                            status: editingCustomer.status,
                          }),
                        });
                        
                        const data = await res.json();
                        if (!res.ok) {
                          if (data.details) {
                            const errs: Record<string, string> = {};
                            data.details.forEach((e: any) => {
                              errs[e.path[e.path.length - 1]] = e.message;
                            });
                            setFieldErrors(errs);
                            return;
                          }
                          throw new Error(data.message || data.error || "Failed to create customer");
                        }
                        
                        // Map DB result to frontend model and save to React State
                        const dbCustomer = data.data;
                        const newCustomer: Customer = {
                          ...editingCustomer,
                          id: dbCustomer.id,
                          registeredAt: dbCustomer.registered_at,
                        };
                        saveCustomer(newCustomer);
                        toast.success("Customer created successfully");
                      } else {
                        // Update existing customer in DB
                        const API_URL = import.meta.env.VITE_API_URL;
                        const res = await apiFetch(`${API_URL}/customers/${editingCustomer.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            name: editingCustomer.name,
                            phone: editingCustomer.phone,
                            email: editingCustomer.email,
                            vehicle: editingCustomer.vehicle,
                            group_id: editingCustomer.groupId,
                            status: editingCustomer.status,
                          }),
                        });
                        
                        const data = await res.json();
                        if (!res.ok) {
                          if (data.details) {
                            const errs: Record<string, string> = {};
                            data.details.forEach((e: any) => {
                              errs[e.path[e.path.length - 1]] = e.message;
                            });
                            setFieldErrors(errs);
                            return;
                          }
                          throw new Error(data.message || data.error || "Failed to update customer");
                        }

                        saveCustomer(editingCustomer);
                        toast.success("Customer updated successfully");
                      }

                      setEditingCustomer(null);
                      setConfirmPassword("");
                      setFieldErrors({});
                    } catch (error: any) {
                      toast.error(error.message || "Something went wrong");
                    }
                  }}
                >
                  {editingCustomer.id ? "Update Customer" : "Create Customer"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Customer Alert */}
      <AlertDialog open={!!deletingCustomer} onOpenChange={(o) => !o && setDeletingCustomer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the customer account for{" "}
              <span className="font-semibold text-foreground">{deletingCustomer?.name}</span>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deletingCustomer) {
                  try {
                    const API_URL = import.meta.env.VITE_API_URL;
                    const res = await apiFetch(`${API_URL}/customers/${deletingCustomer.id}`, {
                      method: "DELETE"
                    });
                    if (!res.ok) {
                      const data = await res.json();
                      throw new Error(data.message || "Failed to delete customer");
                    }
                    deleteCustomer(deletingCustomer.id);
                    toast.success("Customer deleted");
                    setDeletingCustomer(null);
                  } catch (error: any) {
                    toast.error(error.message || "Something went wrong");
                  }
                }
              }}
            >
              Delete customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
