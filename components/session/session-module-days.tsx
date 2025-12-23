import { JSX, useState, useCallback, useMemo } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
}                       from "@/components/ui/table"
import {
	Module,
	DayModule
}						from "@/types/request";
import { CheckIcon }    from "@/icons/Check";
import { NoCheckIcon }  from "@/icons/NoCheck";
import { useQuery }     from "@tanstack/react-query";
import { KEY_QUERYS }   from "@/consts/key-queries";
import { fetchApi }     from "@/services/fetch";


interface Props {
    dayModuleIds        : number[];
    onDayModuleIdsChange: ( dayModuleIds: number[] ) => void;
    enabled             : boolean;
    multiple            ?: boolean;
    onDayModuleSelect   ?: ( dayModuleId: number | null ) => void;
}


export function SessionModuleDays({
    dayModuleIds,
    onDayModuleIdsChange,
    enabled,
    multiple = true,
    onDayModuleSelect
}: Props ): JSX.Element {
    const {
		data        : modules = [],
		isLoading   : isLoadingModules,
		isError     : isErrorModules,
	} = useQuery({
		queryKey    : [KEY_QUERYS.MODULES],
        queryFn     : () => fetchApi<Module[]>({ url: 'modules/original' }),
		enabled,
	});

	const {
		data        : dayModules = [],
		isLoading   : isLoadingDayModules,
		isError     : isErrorDayModules,
	} = useQuery({
		queryKey    : [KEY_QUERYS.MODULES, 'dayModule'],
		queryFn     : () => fetchApi<DayModule[]>({ url: 'modules/dayModule' }),
		// enabled     : enabled && !multiple,
		enabled     : enabled,
	});



	console.log('🚀 ~ file: session-module-days.tsx:61 ~ dayModules:', dayModules );


    const availableDays = useMemo(() => {
        const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const uniqueDayIds = new Set<number>();

        modules.forEach( module => {
            module.days.forEach( dayId => uniqueDayIds.add( dayId ));
        });

        return Array.from( uniqueDayIds )
            .sort(( a, b ) => a - b )
            .map( dayId => ({
                id          : dayId,
                name        : dayNames[dayId - 1] || `Día ${dayId}`,
                shortName   : dayNames[dayId - 1]?.substring( 0, 3 ) || `D${dayId}`,
                mediumName  : dayNames[dayId - 1]?.substring( 0, 4 ) || `Día${dayId}`
            }));
    }, [ modules ]);


    const modulesWithDays = useMemo(() => {
        return modules.filter( module => module.days.length > 0 );
    }, [ modules ]);


    const [animationKeys, setAnimationKeys] = useState<Record<string, number>>({});


    // Convert dayModuleIds to a Set of "dayId-moduleId" strings for quick lookup
    const checkedStates = useMemo(() => {
        const states: Record<string, number> = {}; // key: "dayId-moduleId", value: dayModuleId

        dayModuleIds.forEach( dayModuleId => {
            const dayModule = dayModules.find( dm => dm.id === dayModuleId );
            if ( dayModule ) {
                const key = `${dayModule.dayId}-${dayModule.moduleId}`;
                states[key] = dayModuleId;
            }
        });

        return states;
    }, [ dayModuleIds, dayModules ]);


    const isChecked = useCallback(( day: string, moduleId: string ): boolean => {
        return !!checkedStates[`${day}-${moduleId}`];
    }, [checkedStates]);


    const handleCheckboxChange = useCallback(( day: string, moduleId: string, checked: boolean ): void => {
        const key = `${moduleId}-${day}`;

        setAnimationKeys(prev => ({
            ...prev,
            [key]: (prev[key] || 0) + 1
        }));

        // Buscar el dayModuleId correspondiente
        const dayId     = parseInt( day );
        const modId     = parseInt( moduleId );
        const dayModule = dayModules.find( dm => dm.dayId === dayId && dm.moduleId === modId );
        const dayModuleId = dayModule?.id;

        if ( !dayModuleId ) {
            console.error('No se encontró el dayModuleId para', { dayId, modId });
            return;
        }

        // Si es modo single, pasar el dayModuleId al callback
        if ( !multiple && onDayModuleSelect ) {
            if ( checked ) {
                onDayModuleSelect( dayModuleId );
            } else {
                onDayModuleSelect( null );
            }
        }

        // Actualizar el array de dayModuleIds
        let newDayModuleIds: number[];

        if ( checked ) {
            // Agregar el nuevo dayModuleId
            if ( multiple ) {
                newDayModuleIds = [...dayModuleIds, dayModuleId];
            } else {
                // En modo single, reemplazar todo el array
                newDayModuleIds = [dayModuleId];
            }
        } else {
            // Remover el dayModuleId
            newDayModuleIds = dayModuleIds.filter( id => id !== dayModuleId );
        }

        onDayModuleIdsChange( newDayModuleIds );
    }, [ dayModuleIds, onDayModuleIdsChange, multiple, onDayModuleSelect, dayModules ]);


    if ( isLoadingModules || isLoadingDayModules ) {
        return (
            <div className="w-full p-8 text-center text-muted-foreground">
                Cargando módulos...
            </div>
        );
    }


    if ( isErrorModules || isErrorDayModules ) {
        return (
            <div className="w-full p-8 text-center text-red-500">
                Error al cargar los módulos
            </div>
        );
    }


    if ( modulesWithDays.length === 0 ) {
        return (
            <div className="w-full p-8 text-center text-muted-foreground">
                No hay módulos disponibles con días asignados
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="border rounded-lg bg-background relative">
                {/* Header fijo */}
                <div className="sticky top-0 z-30 bg-background border-b">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[7.85rem] px-3 border-r bg-background">
                                        Módulos
                                    </TableHead>

                                    {availableDays.map((day) => (
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
                <div className="overflow-x-auto ">
                    <Table>
                        <TableBody>
                            {modulesWithDays.map((module) => (
                                <TableRow key={module.id}>
                                    <TableCell
                                        className   = "sticky left-0 bg-background z-10 w-32 min-w-32 p-3 border-r shadow-md text-xs truncate"
                                        title       = { `${ module.name } ${ module.difference ?? '' } ${ module.startHour }-${ module.endHour }` }
                                    >
                                        { module.name } { module.difference ?? '' } { module.startHour }-{ module.endHour }
                                    </TableCell>

                                    {availableDays.map( day => {
                                        // Verificar si este módulo está disponible en este día
                                        const isModuleAvailableOnDay = module.days.includes( day.id );

                                        return (
                                            <TableCell
                                                key         = { `${ module.id }-${ day.id }` }
                                                className   = {`text-center w-20 min-w-20 p-2 ${
                                                    isModuleAvailableOnDay 
                                                        ? 'hover:bg-zinc-200/50 dark:hover:bg-zinc-800 cursor-pointer' 
                                                        : 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-50'
                                                }`}
                                                onClick     = {() => {
                                                    if ( !isModuleAvailableOnDay ) return;
                                                    
                                                    const currentChecked = isChecked( day.id.toString(), module.id.toString() );
                                                    
                                                    // Si es modo single y estamos marcando una nueva celda, limpiar selecciones previas
                                                    if ( !multiple && !currentChecked ) {
                                                        // El handleCheckboxChange ya maneja el reemplazo en modo single
                                                    }
                                                    
                                                    handleCheckboxChange( day.id.toString(), module.id.toString(), !currentChecked );
                                                }}
                                            >
                                                { isModuleAvailableOnDay ? (
                                                    isChecked( day.id.toString(), module.id.toString() )
                                                        ? <CheckIcon key={`check-${module.id}-${day.id}-${animationKeys[`${module.id}-${day.name}`] || 0}`} />
                                                        : <NoCheckIcon key={`nocheck-${module.id}-${day.id}-${animationKeys[`${module.id}-${day.name}`] || 0}`} />
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
