"use client"

import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools }               from '@tanstack/react-query-devtools';


interface QueryProviderProps {
    children: React.ReactNode
}


export function QueryProvider({ children }: QueryProviderProps) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Tiempo de cache por defecto (24 horas)
                staleTime: 1000 * 60 * 1,
                // Tiempo antes de garbage collection (24 horas)
                gcTime: 1000 * 60 * 1,
                // Reintentos en caso de error
                retry: 1,
                // No refetch automático al enfocar la ventana en desarrollo
                refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            },
            mutations: {
                // Reintentos para mutaciones
                retry: 1,
            },
        },
    }))

    return (
        <QueryClientProvider client={queryClient}>
            {children}

            <ReactQueryDevtools 
                initialIsOpen={false}
            />
        </QueryClientProvider>
    )
}
