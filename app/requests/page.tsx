"use client"

import { JSX, useEffect, useState }  from "react";

import { useQuery } from '@tanstack/react-query';

import { RequestsManagement }   from "@/components/request/request";
import { KEY_QUERYS }           from "@/consts/key-queries";
import { fetchApi }             from "@/services/fetch";
import { useSession }           from "@/components/auth/use-session";
import { Staff }                from "@/types/staff.model";


export default function RequestsPage(): JSX.Element {
    const { session, isLoading: isSession }   = useSession();
    const [email, setEmail ] = useState( '' );

    useEffect(() => {
        setEmail( session?.user?.email || '' );
    }, [session]);
    

    const { data: staff, isLoading, isError }  = useQuery({
        queryKey    : [ KEY_QUERYS.STAFF, email ],
        queryFn     : () => fetchApi<Staff>({ url: `staff/${email}` }),
        enabled     : !!email
    });


    return (
        <main className="container mx-auto py-6 space-y-4">
            <div className="grid">
                <h1 className="text-2xl font-bold">Facultad</h1>
                <span className="text-[11px] text-muted-foreground">{staff?.facultyId}</span>
            </div>

            <RequestsManagement
                facultyId   = { staff?.facultyId || '' }
                enabled     = { !!staff }
            />
        </main>
    );
}
