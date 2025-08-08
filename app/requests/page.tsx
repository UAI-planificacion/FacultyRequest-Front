"use client"

import { JSX, useEffect, useState }  from "react";

import { useQuery } from '@tanstack/react-query';

import { RequestsManagement }   from "@/components/request/request";
import { useSession }           from "@/hooks/use-session";
import { KEY_QUERYS }           from "@/consts/key-queries";
import { fetchApi }             from "@/services/fetch";
import { Staff }                from "@/types/staff.model";


export default function RequestsPage(): JSX.Element {
    const { session, isLoading: isSession } = useSession();
    const [ email, setEmail ]               = useState( '' );

    useEffect(() => {
        setEmail( session?.user?.email || '' );
    }, [session]);

    const { data: staff, isLoading, isError } = useQuery({
        queryKey    : [ KEY_QUERYS.STAFF ],
        queryFn     : () => fetchApi<Staff>({ url: `staff/${email}` }),
        enabled     : !!email
    });

    return (
        <main className="min-h-[calc(100vh-75px)] container mx-auto py-6 space-y-4 px-4">
            <div className="grid">
                <h1 className="text-2xl font-bold">Facultad {staff?.facultyName}</h1>

                <span className="text-[11px] text-muted-foreground">{staff?.facultyId}</span>
            </div>

            <RequestsManagement
                facultyId   = { staff?.facultyId || '' }
                enabled     = { !!staff }
            />
        </main>
    );
}
