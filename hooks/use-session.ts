'use client'

import { useQuery } from "@tanstack/react-query";

import { authClient }   from "@/config/better-auth/auth-client";
import { Staff }        from "@/types/staff.model";
import { KEY_QUERYS }   from "@/consts/key-queries";
import { fetchApi }     from "@/services/fetch";


type StringOff = string | null | undefined;


interface User {
    id              : string;
    name            : string
    emailVerified   : boolean;
    email           : string;
    createdAt       : Date;
    updatedAt       : Date;
    image?          : StringOff;
}


interface Data {
    id          : string;
    token       : string;
    userId      : string;
    userAgent?  : StringOff;
}


interface SessionData {
    user        : User | null;
    data        : Data | null;
}


interface UseSessionReturn {
    data        : SessionData   | null;
    staff       : Staff         | null;
	isLoading	: boolean;
	error		: string        | null;
}

/**
 * Custom hook to manage user session state
 * @returns Object containing session data, loading state, and error state
 */
export function useSession(): UseSessionReturn {
	// Query para obtener la sesión de better-auth
	const {
		data		: betterAuthSession,
		isLoading	: isSessionLoading,
		error		: sessionError
	} = useQuery({
		queryKey	: [ 'better-auth-session' ],
		queryFn		: async () => {
			const session = await authClient.getSession();
			return session;
		},
		staleTime			: Infinity,			// NUNCA considerar stale - usar caché siempre
		gcTime				: 1000 * 60 * 60,	// 1 hora en caché
		retry				: false,			// No reintentar si falla
		refetchOnWindowFocus: false,			// NO refrescar al cambiar de ventana
		refetchOnMount		: false,			// NO refrescar al montar
		refetchOnReconnect	: false,			// NO refrescar al reconectar
	});

	// Construir el objeto de sesión compatible
	const session: SessionData | null = betterAuthSession?.data ? {
		user: betterAuthSession.data.user || null,
		data: betterAuthSession.data.session || null,
	} : null;

	// Query para obtener datos del staff
	const {
		data		: staffData,
		isLoading	: isStaffLoading,
		error		: staffError
	} = useQuery({
		queryKey	: [ KEY_QUERYS.STAFF, session?.user?.email ],
		queryFn		: () => fetchApi<Staff>({ url: `staff/${session?.user?.email}` }),
		enabled		: !!session?.user?.email,
		staleTime	: Infinity,					// NUNCA considerar stale
		gcTime		: 1000 * 60 * 60,			// 1 hora en caché
		retry		: 2,
		retryDelay	: 1000,
		refetchOnWindowFocus: false,			// NO refrescar al cambiar de ventana
		refetchOnMount		: false,			// NO refrescar al montar
		refetchOnReconnect	: false,			// NO refrescar al reconectar
	});

	return {
		data		: session					|| null,
		staff		: staffData					|| null,
		isLoading	: isSessionLoading			|| isStaffLoading,
		error		: sessionError?.message		|| staffError?.message || null,
	};
}
