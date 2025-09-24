'use client'

import { JSX } from "react";

import { Badge }            from "@/components/ui/badge";
import { getSpaceType }     from "@/lib/utils";
import { Size, SpaceType }  from "@/types/request-detail.model";


interface Props {
    spaceType?      : SpaceType | undefined | null;
    spaceSizeId?    : Size | undefined | null
}


export function SpaceSizeType({
    spaceSizeId,
    spaceType
} : Props ): JSX.Element {
    return (
        <div className="flex items-center gap-1.5">
            { spaceType && (
                <Badge className="text-xs">
                    { getSpaceType( spaceType )}
                </Badge>
            )}

            { spaceSizeId && (
                <Badge className="text-xs">
                    { spaceSizeId }
                </Badge>
            )}
        </div>
    );
}
