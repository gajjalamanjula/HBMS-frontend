import { AlertTriangle, Send } from 'lucide-react';
import { useState } from 'react';

import { ManagerEmptyState } from './ManagerPhase5States';

export default function ManagerComplaintList({
  complaints,
  staff,
  onAssign,
  assigningId = '',
  compact = false,
}) {
  const [selectedStaff, setSelectedStaff] = useState({});

  if (!complaints.length) {
    return (
      <ManagerEmptyState
        title="No complaints found"
        message="No complaints found for this branch."
      />
    );
  }

  const handleAssign = (complaint) => {
    const staffId = selectedStaff[complaint.id] || '';
    onAssign?.(complaint, staffId);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <Header>Description</Header>
              <Header>Status</Header>
              {!compact ? <Header>Assigned To</Header> : null}
              {onAssign ? <Header align="right">Assign</Header> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {complaints.map((complaint) => (
              <tr key={complaint.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-700">
                  <span className="line-clamp-2">{complaint.description}</span>
                </td>
                <td className="px-4 py-3">
                  <ComplaintBadge status={complaint.status} />
                </td>
                {!compact ? (
                  <td className="px-4 py-3 text-slate-600">
                    {complaint.assignedTo || 'Not assigned'}
                  </td>
                ) : null}
                {onAssign ? (
                  <td className="px-4 py-3">
                    <AssignControls
                      complaint={complaint}
                      staff={staff}
                      value={selectedStaff[complaint.id] || ''}
                      onChange={(value) =>
                        setSelectedStaff((current) => ({
                          ...current,
                          [complaint.id]: value,
                        }))
                      }
                      onAssign={handleAssign}
                      isPending={assigningId === complaint.id}
                    />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 lg:hidden">
        {complaints.map((complaint) => (
          <article key={complaint.id} className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <ComplaintBadge status={complaint.status} />
              {!compact ? (
                <p className="break-all text-xs text-slate-500">
                  Staff: {complaint.assignedTo || 'Not assigned'}
                </p>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {complaint.description}
            </p>
            {onAssign ? (
              <div className="mt-4">
                <AssignControls
                  complaint={complaint}
                  staff={staff}
                  value={selectedStaff[complaint.id] || ''}
                  onChange={(value) =>
                    setSelectedStaff((current) => ({
                      ...current,
                      [complaint.id]: value,
                    }))
                  }
                  onAssign={handleAssign}
                  isPending={assigningId === complaint.id}
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

function ComplaintBadge({ status }) {
  const normalized = String(status || '').toUpperCase();
  const tone =
    normalized === 'IN_PROGRESS'
      ? 'border-blue-200 bg-blue-50 text-blue-700'
      : normalized === 'RESOLVED' || normalized === 'CLOSED'
        ? 'border-green-200 bg-green-50 text-green-700'
        : normalized === 'ESCALATED'
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-amber-200 bg-amber-50 text-amber-700';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>
      <AlertTriangle className="h-3.5 w-3.5" />
      {normalized || 'NOT AVAILABLE'}
    </span>
  );
}

function AssignControls({ complaint, staff, value, onChange, onAssign, isPending }) {
  return (
    <div className="flex flex-col justify-end gap-2 sm:flex-row">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={!staff.length || isPending}
        className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="">Select staff</option>
        {staff.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={!value || isPending}
        onClick={() => onAssign(complaint)}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send className="h-3.5 w-3.5" />
        {isPending ? 'Assigning...' : 'Assign'}
      </button>
    </div>
  );
}
