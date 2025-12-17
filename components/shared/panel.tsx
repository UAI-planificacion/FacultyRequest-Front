'use client'

import { JSX, useRef, useState } from "react";

import { SlidersHorizontal, X } from "lucide-react";

import { Card, CardContent }    from "@/components/ui/card";
import { Button }               from "@/components/ui/button";

import { cn } from "@/lib/utils";


interface Props {
    children    : React.ReactNode;
    title       : string;
    count?      : number;
    icon?       : JSX.Element;
    iconPanel?  : JSX.Element;
    classname?  : string;
    offsetTop?  : number;
}


export function Panel({
    children,
    count       = 0,
    icon        = <SlidersHorizontal className="w-5 h-5" />,
    classname,
    offsetTop   = 0,
    iconPanel,
    title
}: Props ): JSX.Element {
    const [isPanelOpen, setIsPanelOpen] = useState<boolean>( false );
    const panelRef                      = useRef<HTMLDivElement>( null );


    return (
        <>
            {/* Botón flotante para abrir/cerrar panel */}
            <Button
                onClick     = { () => setIsPanelOpen( !isPanelOpen ) }
                variant     = "outline"
                title       = { isPanelOpen ? "Cerrar panel" : "Abrir panel" }
                style       = {{ top: `calc(50% + ${offsetTop}px)` }}
                className   = { cn(
                    "fixed -translate-y-1/2 z-[60] gap-2 shadow-lg rounded-s-full transition-all duration-300 ease-in-out",
                    classname,
                    isPanelOpen ? 'right-80 hidden md:flex' : 'right-0'
                )}
            >
                { icon }

                { count > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-primary-foreground text-primary rounded-full">
                        { count }
                    </span>
                )}
            </Button>

            {/* Panel flotante */}
            <div
                ref         = { panelRef }
                className   = { cn(
                    "fixed top-1/2 -translate-y-1/2 right-0 max-h-[calc(100vh-100px)] w-[95%] ml-4 md:ml-0 md:w-80 z-50 transition-transform duration-300 ease-in-out",
                    isPanelOpen ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                <Card className="rounded-none border-l rounded-s-lg shadow-2xl">
                    <CardContent className="p-4 max-h-[calc(100vh-100px)] overflow-y-auto space-y-4">
                        <div className="flex items-center gap-2">
                            <Button
                                onClick     = {() => setIsPanelOpen( false )}
                                variant     = "outline"
                                size        = "icon"
                                className   = "md:hidden rounded-full h-8 w-8 flex-shrink-0"
                                title       = "Cerrar filtros"
                            >
                                <X className="w-4 h-4" />
                            </Button>

                            { iconPanel }

                            <h3 className="text-lg font-semibold">{ title }</h3>
                        </div>

                        { children }
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
