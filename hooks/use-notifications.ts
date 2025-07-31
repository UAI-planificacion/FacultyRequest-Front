import { useQueryClient, useQuery } from '@tanstack/react-query';

import { NotificationState } from '@/types/notification';
import { KEY_QUERYS } from '@/consts/key-queries';


/**
 * Hook for managing notifications state
 */
export function useNotifications() {
	const queryClient = useQueryClient();

	// Get notifications from TanStack Query cache
	const { data: notificationState } = useQuery<NotificationState>({
		queryKey        : [KEY_QUERYS.NOTIFICATIONS],
		queryFn         : () => {
			// Return default state if no data exists
			return {
				notifications   : [],
				unreadCount     : 0,
			};
		},
		initialData     : {
			notifications   : [],
			unreadCount     : 0,
		},
	});

	const markAsRead = ( notificationId: string ): void => {
		queryClient.setQueryData(
			[KEY_QUERYS.NOTIFICATIONS],
			( oldState: NotificationState | undefined ) => {
				if ( !oldState ) return oldState;

				const updatedNotifications = oldState.notifications.map( notification =>
					notification.id === notificationId
						? { ...notification, read: true }
						: notification
				);

				const unreadCount = updatedNotifications.filter( n => !n.read ).length;

				return {
					notifications   : updatedNotifications,
					unreadCount,
				};
			}
		);
	};

	const markAllAsRead = (): void => {
		queryClient.setQueryData(
			[KEY_QUERYS.NOTIFICATIONS],
			( oldState: NotificationState | undefined ) => {
				if ( !oldState ) return oldState;

				const updatedNotifications = oldState.notifications.map( notification => ({
					...notification,
					read: true,
				}));

				return {
					notifications   : updatedNotifications,
					unreadCount     : 0,
				};
			}
		);
	};

	const clearAll = (): void => {
		queryClient.setQueryData(
			[KEY_QUERYS.NOTIFICATIONS],
			(): NotificationState => ({
				notifications   : [],
				unreadCount     : 0,
			})
		);
	};

	return {
		notificationState,
		markAsRead,
		markAllAsRead,
		clearAll,
	};
}