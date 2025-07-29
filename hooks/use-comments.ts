'use client'

import {
    useQuery,
    useMutation,
    useQueryClient,
    UseMutationResult
}                   from '@tanstack/react-query';
import { toast }    from "sonner";

import {
    Comment,
    CreateComment,
    UpdateComment
}                                   from "@/types/comment.model";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { fetchApi, Method }         from '@/services/fetch';
import { errorToast, successToast } from '@/config/toast/toast.config';


interface UseCommentsReturn {
	comments            : Comment[];
	isLoading           : boolean;
	isError             : boolean;
	error               : string | null;
	retryLoadComments   : () => void;
    createComment       : UseMutationResult<Comment, Error, CreateComment, unknown>;
    updateComment       : UseMutationResult<Comment, Error, UpdateComment, unknown>;
    deleteComment       : UseMutationResult<Comment, Error, string, unknown>;
    isCreating          : boolean;
	isUpdating          : boolean;
	isDeleting          : boolean;
}


export enum CommentType {
    REQUEST = "request",
    DETAIL = 'request-detail'
}


interface CommentsProps {
    requestId?          : string;
	requestDetailId?    : string;
    enabled             : boolean;
}


/**
 * Custom hook to manage comments for a request or request detail using TanStack Query
 * @param requestId - The ID of the request
 * @param requestDetailId - Optional ID of the request detail
 * @returns Object containing comments data and management functions
 */
export function useComments({
    requestId,
    requestDetailId,
    enabled = true,
}: CommentsProps ): UseCommentsReturn {
	const queryClient   = useQueryClient();
    const id            = requestId || requestDetailId;

    if ( !id ) throw new Error ( 'Id is required' );

    const type      = requestId ? CommentType.REQUEST : CommentType.DETAIL;
    const endpoint  = 'comments';

	const {
		data: comments = [],
		isLoading,
		isError,
		error,
		refetch
	} = useQuery( {
		queryKey: [ KEY_QUERYS.COMMENTS, id, type ],
        queryFn : () => fetchApi<Comment[]>({ url: `comments/${type}/${id}` }),
		enabled,
	} );

    const createCommentApi = async ( newComment: CreateComment ): Promise<Comment>  =>
        fetchApi<Comment>({
            url     : endpoint,
            method  : Method.POST,
            body    : newComment
        });

    const deleteCommentApi = async ( commentId: string ): Promise<Comment> =>
		fetchApi<Comment>({
            url     : `${endpoint}/${commentId}`,
            method  : Method.DELETE
        });


    const updateCommentApi = async ( updateComment: UpdateComment ): Promise<Comment>  =>
        fetchApi<Comment>({
            url     : `comments/${updateComment.id}`,
            method  : Method.PATCH,
            body    : { content: updateComment.content }
        });


	/**
	 * Mutation to create a new comment
	 */
	const createCommentMutation = useMutation({
		mutationFn  : createCommentApi,
		onSuccess   : () => {
            queryClient.invalidateQueries({ queryKey: [ KEY_QUERYS.COMMENTS, id, type ]});
			toast( 'Comentario creado exitosamente', successToast );
		},
		onError     : ( error ) => {
			console.error( 'Error adding comment:', error );
			toast( 'Error al agregar el comentario', errorToast );
		}
	});


	// /**
	//  * Mutation to update an existing comment
	//  */
	const updateCommentMutation = useMutation( {
		mutationFn  : updateCommentApi,
		onSuccess   : () => {
			queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.COMMENTS, id, type] });
			toast( 'Comentario editado exitosamente', successToast );
		},
		onError     : ( error ) => {
			console.error( 'Error editing comment:', error );
			toast( 'Error al editar el comentario', errorToast );
		}
	} );


	// /**
	//  * Mutation to delete a comment
	//  */
	const deleteCommentMutation = useMutation( {
		mutationFn  : deleteCommentApi,
		onSuccess   : ( _, commentId ) => {
			queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.COMMENTS, id, type] });
			toast( 'Comentario eliminado exitosamente', successToast );
		},
		onError     : ( error ) => {
			console.error( 'Error deleting comment:', error );
			toast( 'Error al eliminar el comentario', errorToast );
		}
	} );


	// /**
	//  * Retry loading comments
	//  */
	const retryLoadComments = () => {
		refetch();
	};


	return {
		comments,
		isLoading,
		isError,
		error: error?.message || null,
		retryLoadComments,
        createComment   : createCommentMutation,
        updateComment   : updateCommentMutation,
        deleteComment   : deleteCommentMutation,
        isCreating      : createCommentMutation.isPending,
		isUpdating      : updateCommentMutation.isPending,
		isDeleting      : deleteCommentMutation.isPending,
	};
}
