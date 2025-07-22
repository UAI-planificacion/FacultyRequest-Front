"use client"

import { JSX, useMemo } from "react";
import { useParams }    from 'next/navigation';

import { useQueryClient } from '@tanstack/react-query';

import { RequestsManagement }   from "@/components/request/request";
import { FacultyResponse }      from "@/types/faculty.model";
import { KEY_QUERYS }           from "@/consts/key-queries";


export default function FacultyDetailsPage(): JSX.Element {
    const params                    = useParams();
    const queryClient               = useQueryClient();
    const facultyId                 = params.facultyId as string;

    /**
     * Obtiene el nombre de la facultad desde la caché de TanStack Query
     */
    const facultyName = useMemo(() => {
        const facultiesData = queryClient.getQueryData<FacultyResponse>([ KEY_QUERYS.FACULTIES ]);
        const faculty       = facultiesData?.faculties.find( f => f.id === facultyId );
        return faculty?.name || facultyId;
    }, [ queryClient, facultyId ]);

    return (
        <main className="container mx-auto py-6 space-y-4">
            <div className="grid">
                <h1 className="text-2xl font-bold">Facultad {facultyName}</h1>
                <span className="text-[11px] text-muted-foreground">{facultyId}</span>
            </div>

            <RequestsManagement
                facultyId   = { facultyId }
                enabled     = { true }
            />
        </main>
    );
}
