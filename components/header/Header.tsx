'use client'

import { useEffect, useState } from "react";

import { Theme }        from "@/components/header/Theme";
import { Login }        from "@/components/auth/Login";
import { AlertMessage } from "@/components/dialog/Alert";


export default function Header() {
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
                <div className="flex justify-between items-center container mx-auto gap-2">
                    <h1 className="text-xl xl:text-2xl font-bold text-white">Facultades académicas</h1>

                    <div className="flex items-center gap-2">
                        <Login />

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
