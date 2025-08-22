"use client"

import { JSX, useState } from "react";

import {
    MessageCircle,
    Send,
    User,
    Edit2,
    Trash2,
    X
} from "lucide-react";

import { Button }               from "@/components/ui/button";
import { Textarea }             from "@/components/ui/textarea";
import { Card }                 from "@/components/ui/card";
import { ScrollArea }           from "@/components/ui/scroll-area";
import { CommentsSkeleton }     from "@/components/comment/comment-card-skeleton";
import { CommentErrorCard }     from "@/components/comment/comment-error-card";
import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog";
import { ShowDate }             from "@/components/shared/date";

import { Comment }          from "@/types/comment.model";
import { useComments }      from "@/hooks/use-comments";
import { KEY_QUERYS }       from "@/consts/key-queries";
import { Role, Staff }      from "@/types/staff.model";
import { useQueryClient }   from "@tanstack/react-query";


interface CommentSectionProps {
	requestId?          : string;
	requestDetailId?    : string;
    enabled             : boolean;
    size?               : string;
}

/**
 * Component for displaying and managing comments in a request
 */
export function CommentSection( { 
	requestId,
	requestDetailId,
    enabled,
    size = 'h-[450px]'
}: CommentSectionProps ): JSX.Element {
	const [newComment, setNewComment]                           = useState( '' );
	const [isDeleteDialogOpen, setIsDeleteDialogOpen]           = useState( false );
	const [deletingCommentId, setDeletingCommentId]             = useState<string | undefined>( undefined );
	const [deletingCommentContent, setDeletingCommentContent]   = useState<string>( '' );
    const queryClient                                           = useQueryClient();
    const staff                                                 = queryClient.getQueryData<Staff>([ KEY_QUERYS.STAFF ]);
    const isAdmin                                               = staff?.role === Role.ADMIN || staff?.role === Role.ADMIN_FACULTY;


	const {
		comments,
		isLoading,
		isError,
		retryLoadComments,
        createComment,
        updateComment,
        deleteComment,
        isCreating
	} = useComments({ requestId, requestDetailId, enabled });


	/**
	 * Handle submitting a new comment
	 */
	const handleSubmitComment = () => {
        const content = newComment.trim();

        if ( !content ) return;

        createComment.mutate({
            content,
            staffId : staff?.id!,
            ...(requestId && { requestId }),
            ...(requestDetailId && { requestDetailId }),
        });

        setNewComment( '' );
	};

    function handleEditComment( id: string, content: string ) {
        updateComment.mutate({
            id,
            content
        })
    }


	/**
	 * Handle opening delete confirmation dialog
	 */
	const onOpenDeleteComment = ( commentId: string, commentContent: string ) => {
		setDeletingCommentId( commentId );
		setDeletingCommentContent( commentContent );
		setIsDeleteDialogOpen( true );
	};


	/**
	 * Handle confirming comment deletion
	 */
	const onConfirmDeleteComment = () => {
		if ( deletingCommentId ) {
			deleteComment.mutate( deletingCommentId );
			setIsDeleteDialogOpen( false );
			setDeletingCommentId( undefined );
			setDeletingCommentContent( "" );
		}
	};


	/**
	 * Handle key press in textarea (Ctrl+Enter to submit)
	 */
	const handleKeyPress = ( e: React.KeyboardEvent ) => {
		if ( e.key === "Enter" && e.ctrlKey ) {
			e.preventDefault();
			handleSubmitComment();
		}
	};


	return (
		<div className="space-y-4">
			{/* Comments List */}
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<MessageCircle className="h-4 w-4" />

					<h3 className="text-sm font-medium">
						Comentarios ({isLoading ? "..." : comments.length})
					</h3>
				</div>

				{/* Error State */}
				{isError && (
					<CommentErrorCard 
						onRetry={retryLoadComments}
					/>
				)}

				{/* Loading State */}
				{ isLoading && !isError && (
					<CommentsSkeleton count={3} />
				)}

				{/* Empty State */}
				{ !isLoading && !isError && comments.length === 0 && (
					<Card className="p-4">
						<p className="text-sm text-muted-foreground text-center">
							No hay comentarios aún. ¡Sé el primero en comentar!
						</p>
					</Card>
				)}

				{/* Comments List */}
				{ !isLoading && !isError && comments.length > 0 && (
					<ScrollArea className={`${size} w-full`}>
						<div className="space-y-3 pr-4">
							{comments.map( comment => (
								<CommentItem
									key                 = { comment.id }
									comment             = { comment }
									currentUserEmail    = { staff?.email || "" }
									onEdit              = { handleEditComment }
									onDelete            = { onOpenDeleteComment }
									isLoading           = { isLoading }
                                    isAdmin             = { isAdmin }
								/>
							))}
						</div>
					</ScrollArea>
				)}
			</div>

			{/* Add New Comment */}
            { isAdmin &&
                <Card className="p-4">
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium">Agregar comentario</h4>

                        <Textarea
                            placeholder     = "Escribe tu comentario aquí... (Ctrl+Enter para enviar)"
                            value           = { newComment }
                            onChange        = { ( e ) => setNewComment( e.target.value ) }
                            onKeyDown       = { handleKeyPress }
                            className       = "min-h-[100px] max-h-[200px]"
                            maxLength       = { 500 }
                            disabled        = { isError }
                        />

                        <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                                {newComment.length} / 500
                            </span>

                            <Button
                                onClick     = { handleSubmitComment }
                                disabled    = { !newComment.trim() || isCreating || isError }
                                size        = "sm"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                {isCreating ? "Enviando..." : "Enviar"}
                            </Button>
                        </div>

                        {/* Error message for commenting */}
                        {isError && (
                            <p className="text-xs text-destructive">
                                Los comentarios están deshabilitados debido a un error al cargar.
                            </p>
                        )}
                    </div>
                </Card>
            }

			{/* Delete Confirmation Dialog */}
			<DeleteConfirmDialog
				isOpen      = { isDeleteDialogOpen }
				onClose     = { () => setIsDeleteDialogOpen( false ) }
				onConfirm   = { onConfirmDeleteComment }
				name        = { deletingCommentContent.length > 50 
					? `${deletingCommentContent.substring(0, 50)}...` 
					: deletingCommentContent 
				}
				type        = "el comentario"
			/>
		</div>
	);
}


interface CommentItemProps {
	comment             : Comment;
	currentUserEmail    : string;
	onEdit              : ( commentId: string, content: string ) => void;
	onDelete            : ( commentId: string, commentContent: string ) => void;
	isLoading           : boolean;
    isAdmin             : boolean;
}


/**
 * Individual comment item component
 */
function CommentItem( { 
	comment, 
	currentUserEmail, 
	onEdit, 
	onDelete, 
	isLoading,
    isAdmin
}: CommentItemProps ): JSX.Element {
	const [isEditing, setIsEditing]     = useState( false );
	const [editContent, setEditContent] = useState( comment.content );


	/**
	 * Check if current user can edit/delete this comment
	 */
	const canEditComment = () => {
		if ( !currentUserEmail ) return false;
        if ( !isAdmin ) return false;

		if ( comment.staff?.email === currentUserEmail ) return true;
		if ( comment.adminEmail === currentUserEmail ) return true;

		return false;
	};


	/**
	 * Handle saving edited comment
	 */
	const handleSaveEdit = () => {
		if ( editContent.trim() && editContent !== comment.content ) {
			onEdit( comment.id, editContent.trim() );
		}
		setIsEditing( false );
	};


    const handleKeyPress = ( e: React.KeyboardEvent ) => {
		if ( e.key === "Enter" && e.ctrlKey ) {
			e.preventDefault();
			handleSaveEdit();
		}
	};


	/**
	 * Handle canceling edit
	 */
	const handleCancelEdit = () => {
		setEditContent( comment.content );
		setIsEditing( false );
	};


	/**
	 * Handle deleting comment
	 */
	const handleDelete = () => {
		onDelete( comment.id, comment.content );
	};


    /**
	 * Get the author information from comment
	 */
	const getAuthorInfo = () => {
		if ( comment.staff ) {
			return {
				name    : comment.staff.name,
				email   : comment.staff.email,
				type    : "staff" as const
			};
		}

		if ( comment.adminName && comment.adminEmail ) {
			return {
				name    : comment.adminName,
				email   : comment.adminEmail,
				type    : "admin" as const
			};
		}

		return {
			name    : "Usuario desconocido",
			email   : "",
			type    : "unknown" as const
		};
	};


	const author = getAuthorInfo();


	return (
		<Card className="p-4">
			<div className="space-y-3">
				{/* Author Info */}
				<div className="flex items-start gap-3">
					<div className="flex-shrink-0">
						<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
							<User className="h-4 w-4 text-primary" />
						</div>
					</div>

					<div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <div className="grid space-y-1">
                                <div className="flex items-center gap-2">
                                    <h5 className="text-sm font-medium truncate">
                                        { author.name }
                                    </h5>

                                    {author.type === "admin" && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                            Admin
                                        </span>
                                    )}
                                </div>

                                {author.email && (
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-muted-foreground truncate">
                                            { author.email }
                                        </p>

                                        <ShowDate
                                            date        = { comment.createdAt }
                                            className   = "text-xs text-muted-foreground"
                                            size        = "h-3 w-3"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
								{/* Edit/Delete buttons for comment owner */}
								{canEditComment() && !isEditing && (
									<div className="flex gap-1">
										<Button
											variant     = "ghost"
											size        = "icon"
											onClick     = { () => setIsEditing( true )}
											disabled    = { isLoading }
										>
											<Edit2 className="h-4 w-4" />
										</Button>

										<Button
											variant     = "ghost"
											size        = "icon"
											onClick     = { handleDelete }
											disabled    = { isLoading }
											className   = "text-destructive hover:text-destructive"
										>
											<Trash2 className="h-5 w-5" />
										</Button>
									</div>
								)}

								{/* Save/Cancel buttons when editing */}
								{isEditing && (
                                    <Button
											variant     = "ghost"
											size        = "icon"
											onClick     = { handleCancelEdit }
											disabled    = { isLoading }
										>
											<X className="h-5 w-5" />
										</Button>
								)}
							</div>
                        </div>
					</div>
				</div>

				{/* Comment Content */}
				<div className="pl-11">
					{isEditing ? (
                        <div className="grid space-y-4">
                            <Textarea
                                value       = { editContent }
                                onChange    = { ( e ) => setEditContent( e.target.value ) }
                                className   = "min-h-[100px] max-h-[200px]"
                                maxLength   = { 500 }
                                onKeyDown   = { handleKeyPress }
                                placeholder = "Edita tu comentario..."
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant     = "outline"
                                    onClick     = { handleCancelEdit }
                                    disabled    = { isLoading }
                                    className   = "gap-2"
                                >
                                    <X className="h-5 w-5" />
                                    Cancelar
                                </Button>

                                <Button
                                    onClick     = { handleSaveEdit }
                                    disabled    = { isLoading || !editContent.trim() }
                                    className   = "gap-2"
                                >
                                    <Send className="h-4 w-4" />
                                    Enviar
                                </Button>
                            </div>
                        </div>
					) : (
                        <>
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                                { comment.content }
                            </p>

                            { comment.createdAt !== comment.updatedAt && (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-muted-foreground">Actualizado: </span>

                                    <ShowDate
                                        date        = { comment.updatedAt }
                                        className   = "text-xs text-muted-foreground"
                                        size        = "h-3 w-3"
                                    />
                                </div>
                            )}
                        </>
					)}
				</div>
			</div>
		</Card>
	);
}