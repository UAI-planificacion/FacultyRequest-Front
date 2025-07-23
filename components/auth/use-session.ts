'use client'

import { useEffect, useState } from "react";

import { getSession } from "@/config/better-auth/auth-client";


interface UseSessionReturn {
	session		: any | null;
	isLoading	: boolean;
	error		: string | null;
}

/**
 * Custom hook to manage user session state
 * @returns Object containing session data, loading state, and error state
 */
export function useSession(): UseSessionReturn {
	const [session, setSession]		= useState<any>( null );
	const [isLoading, setIsLoading]	= useState( true );
	const [error, setError]			= useState<string | null>( null );

	useEffect(() => {
		( async () => {
			try {
				setIsLoading( true );
				setError( null );
				const sessionData = await getSession();
				setSession( sessionData?.data || null );
			} catch ( err ) {
				console.error( 'Error al cargar sesión:', err );
				setError( err instanceof Error ? err.message : 'Error desconocido' );
				setSession( null );
			} finally {
				setIsLoading( false );
			}
		})();
	}, []);

	return {
		session,
		isLoading,
		error
	};
}
