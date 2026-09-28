export function mapComplaint(raw = {}) {
  return {
    id: raw.id ?? raw.complaintId ?? '',
    complaintCode: raw.complaintCode ?? raw.complaint_code ?? '-',
    tenantName: raw.tenantName ?? raw.name ?? '-',
    tenantId: raw.tenantId ?? raw.tenant_id ?? '',
    branchId: raw.branchId ?? raw.branch_id ?? '',
    branchName: raw.branchName ?? raw.branch_name ?? '-',
    roomNumber: raw.roomNumber ?? raw.room_number ?? '-',
    category: raw.category ?? '-',
    title: raw.title ?? '-',
    description: raw.description ?? '',
    status: String(raw.status ?? 'UNKNOWN').toUpperCase(),
    priority: String(raw.priority ?? '-').toUpperCase(),
    createdAt: raw.createdAt ?? raw.created_at ?? '',
    updatedAt: raw.updatedAt ?? raw.updated_at ?? '',
    assignedTo: raw.assignedTo ?? raw.assigned_to ?? '-',
    resolutionNote: raw.resolutionNote ?? raw.resolution_note ?? '',
  };
}

export function mapComplaintList(rows = []) {
  return Array.isArray(rows) ? rows.map(mapComplaint) : [];
}
