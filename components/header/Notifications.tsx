'use client'

import { JSX, useState } from 'react';

import { Bell } from 'lucide-react';

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
}                       from '@/components/ui/popover';
import { Button }       from '@/components/ui/button';
import { Badge }        from '@/components/ui/badge';
import { ScrollArea }   from '@/components/ui/scroll-area';

import { Notification }     from '@/types/notification';
import { EnumAction, Type } from '@/types/emit-event';
import { useNotifications } from '@/hooks/use-notifications';
import { Comment }          from '@/types/comment.model';


interface NotificationItemProps {
	notification        : Notification;
	onNotificationClick : ( notification: Notification ) => void;
	onMarkAsRead        : ( notificationId: string ) => void;
}

/**
 * Component for individual notification item
 */
function NotificationItem({ 
	notification, 
	onNotificationClick, 
	onMarkAsRead 
}: NotificationItemProps ): JSX.Element {
	const getActionText = ( action: EnumAction ): string => {
		switch ( action ) {
			case EnumAction.CREATE:
				return 'creado';
			case EnumAction.UPDATE:
				return 'actualizado';
			case EnumAction.DELETE:
				return 'eliminado';
			default:
				return 'modificado';
		}
	};

	const getTypeText = ( type: Type ): string => {
		switch ( type ) {
			case Type.REQUEST:
				return 'Solicitud';
			case Type.REQUEST_SESSION:
				return 'Detalle de Solicitud';
			case Type.PLANNING_CHANGE:
				return 'Cambio de Planificación';
			case Type.COMMENT:
				return 'Comentario';
			default:
				return 'Elemento';
		}
	};

	const handleClick = (): void => {
		if ( !notification.read ) {
			onMarkAsRead( notification.id );
		}

		if ( notification.action !== EnumAction.DELETE ) {
			onNotificationClick( notification );
		}
	};

	return (
		<div
			className={`p-3 border-b cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${
				!notification.read ? 'bg-blue-50 dark:bg-blue-950' : ''
			}`}
			onClick={handleClick}
		>
			<div className="flex justify-between items-start">
				<div className="flex-1">
					<p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
						{ getTypeText( notification.type )} { getActionText( notification.action )}
					</p>

					<p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
						{ notification.message }
					</p>

					<p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
						{ new Date( notification.timestamp ).toLocaleString() }
					</p>
				</div>

				{ !notification.read && (
					<div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
				)}
			</div>
		</div>
	);
}


interface NotificationsProps {
	onRequestClick          : ( requestId: string ) => void;
	onRequestSessionClick   : ( requestId: string, sessionId: string ) => void;
	onPlanningChangeClick   : ( planningChangeId: string ) => void;
	onCommentClick          : ( comment: Comment ) => void;
}


/**
 * Notifications component with bell icon and popover
 */
export function Notifications({ 
	onRequestClick, 
	onRequestSessionClick,
	onPlanningChangeClick,
	onCommentClick
}: NotificationsProps ): JSX.Element {
	const [isOpen, setIsOpen] = useState( false );
	const { 
		notificationState, 
		markAsRead, 
		markAllAsRead, 
		clearAll 
	} = useNotifications();

	const handleNotificationClick = ( notification: Notification ): void => {
		console.log( 'Notification clicked:', notification );
		setIsOpen( false );

		if ( notification.type === Type.REQUEST ) {
			onRequestClick( notification.entityId );
		} else if ( notification.type === Type.REQUEST_SESSION ) {
			onRequestSessionClick( notification.requestId || '', notification.entityId );
		} else if ( notification.type === Type.PLANNING_CHANGE ) {
			onPlanningChangeClick( notification.entityId );
		} else if ( notification.type === Type.COMMENT && notification.comment ) {
			onCommentClick( notification.comment );
		}
	};

	const handleMarkAsRead = ( notificationId: string ): void => {
		markAsRead( notificationId );
	};

	const handleMarkAllAsRead = (): void => {
		markAllAsRead();
	};

	const handleClearAll = (): void => {
		clearAll();
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant     = "outline"
					size        = "icon"
					className   = "relative bg-black text-white border-zinc-700"
				>
					<Bell className="h-5 w-5" />

					{ notificationState.unreadCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
						>
							{ notificationState.unreadCount > 99 ? '99+' : notificationState.unreadCount }
						</Badge>
					)}
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-80 p-0" align="end">
				<div className="p-4 border-b">
					<div className="flex justify-between items-center">
						<h3 className="font-semibold">Notificaciones</h3>

						{ notificationState.unreadCount > 0 && (
							<Button
								variant     = "ghost"
								size        = "sm"
								onClick     = { handleMarkAllAsRead }
								className   = "text-xs"
							>
								Marcar todas como leídas
							</Button>
						)}
					</div>
				</div>

				<ScrollArea className="h-80">
					{notificationState.notifications.length === 0 ? (
						<div className="p-4 text-center text-zinc-500 dark:text-zinc-400">
							No hay notificaciones
						</div>
					) : (
						notificationState.notifications.map( notification => (
							<NotificationItem
								key                 = { notification.id }
								notification        = { notification }
								onNotificationClick = { handleNotificationClick }
								onMarkAsRead        = { handleMarkAsRead }
							/>
						))
					)}
				</ScrollArea>

				{ notificationState.notifications.length > 0 && (
					<div className="p-2 border-t">
						<Button
							variant     = "ghost"
							size        = "sm"
							onClick     = { handleClearAll }
							className   = "w-full text-xs"
						>
							Limpiar todas
						</Button>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
