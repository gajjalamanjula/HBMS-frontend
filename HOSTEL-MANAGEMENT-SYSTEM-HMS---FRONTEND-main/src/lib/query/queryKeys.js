import { stableParams } from './queryOptions';

export const authKeys = {
  all: ['auth'],
  currentUser: () => ['auth', 'current-user'],
  session: () => ['auth', 'session'],
};

export const superAdminKeys = {
  all: ['super-admin'],
  dashboard: () => ['super-admin', 'dashboard'],
  owners: () => ['super-admin', 'owners'],
  users: (filters = {}) => ['super-admin', 'users', stableParams(filters)],
  branches: () => ['super-admin', 'branches'],
  health: () => ['super-admin', 'health'],
  auditLogs: (filters = {}) => ['super-admin', 'audit-logs', stableParams(filters)],
};

export const publicKeys = {
  all: ['public'],
  branches: () => ['public', 'branches'],
  branchRooms: (branchId) => ['public', 'branches', String(branchId || ''), 'rooms'],
  branchBeds: (branchId) => ['public', 'branches', String(branchId || ''), 'beds'],
  roomBeds: (roomId) => ['public', 'rooms', String(roomId || ''), 'beds'],
  booking: () => ['public', 'booking'],
  register: () => ['public', 'register'],
  fullPayment: (bookingId) => ['public', 'pay-full', String(bookingId || '')],
};

export const ownerKeys = {
  all: ['owner'],
  dashboard: () => ['owner', 'dashboard'],
  branches: () => ['owner', 'branches'],
  branchStats: (branchId) => ['owner', 'branches', String(branchId || ''), 'stats'],
  revenue: () => ['owner', 'revenue'],
  bedSummary: () => ['owner', 'beds', 'summary'],
  complaints: () => ['owner', 'complaints'],
  managers: () => ['owner', 'managers'],
  staffCount: () => ['owner', 'staff-count'],
  tenantsCount: () => ['owner', 'tenants-count'],
  currentFoodMenu: (branchId) => ['owner', 'food-menu', String(branchId || ''), 'current'],
  foodMenuHistory: (branchId) => ['owner', 'food-menu', String(branchId || ''), 'history'],
};

export const managerKeys = {
  all: ['manager'],
  dashboard: () => ['manager', 'dashboard'],
  counts: () => ['manager', 'counts'],
  staff: () => ['manager', 'staff'],
  tenants: () => ['manager', 'tenants'],
  rooms: () => ['manager', 'rooms'],
  complaints: () => ['manager', 'complaints'],
  beds: () => ['manager', 'beds'],
  availableBeds: () => ['manager', 'beds', 'available'],
  bedStats: () => ['manager', 'beds', 'stats'],
  genericRooms: () => ['manager', 'rooms', 'generic'],
  foodMenuCurrent: () => ['manager', 'food-menu', 'current'],
  foodMenuHistory: () => ['manager', 'food-menu', 'history'],
  paymentsDue: (branchId) => ['manager', 'payments', 'due', String(branchId || '')],
  paymentsSummary: (branchId) => ['manager', 'payments', 'summary', String(branchId || '')],
};


export const communicationKeys = {
  all: ['communication'],
  announcements: (params = {}) => ['communication', 'announcements', stableParams(params)],
  notifications: (userId) => ['communication', 'notifications', String(userId || '')],
  unreadCount: (userId) => ['communication', 'notifications', String(userId || ''), 'unread-count'],
};

export const bookingKeys = {
  all: ['bookings'],
  managerBookings: () => ['bookings', 'manager'],
};

export const queryKeys = {
  auth: {
    root: authKeys.all,
    me: authKeys.currentUser(),
    currentUser: authKeys.currentUser,
    session: authKeys.session,
  },

  communication: {
    root: communicationKeys.all,
    announcements: communicationKeys.announcements(),
    notifications: communicationKeys.notifications,
    unreadCount: communicationKeys.unreadCount,
  },

  public: {
    root: publicKeys.all,
    branches: publicKeys.branches(),
    branchRooms: publicKeys.branchRooms,
    branchBeds: publicKeys.branchBeds,
    roomBeds: publicKeys.roomBeds,
    booking: publicKeys.booking(),
    register: publicKeys.register(),
    fullPayment: publicKeys.fullPayment,
  },

  superadmin: {
    root: superAdminKeys.all,
    me: ['super-admin', 'me'],
    dashboard: superAdminKeys.dashboard(),
    owners: superAdminKeys.owners(),
    users: superAdminKeys.users,
    branches: superAdminKeys.branches(),
    health: superAdminKeys.health(),
    auditLogs: superAdminKeys.auditLogs,
  },

  owner: {
    root: ownerKeys.all,
    dashboard: ownerKeys.dashboard(),
    branches: ownerKeys.branches(),
    branchStats: ownerKeys.branchStats,
    revenue: ownerKeys.revenue(),
    bedSummary: ownerKeys.bedSummary(),
    complaints: ownerKeys.complaints(),
    managers: ownerKeys.managers(),
    staffCount: ownerKeys.staffCount(),
    tenantsCount: ownerKeys.tenantsCount(),
    currentFoodMenu: ownerKeys.currentFoodMenu,
    foodMenuHistory: ownerKeys.foodMenuHistory,
  },

  manager: {
    root: managerKeys.all,
    me: ['manager', 'me'],
    dashboard: managerKeys.dashboard(),
    counts: managerKeys.counts(),
    tenants: managerKeys.tenants(),
    tenant: (tenantId) => ['manager', 'tenants', String(tenantId || '')],
    staff: managerKeys.staff(),
    rooms: managerKeys.rooms(),
    complaints: managerKeys.complaints(),
    complaint: (complaintId) => ['manager', 'complaints', String(complaintId || '')],
    beds: managerKeys.beds(),
    availableBeds: managerKeys.availableBeds(),
    bedStats: managerKeys.bedStats(),
    genericRooms: managerKeys.genericRooms(),
    foodMenuCurrent: managerKeys.foodMenuCurrent(),
    foodMenuHistory: managerKeys.foodMenuHistory(),
    paymentsDue: managerKeys.paymentsDue,
    paymentsSummary: managerKeys.paymentsSummary,
  },

  tenant: {
    root: ['tenant'],
    me: ['tenant', 'me'],
    dashboard: ['tenant', 'dashboard'],
    profile: ['tenant', 'profile'],
    payments: (tenantId) => ['tenant', 'payments', String(tenantId || '')],
    complaints: ['tenant', 'complaints'],
    complaint: (complaintId) => ['tenant', 'complaints', String(complaintId || '')],
    kyc: (userId) => ['tenant', 'kyc', String(userId || '')],
    currentFoodMenu: () => ['tenant', 'food-menu', 'current'],
    foodMenuHistory: () => ['tenant', 'food-menu', 'history'],
  },

  branches: {
    root: ['branches'],
    list: (params = {}) => ['branches', 'list', stableParams(params)],
    detail: (branchId) => ['branches', 'detail', String(branchId || '')],
  },

  rooms: {
    root: ['rooms'],
    byBranch: (branchId) => ['rooms', 'branch', String(branchId || '')],
    detail: (roomId) => ['rooms', 'detail', String(roomId || '')],
  },

  beds: {
    root: ['beds'],
    all: (scope = 'current-user') => ['beds', 'all', String(scope || '')],
    available: (branchId) => ['beds', 'available', String(branchId || '')],
    stats: (branchId) => ['beds', 'stats', String(branchId || '')],
  },

  bookings: {
    root: bookingKeys.all,
    managerBookings: bookingKeys.managerBookings(),
    list: (params = {}) => ['bookings', 'list', stableParams(params)],
    detail: (bookingId) => ['bookings', 'detail', String(bookingId || '')],
  },

  complaints: {
    root: ['complaints'],
    list: (params = {}) => ['complaints', 'list', stableParams(params)],
    detail: (complaintId) => ['complaints', 'detail', String(complaintId || '')],
  },

  payments: {
    root: ['payments'],
    list: (params = {}) => ['payments', 'list', stableParams(params)],
    detail: (paymentId) => ['payments', 'detail', String(paymentId || '')],
  },

  reviews: {
    root: ['reviews'],
    byBranch: (branchId) => ['reviews', 'branch', String(branchId || '')],
    detail: (reviewId) => ['reviews', 'detail', String(reviewId || '')],
  },

  kyc: {
    root: ['kyc'],
    byUser: (userId) => ['kyc', String(userId || '')],
    aadhaar: (userId) => ['kyc', String(userId || ''), 'aadhaar'],
    photo: (userId) => ['kyc', String(userId || ''), 'photo'],
  },

};

export default queryKeys;
