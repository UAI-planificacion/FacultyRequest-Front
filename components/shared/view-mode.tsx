'use client'

import { JSX } from "react";

import { AlignJustify, Grid2x2 } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ViewMode = "cards" | "table";


export interface ViewModeProps {
    viewMode		: ViewMode;
    onViewChange    : ( viewMode: ViewMode ) => void;
}


export function ViewMode({
    viewMode,
    onViewChange
}: ViewModeProps ): JSX.Element {
    return (
        <Tabs
            value           = { viewMode }
            onValueChange   = {( value ) => onViewChange( value as ViewMode )}
        >
            <TabsList className="px-1 py-0">
                <TabsTrigger value="cards" title="Vista de tarjetas">
                    <Grid2x2 className="h-5 w-5" />
                </TabsTrigger>

                <TabsTrigger value="table" title="Vista de tabla">
                    <AlignJustify className="h-5 w-5" />
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
}
