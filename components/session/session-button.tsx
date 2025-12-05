'use client'

import { Minus, Plus } from 'lucide-react';

import {
    sessionBorders,
    sessionColors,
    sessionLabels
}                   from '@/components/section/section.config';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';

import { Session, SectionData } from '@/types/section.model';


interface Props {
    session             : Session,
    updateSessionCount  : ( sectionId: string, session: Session, delta: number ) => void,
    setSessionCount     : ( sectionId: string, session: Session, value: string ) => void;
    section             : SectionData;
    showLabel           : boolean;
}


export function SessionButton({
    session,
    updateSessionCount,
    setSessionCount,
    section,
    showLabel
}: Props ) {
    return (
        <div key={session} className="space-y-2 w-full">
            { showLabel &&
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${sessionColors[session]}`} />

                    <Label className="text-sm">{sessionLabels[session]}</Label>
                </div>
            }

            <div className="flex items-center gap-2" title={ showLabel ? '' : sessionLabels[session]}>
                <Button
                    variant     = "outline"
                    size        = "sm"
                    onClick     = {() => updateSessionCount(section.id, session, -1 )}
                    disabled    = { section.sessionCounts[session] === 0 }
                    className   = { `px-2 h-8 ${sessionBorders[session] }`}
                    type        = "button"
                >
                    <Minus className="h-4 w-4" />
                </Button>

                <Input
                    type        = "number"
                    value       = { section.sessionCounts[ session ]}
                    onChange    = {( e ) => setSessionCount( section.id, session, e.target.value )}
                    className   = { `${ showLabel ? 'w-full' : 'w-20' } text-center h-8 ${ sessionBorders[session] } [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                    min         = "0"
                    max         = "99"
                />

                <Button
                    variant     = "outline"
                    size        = "sm"
                    onClick     = {() => updateSessionCount( section.id, session, 1 )}
                    className   = {`px-2 h-8 ${sessionBorders[session]}`}
                    type        = "button"
                    disabled    = { section.sessionCounts[session] === 99 }
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
