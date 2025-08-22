'use client'

import { useState, useEffect }          from "react";
import { useSearchParams, useRouter }   from "next/navigation";


export type ViewMode = "cards" | "table";


export interface UseViewModeOptions {
	queryName	: string;
	defaultMode	?: ViewMode;
}


export interface UseViewModeReturn {
	viewMode		: ViewMode;
	setViewMode		: ( mode: ViewMode ) => void;
	onViewChange    : ( mode: ViewMode ) => void;
}


/**
 * Custom hook to manage view mode state with URL synchronization
 * @param queryName - The query parameter name in the URL
 * @param defaultMode - Default view mode (defaults to 'cards')
 * @returns Object with viewMode state and handlers
 */
export function useViewMode({ 
	queryName, 
	defaultMode = 'cards' 
}: UseViewModeOptions ): UseViewModeReturn {
	const searchParams	= useSearchParams();
	const router		= useRouter();

	const [viewMode, setViewMode] = useState<ViewMode>(() => {
		const urlViewMode = searchParams.get( queryName );

		return ( urlViewMode === 'table' || urlViewMode === 'cards' )
			? urlViewMode
			: defaultMode;
	});


	const onViewChange = ( newViewMode: ViewMode ): void => {
		setViewMode( newViewMode );

		const params = new URLSearchParams( searchParams.toString() );
		params.set( queryName, newViewMode );
		router.replace( `?${params.toString()}` );
	};


	return {
		viewMode,
		setViewMode,
		onViewChange,
	};
}
