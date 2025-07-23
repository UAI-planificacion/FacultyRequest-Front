import { ENV } from "@/config/envs/env";

export enum Method {
    GET     = 'GET',
    POST    = 'POST',
    PATCH   = 'PATCH',
    DELETE  = 'DELETE',
}


export interface ErrorApi {
    ok: false;
    error: string | object;
}

export function isErrorApi<T>( value: T | ErrorApi ): value is ErrorApi {
    return (
        value !== null &&
        typeof value === 'object' &&
        'ok' in value &&
        value.ok === false
    );
}

export interface FetchApi<T> {
    url     : string,
    method? : Method
    body?   : object,
    isApi?  : boolean
}


export async function fetchApi<T>(
    { url, method = Method.GET, body, isApi = true }: FetchApi<T>
): Promise<T> {
    if ( isApi ) url = `${ENV.REQUEST_BACK_URL}${url}`;

    const bodyRequest = method !== Method.GET ? body : undefined;

    try {
        const response = await fetch( url, {
            method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify( bodyRequest ),
        } );

        if ( !response.ok ) {
            const errorBody = await response.json();

            throw new Error( errorBody.message || `API error: ${response.status} ${response.statusText}` );
        }

        return await response.json() as T;
    } catch ( error ) {
        if ( error instanceof Error ) {
            throw error;
        }

        throw new Error( 'Network or unexpected error occurred.' );
    }
}
