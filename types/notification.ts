import { EnumAction, Type } from './emit-event';

export interface Notification {
	id          : string;
	title       : string;
	message     : string;
	action      : EnumAction;
	type        : Type;
	entityId    : string;
	requestId?  : string;
	timestamp   : Date;
	read        : boolean;
}

export interface NotificationState {
	notifications   : Notification[];
	unreadCount     : number;
}