import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { Option }       from "@/components/shared/Combobox";
import { KEY_QUERYS }   from "@/consts/key-queries";
import { fetchApi }     from "@/services/fetch";
import { Space }        from "@/types/space.model";
import { ENV }          from "@/config/envs/env";

// Interface for flattened space data
export interface SpaceData {
	id			: string;
	name		: string;
	size		: string;
	building	: string;
	type		: string;
}

// Function to transform cost center data to options format
export const memoizedSpaceData = (
	spaceData : Space | undefined
): Option[] => useMemo(() => {
	return spaceData?.lov_vals?.map( space => ({
		id		: space.idlovvals.toString(),
		label	: space.description,
		value	: space.description,
	})) ?? [];
}, [spaceData]);

// Function to transform space data to flattened format
export const memoizedSpaceDataFlat = (
	spaceData : Space | undefined
): SpaceData[] => useMemo(() => {
	return spaceData?.lov_vals?.map( space => ({
		id			: space.idlovvals.toString(),
		name		: space.description,
		size		: space.skill.size,
		building    : space.skill.building,
		type		: space.skill.type,
	})) ?? [];
}, [spaceData]);

// Interface for hook parameters
interface UseSpaceParams {
	enabled? : boolean;
}

// Interface for hook return values
interface UseSpaceReturn {
	spaces		: Option[];
	spacesData  : SpaceData[];
	isLoading	: boolean;
	isError		: boolean;
	error		: Error | null;
}

/**
 * Custom hook to fetch and manage cost center data
 * @param params - Configuration parameters for the hook
 * @returns Transformed cost center data, loading state, and error information
 */
export const useSpace = ( 
	params : UseSpaceParams = {} 
): UseSpaceReturn => {
	const { enabled = true }    = params;
    const url                   = `${ENV.ROOM_SYSTEM_URL}${ENV.ROOM_ENDPOINT}`

	const {
		data,
		isLoading,
		isError,
		error
	} = useQuery<Space>({
		queryKey	: [KEY_QUERYS.SPACES],
		queryFn		: () => fetchApi({ isApi: false, url }),
		enabled,
	});


	return {
		spaces		: memoizedSpaceData( data ),
		spacesData	: memoizedSpaceDataFlat( data ),
		isLoading,
		isError,
		error,
	};
};
