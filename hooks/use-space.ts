import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { Option }           from "@/components/shared/Combobox";
import { KEY_QUERYS }       from "@/consts/key-queries";
import { fetchApi }         from "@/services/fetch";
import { Space }            from "@/types/space.model";
import { mockFetchSpaces }  from "@/data/space.data";
import { ENV }              from "@/config/envs/env";


// Function to transform cost center data to options format
export const memoizedSpaceData = (
	spaceData : Space[] | undefined
): Option[] => useMemo(() => {
	return spaceData?.map( space => ({
		id		: space.lov_vals[0].id,
		label	: space.lov_vals[0].description,
		value	: space.lov_vals[0].id,
	})) ?? [];
}, [spaceData]);


// Interface for hook parameters
interface UseSpaceParams {
	enabled? : boolean;
}


// Interface for hook return values
interface UseSpaceReturn {
	spaces      : Option[];
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
	const { enabled = true } = params;
    const useMockData = ENV.NODE_ENV === 'development';

	const {
		data: spaces = [],
		isLoading,
		isError,
		error
	} = useQuery<Space[]>({
		queryKey	: [KEY_QUERYS.SPACES],
		// queryFn		: () => fetchApi({ isApi: false, url: `cost-centers/all` }),
        queryFn: useMockData 
            ? mockFetchSpaces
            : () => fetchApi({ isApi: false, url: `${ENV.ROOM_SYSTEM_URL}${ENV.ROOM_ENDPOINT}` }),
		enabled,
	});


	// Transform the data using memoized function
	const spaceOptions = memoizedSpaceData( spaces );

	return {
		spaces: spaceOptions,
		isLoading,
		isError,
		error,
	};
};
