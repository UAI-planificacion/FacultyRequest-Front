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

                            <footer className="border-t border-border py-6">
                                <div className="container mx-auto text-center text-muted-foreground">
                                    <p>© 2025 Sistema de Gestión de Facultades. Todos los derechos reservados.</p>
                                </div>
                            </footer>
                        </main>
                    </ThemeProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
