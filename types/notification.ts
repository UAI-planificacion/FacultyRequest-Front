import { EnumAction, Type } from './emit-event';
import { Comment }          from './comment.model';

export interface Notification {
	id          : string;
	title       : string;
	message     : string;
	action      : EnumAction;
	type        : Type;
	entityId    : string;
	requestId?  : string;
	comment?    : Comment;
	timestamp   : Date;
	read        : boolean;
}

export interface NotificationState {
	notifications   : Notification[];
	unreadCount     : number;
}