'use client'

import { useEffect, useState } from "react";
import Image            from "next/image"

import { Theme }                        from "@/components/header/Theme";
import { Login }                        from "@/components/auth/Login";
import { AlertMessage }                 from "@/components/dialog/Alert";
import { NotificationDialogManager }    from "@/components/header/NotificationDialogManager";
import { Notifications }                from "@/components/header/Notifications";

import { useSSE } from "@/hooks/use-sse";


export default function Header() {
    useSSE();

    const [showAuthMessage, setShowAuthMessage] = useState( false );

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
                                className="p-0"
                                title       = "UAI"
                                src         = "https://mailing20s.s3.amazonaws.com/templtates/logosinescudo.png"
                                alt         = "logo uai"
                                width       = {137}
                                height      = {50}
                            />
                        </a>

                        <h1 className="hidden sm:flex text-2xl sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white">Facultades Académicas</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Login />

                        <NotificationDialogManager>
                            {({ onRequestClick, onRequestDetailClick }) => (
                                <Notifications
                                    onRequestClick={onRequestClick}
                                    onRequestDetailClick={onRequestDetailClick}
                                />
                            )}
                        </NotificationDialogManager>

                        <Theme />
                    </div>
                </div>
            </header>

            {showAuthMessage && (
                <AlertMessage
                    title="Debes iniciar sesión para acceder a esta página."
                    onClose={() => setShowAuthMessage(false)}
                />
            )}
        </>
    );
}
