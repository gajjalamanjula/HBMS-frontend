import { UserCog } from 'lucide-react';

import { OwnerEmptyState } from './OwnerPhase4States';

export default function OwnerManagerList({ managers, compact = false }) {
  if (!managers.length) {
    return (
      <OwnerEmptyState
        title="No managers found"
        message="No managers are available yet."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-[18px] border border-[#eadfd6] bg-white">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-[#f0e7dc] text-sm">
          <thead className="bg-[#fffaf6]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Manager
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Phone
              </th>
              {!compact ? (
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Branch
                </th>
              ) : null}
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {managers.map((manager) => (
              <tr key={manager.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eaf4e0] text-[#2f7439]">
                      <UserCog className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-950">{manager.name || 'Not available'}</p>
                      <p className="break-all text-xs text-slate-500">{manager.email || 'Not available'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-700">{manager.phone || 'Not available'}</td>
                {!compact ? (
                  <td className="px-4 py-3 text-slate-700">
                    {manager.branchName || manager.branchId || 'Not available'}
                  </td>
                ) : null}
                <td className="px-4 py-3 text-slate-600">{manager.createdAt || 'Not available'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 md:hidden">
        {managers.map((manager) => (
          <article key={manager.id} className="rounded-lg border border-slate-200 p-4">
            <p className="font-semibold text-slate-950">{manager.name || 'Not available'}</p>
            <p className="mt-1 break-all text-xs text-slate-500">{manager.email || 'Not available'}</p>
            <div className="mt-3 grid gap-2 text-sm">
              <p className="text-slate-700">Phone: {manager.phone || 'Not available'}</p>
              {!compact ? (
                <p className="text-slate-700">
                  Branch: {manager.branchName || manager.branchId || 'Not available'}
                </p>
              ) : null}
              <p className="text-slate-700">Created: {manager.createdAt || 'Not available'}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
