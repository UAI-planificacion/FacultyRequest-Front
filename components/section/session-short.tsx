'use client'

import { JSX } from "react";

import { Session }      from "@/types/section.model";
import { Offer }        from "@/types/offer.model";
import { SessionName }  from "@/components/section/session-name";
import { SessionCount } from "@/components/section/types";


interface Props {
    sessionCounts   : SessionCount;
    showZero?       : boolean
}


export const getSessionCounts = ( offer : Offer ): SessionCount => ({
    C: offer.lecture,
    A: offer.tutoringSession,
    T: offer.workshop,
    L: offer.laboratory,
});


export function SessionShort({
    sessionCounts,
    showZero = false
}: Props ): JSX.Element {
    return (
        <div className="flex gap-1 items-center">
            { Object.entries( sessionCounts ).map( ( [ session, count ] ) => {
                if ( showZero || count > 0 ) {
                    return (
                        <SessionName
                            key     = { session }
                            session = { session as Session }
                            isShort = { true }
                            count   = { count }
                        />
                    );
                }
                return null;
            }) }
        </div>
    );
}
