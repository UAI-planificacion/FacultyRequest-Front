'use client'

import { useEffect, useState }      from "react";
import Image                        from "next/image"
import { usePathname, useRouter }   from "next/navigation";

import { Box, Building } from "lucide-react";

import { Theme }                        from "@/components/header/Theme";
import { Login }                        from "@/components/auth/Login";
import { AlertMessage }                 from "@/components/dialog/Alert";
import { NotificationDialogManager }    from "@/components/header/NotificationDialogManager";
import { Notifications }                from "@/components/header/Notifications";
import { Tabs, TabsList, TabsTrigger }  from "@/components/ui/tabs";

import { useSSE } from "@/hooks/use-sse";


type HeaderPath = 'faculty' | 'sections';


export default function Header() {
    const router    = useRouter();
    const pathname  = usePathname().split('/').pop() as HeaderPath;

    const [activeTab, setActiveTab]             = useState<'faculty' | 'sections'>( pathname );
    const [showAuthMessage, setShowAuthMessage] = useState( false );


    useSSE();


    useEffect(() => {
        const urlParams = new URLSearchParams( window.location.search );

        if ( urlParams.get( 'requireAuth' ) === 'true' ) {
            const newUrl = new URL( window.location.href );

            newUrl.searchParams.delete( 'requireAuth' );

            window.history.replaceState( {}, '', newUrl.toString() );
        }
    }, []);

    return (
        <>
            <header className="bg-black py-4 border-b border-gray-200 dark:border-gray-800 transition-colors">
                <div className="flex justify-between items-center container mx-auto gap-2 px-4">
                    <div className="flex items-center gap-3">
                        <a href="#">
                            <span className="sr-only">Universidad Adolfo Ibáñez</span>

                            <Image
                                className   = "p-0"
                                title       = "UAI"
                                src         = "https://mailing20s.s3.amazonaws.com/templtates/logosinescudo.png"
                                alt         = "logo uai"
                                width       = { 137 }
                                height      = { 50 }
                            />
                        </a>

                        <h1 className="hidden sm:flex text-2xl sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white">Facultades Académicas</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Login />

                        <NotificationDialogManager>
                            {({ onRequestClick, onRequestSessionClick, onPlanningChangeClick, onCommentClick }) => (
                                <Notifications
                                    onRequestClick          = { onRequestClick }
                                    onRequestSessionClick   = { onRequestSessionClick }
                                    onPlanningChangeClick   = { onPlanningChangeClick }
                                    onCommentClick          = { onCommentClick }
                                />
                            )}
                        </NotificationDialogManager>

                        <Theme />

                        <Tabs
                            value           = { activeTab }
                            onValueChange   = {( value: string ) => {router.push( value ); setActiveTab( value as HeaderPath );}}
                        >
                            <TabsList>
                                <TabsTrigger
                                    value   = { 'faculty' }
                                    title   = "Mi facultad"
                                    className="gap-0 lg:gap-1.5"
                                >
                                    <Building className="w-5 h-5" />
                                    <span className="hidden lg:flex">Mi facultad</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value   = { 'sections' }
                                    title   = "Secciones"
                                    className="gap-0 lg:gap-1.5"
                                >
                                    <Box className="w-5 h-5" />
                                    <span className="hidden lg:flex">Secciones</span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </header>

            { showAuthMessage && (
                <AlertMessage
                    title="Debes iniciar sesión para acceder a esta página."
                    onClose={() => setShowAuthMessage(false)}
                />
            )}
        </>
    );
}
