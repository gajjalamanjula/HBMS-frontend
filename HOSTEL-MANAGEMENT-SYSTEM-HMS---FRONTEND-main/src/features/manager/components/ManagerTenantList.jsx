import { LogOut } from 'lucide-react';

import { ManagerEmptyState } from './ManagerPhase5States';

export default function ManagerTenantList({
  tenants,
  onCheckout,
  checkoutId = '',
  compact = false,
}) {
  if (!tenants.length) {
    return (
      <ManagerEmptyState
        title="No tenants found"
        message="No tenants found for this branch."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <Header>Tenant</Header>
              <Header>Phone</Header>
              {!compact ? <Header>Role</Header> : null}
              {onCheckout ? <Header align="right">Action</Header> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-950">{tenant.name}</p>
                  <p className="break-all text-xs text-slate-500">{tenant.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-700">{tenant.phone}</td>
                {!compact ? <td className="px-4 py-3 text-slate-700">{tenant.role}</td> : null}
                {onCheckout ? (
                  <td className="px-4 py-3 text-right">
                    <CheckoutButton
                      tenant={tenant}
                      onCheckout={onCheckout}
                      checkoutId={checkoutId}
                    />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 md:hidden">
        {tenants.map((tenant) => (
          <article key={tenant.id} className="rounded-lg border border-slate-200 p-4">
            <p className="font-semibold text-slate-950">{tenant.name}</p>
            <p className="mt-1 break-all text-xs text-slate-500">{tenant.email}</p>
            <div className="mt-3 grid gap-2 text-sm text-slate-700">
              <p>Phone: {tenant.phone}</p>
              {!compact ? <p>Role: {tenant.role}</p> : null}
            </div>
            {onCheckout ? (
              <div className="mt-4">
                <CheckoutButton
                  tenant={tenant}
                  onCheckout={onCheckout}
                  checkoutId={checkoutId}
                />
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

function Header({ children, align = 'left' }) {
  return (
    <th
      className={`px-4 py-3 ${
        align === 'right' ? 'text-right' : 'text-left'
      } text-xs font-semibold uppercase tracking-wide text-slate-500`}
    >
      {children}
    </th>
  );
}

function CheckoutButton({ tenant, onCheckout, checkoutId }) {
  const isPending = checkoutId === tenant.id;
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => onCheckout?.(tenant)}
      className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <LogOut className="h-3.5 w-3.5" />
      {isPending ? 'Checking out...' : 'Checkout'}
    </button>
  );
}
