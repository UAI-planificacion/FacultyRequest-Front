import { JSX, useState, useCallback, useMemo } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
}                       from "@/components/ui/table"
import { Day, Module }  from "@/types/request";
import { CheckIcon }    from "@/icons/Check";
import { NoCheckIcon }  from "@/icons/NoCheck";


interface RequestDetailModule {
    id?         : string;
    day         : string;
    moduleId    : string;
}


interface RequestDetailModuleDaysProps {
    requestDetailModule : RequestDetailModule[];
    days                : Day[];
    modules             : Module[];
    onModuleToggle      : ( day: string, moduleId: string, isChecked: boolean ) => void;
}


export function RequestDetailModuleDays({
    requestDetailModule,
    days,
    modules,
    onModuleToggle
}: RequestDetailModuleDaysProps ): JSX.Element {
    const [animationKeys, setAnimationKeys] = useState<Record<string, number>>({});


    const checkedStates = useMemo(() => {
        const states: Record<string, boolean> = {};

        requestDetailModule.forEach(item => {
            states[`${item.day}-${item.moduleId}`] = true;
        });
        return states;
    }, [requestDetailModule]);


    const isChecked = useCallback(( day: string, moduleId: string ): boolean => {
        return checkedStates[`${day}-${moduleId}`] || false;
    }, [checkedStates]);


    const handleCheckboxChange = useCallback(( day: string, moduleId: string, checked: boolean ): void => {
        const key = `${moduleId}-${day}`;

        setAnimationKeys(prev => ({
            ...prev,
            [key]: (prev[key] || 0) + 1
        }));

        onModuleToggle( day, moduleId, checked );
    }, [onModuleToggle]);

    return (
        <div className="w-full">
            <div className="border rounded-lg bg-background relative">
                {/* Header fijo */}
                <div className="sticky top-0 z-30 bg-background border-b">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[12.2rem] px-3 border-r bg-background">
                                        Módulos
                                    </TableHead>

                                    {days.map((day) => (
                                        <TableHead
                                            key         = { day.id }
                                            className   = "text-center w-20 min-w-20 px-2 whitespace-nowrap bg-background"
                                        >
                                            { day.name }
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                        </Table>
                    </div>
                </div>

                {/* Contenido con scroll */}
                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                    <Table>
                        <TableBody>
                            {modules.map((module) => (
                                <TableRow key={module.id}>
                                    <TableCell
                                        className   = "sticky left-0 bg-background z-10 w-32 min-w-32 p-3 border-r shadow-md text-xs truncate"
                                        title       = { `${ module.name } ${ module.difference ?? '' } ${ module.startHour }-${ module.endHour }` }
                                    >
                                        { module.name } { module.difference ?? '' } { module.startHour }-{ module.endHour }
                                    </TableCell>

                                    {days.map( day => (
                                        <TableCell
                                            key         = { `${ module.id }-${ day.id }` }
                                            className   = "text-center w-20 min-w-20 p-2 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 cursor-pointer"
                                            onClick     = {() => {
                                                const currentChecked = isChecked( day.id.toString(), module.id.toString() );
                                                handleCheckboxChange( day.id.toString(), module.id.toString(), !currentChecked );
                                            }}
                                        >
                                            { isChecked( day.id.toString(), module.id.toString() )
                                                ? <CheckIcon key={`check-${module.id}-${day.id}-${animationKeys[`${module.id}-${day.name}`] || 0}`} />
                                                : <NoCheckIcon key={`nocheck-${module.id}-${day.id}-${animationKeys[`${module.id}-${day.name}`] || 0}`} />
                                            }
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
