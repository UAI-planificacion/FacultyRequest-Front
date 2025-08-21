"use client"

import { JSX, useEffect, useState }     from "react";
import { useRouter, useSearchParams }   from 'next/navigation';

import {
    BookCopy,
    BookOpen,
    Users
}                   from "lucide-react";
import { useQuery } from '@tanstack/react-query';

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
}                               from "@/components/ui/tabs";
import { RequestsManagement }   from "@/components/request/request";
import { SubjectsManagement }   from "@/components/subject/subjects-management";
import { StaffManagement }      from "@/components/staff/staff-management";

import { useSession }   from "@/hooks/use-session";
import { KEY_QUERYS }   from "@/consts/key-queries";
import { fetchApi }     from "@/services/fetch";
import { Staff }        from "@/types/staff.model";


enum TabValue {
    SUBJECTS    = "subjects",
    PERSONNEL   = "personnel",
    REQUESTS    = "requests"
}



export default function RequestsPage(): JSX.Element {
    const router                    = useRouter(); 
    const searchParams              = useSearchParams();
    const initialTab                = searchParams.get( 'tab' ) as TabValue || TabValue.SUBJECTS;
    const [activeTab, setActiveTab] = useState<TabValue>( initialTab );


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

    useEffect(() => {
        if ( !staff?.facultyId ) return;

        const currentParams = new URLSearchParams( searchParams.toString() );
        currentParams.set( 'tab', activeTab );
        router.replace( `?${currentParams.toString()}`, { scroll: false });
    }, [ activeTab, staff, router, searchParams ]);

    return (
        <main className="min-h-[calc(100vh-75px)] container mx-auto py-6 space-y-4 px-4">
            <div className="grid">
                <h1 className="text-2xl font-bold">Facultad {staff?.facultyName}</h1>

                <span className="text-[11px] text-muted-foreground">{staff?.facultyId}</span>
            </div>

            <Tabs
                value           = { activeTab }
                onValueChange   = {( value: string ) => setActiveTab( value as TabValue )}
                className       = "w-full"
            >
                <TabsList className="grid grid-cols-3 mb-4 h-12">
                    <TabsTrigger
                        value       = { TabValue.REQUESTS }
                        className   = "h-10 text-md gap-2"
                        title       = "Solicitudes"
                    >
                        <BookCopy className="h-5 w-5" />

                        <span className="hidden sm:block">Solicitudes</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value       = { TabValue.PERSONNEL }
                        className   = "h-10 text-md gap-2"
                        title       = "Personal"
                    >
                        <Users className="h-5 w-5" />

                        <span className="hidden sm:block">Personal</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value       = { TabValue.SUBJECTS }
                        className   = "h-10 text-md gap-2"
                        title       = "Asignaturas"
                    >
                        <BookOpen className="h-5 w-5" />

                        <span className="hidden sm:block">Asignaturas</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={TabValue.REQUESTS}>
                    <RequestsManagement
                        facultyId   = {  staff?.facultyId || '' }
                        enabled     = { activeTab === TabValue.REQUESTS }
                    />
                </TabsContent>

                <TabsContent value={TabValue.SUBJECTS}>
                    <SubjectsManagement 
                        facultyId   = { staff?.facultyId  || '' }
                        enabled     = { activeTab === TabValue.SUBJECTS }
                        staff       = { staff || {} as Staff }
                    />
                </TabsContent>

                <TabsContent value={TabValue.PERSONNEL}>
                    <StaffManagement 
                        facultyId   = { staff?.facultyId  || '' }
                        enabled     = { activeTab === TabValue.PERSONNEL }
                        staff       = { staff || {} as Staff }
                    />
                </TabsContent>
            </Tabs>
        </main>
    );
}
