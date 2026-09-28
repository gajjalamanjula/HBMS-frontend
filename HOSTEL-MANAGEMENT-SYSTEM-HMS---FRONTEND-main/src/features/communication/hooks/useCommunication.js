import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { communicationKeys } from '../../../lib/query/queryKeys';
import communicationApi from '../api/communication.api';

export function useAnnouncements(params = {}, options = {}) {
  return useQuery({
    queryKey: communicationKeys.announcements(params),
    queryFn: () => communicationApi.getAnnouncements(params),
    staleTime: 1000 * 45,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: communicationApi.createAnnouncement,
    onSuccess: (result) => {
      toast.success(result?.message || 'Announcement created successfully');
      const branchId = result?.announcement?.branchId;
      queryClient.invalidateQueries({
        queryKey: branchId ? communicationKeys.announcements({ branchId }) : ['communication', 'announcements'],
      });
    },
    onError: (error) => toast.error(error?.message || 'Failed to create announcement'),
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: communicationApi.deleteAnnouncement,
    onSuccess: (result) => {
      toast.success(result?.message || 'Announcement deleted successfully');
      const branchId = result?.branchId;
      queryClient.invalidateQueries({
        queryKey: branchId ? communicationKeys.announcements({ branchId }) : ['communication', 'announcements'],
      });
    },
    onError: (error) => toast.error(error?.message || 'Failed to delete announcement'),
  });
}

export function useNotifications(userId, options = {}) {
  const { enabled = true, ...queryOptions } = options;

  return useQuery({
    queryKey: communicationKeys.notifications(userId),
    queryFn: () => communicationApi.getNotifications(userId),
    enabled: Boolean(userId) && enabled,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });
}

export function useUnreadNotificationCount(userId, options = {}) {
  const { enabled = true, ...queryOptions } = options;

  return useQuery({
    queryKey: communicationKeys.unreadCount(userId),
    queryFn: () => communicationApi.getUnreadCount(userId),
    enabled: Boolean(userId) && enabled,
    staleTime: 1000 * 10,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });
}

export function useMarkNotificationRead(userId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: communicationApi.markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.notifications(userId) });
      queryClient.invalidateQueries({ queryKey: communicationKeys.unreadCount(userId) });
    },
    onError: (error) => toast.error(error?.message || 'Failed to update notification'),
  });
}

export function useMarkAllNotificationsRead(userId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => communicationApi.markAllNotificationsRead(userId),
    onSuccess: (result) => {
      toast.success(result?.message || 'All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: communicationKeys.notifications(userId) });
      queryClient.invalidateQueries({ queryKey: communicationKeys.unreadCount(userId) });
    },
    onError: (error) => toast.error(error?.message || 'Failed to update notifications'),
  });
}

export function useDeleteNotification(userId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: communicationApi.deleteNotification,
    onSuccess: (result) => {
      toast.success(result?.message || 'Notification deleted');
      queryClient.invalidateQueries({ queryKey: communicationKeys.notifications(userId) });
      queryClient.invalidateQueries({ queryKey: communicationKeys.unreadCount(userId) });
    },
    onError: (error) => toast.error(error?.message || 'Failed to delete notification'),
  });
}

export function useClearNotifications(userId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => communicationApi.clearNotifications(userId),
    onSuccess: (result) => {
      toast.success(result?.message || 'Notifications cleared');
      queryClient.invalidateQueries({ queryKey: communicationKeys.notifications(userId) });
      queryClient.invalidateQueries({ queryKey: communicationKeys.unreadCount(userId) });
    },
    onError: (error) => toast.error(error?.message || 'Failed to clear notifications'),
  });
}
