import { BookCopy, Book } from 'lucide-react';


export default function Home() {
    return (
        <main className="flex flex-col min-h-[calc(100vh-84px)]">
            <section className="flex-1 container mx-auto py-12">
                <div className="max-w-4xl mx-auto text-center space-y-6 mt-8">
                    <h2 className="text-4xl font-bold tracking-tight">
                        Gestión Solicitudes de Facultades
                    </h2>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Solicita y gestiona las solicitudes de tu facultad de manera eficiente.
                    </p>

                    <div className="flex justify-center items-center gap-5">
                        <div className="bg-card p-6 rounded-lg border border-border flex flex-col items-center text-center">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <Book className="h-6 w-6 text-primary" />
                            </div>

                            <h3 className="text-lg font-medium mb-2">Gestión de Solicitudes</h3>

                            <p className="text-muted-foreground">
                                Gestiona las solicitudes de tu facultad de manera eficiente.
                            </p>
                        </div>

                        <div className="bg-card p-6 rounded-lg border border-border flex flex-col items-center text-center">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <BookCopy className="h-6 w-6 text-primary" />
                            </div>

                            <h3 className="text-lg font-medium mb-2">Gestión de detalle de solicitudes</h3>

                            <p className="text-muted-foreground">
                                Gestiona los detalles de las solicitudes de tu facultad.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
