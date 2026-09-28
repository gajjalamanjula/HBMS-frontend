import { Pencil, UserX } from 'lucide-react';

import { ManagerEmptyState } from './ManagerPhase5States';

export default function ManagerStaffList({
  staff,
  onEdit,
  onDelete,
  deletingId = '',
  compact = false,
}) {
  if (!staff.length) {
    return (
      <ManagerEmptyState
        title="No staff found"
        message="No staff found for this branch."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <Header>Staff</Header>
              <Header>Phone</Header>
              {!compact ? <Header>Status</Header> : null}
              {onEdit || onDelete ? <Header align="right">Actions</Header> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-950">{member.name}</p>
                  <p className="break-all text-xs text-slate-500">{member.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-700">{member.phone}</td>
                {!compact ? (
                  <td className="px-4 py-3">
                    <StatusBadge active={member.active} />
                  </td>
                ) : null}
                {onEdit || onDelete ? (
                  <td className="px-4 py-3">
                    <StaffActions
                      member={member}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      deletingId={deletingId}
                    />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 md:hidden">
        {staff.map((member) => (
          <article key={member.id} className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-slate-950">{member.name}</p>
                <p className="mt-1 break-all text-xs text-slate-500">{member.email}</p>
              </div>
              {!compact ? <StatusBadge active={member.active} /> : null}
            </div>
            <p className="mt-3 text-sm text-slate-700">Phone: {member.phone}</p>
            {onEdit || onDelete ? (
              <div className="mt-4">
                <StaffActions
                  member={member}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  deletingId={deletingId}
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

function StatusBadge({ active }) {
  const label = active === null ? 'Not available' : active ? 'Active' : 'Inactive';
  const tone =
    active === null
      ? 'border-slate-200 bg-slate-50 text-slate-600'
      : active
        ? 'border-green-200 bg-green-50 text-green-700'
        : 'border-red-200 bg-red-50 text-red-700';

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {label}
    </span>
  );
}

function StaffActions({ member, onEdit, onDelete, deletingId }) {
  const isDeleting = deletingId === member.id;

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {onEdit ? (
        <button
          type="button"
          onClick={() => onEdit(member)}
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      ) : null}
      {onDelete ? (
        <button
          type="button"
          disabled={isDeleting}
          onClick={() => onDelete(member)}
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserX className="h-3.5 w-3.5" />
          {isDeleting ? 'Deactivating...' : 'Deactivate'}
        </button>
      ) : null}
    </div>
  );
}
