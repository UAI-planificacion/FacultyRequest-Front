import type { Metadata } from 'next';

import './globals.css';

import { QueryProvider }    from '@/app/query-provider';
import Header               from '@/components/header/Header';
import { ThemeProvider }    from '@/components/theme-provider';
import { Toaster }          from '@/components/ui/sonner';


export const metadata: Metadata = {
    title: 'Sistema de Facultades',
    description: 'Sistema de Facultades',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" suppressHydrationWarning={true} >
            <body>
                <QueryProvider>
                    <ThemeProvider
                        attribute       = "class"
                        defaultTheme    = "system"
                        enableSystem 
                    >
                        <Header />

                        <Toaster />

                        <main className="flex-grow">
                            {children}
                        </main>
                    </ThemeProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
