import { JSX, useState, useCallback, useMemo, useEffect } from "react";

import { MousePointer2, Eraser, CircleQuestionMark }    from "lucide-react";
import { useQuery }                 from "@tanstack/react-query";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
}                           from "@/components/ui/table"
import {
    ToggleGroup,
    ToggleGroupItem
}                           from "@/components/ui/toggle-group";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
}                           from "@/components/ui/tooltip";
import { Button }           from "@/components/ui/button";
import { Skeleton }         from "@/components/ui/skeleton";
import { sessionLabels }    from "@/components/section/section.config";

import { DayModule, Module }    from "@/types/request";
import { KEY_QUERYS }           from "@/consts/key-queries";
import { fetchApi }             from "@/services/fetch";
import { Session }              from "@/types/section.model";

interface SessionDayModule {
	session         : Session;
	dayModuleId     : number;
	dayId           : number;
	moduleId        : number;
}


interface Props {
	selectedSessions        : SessionDayModule[];
	onToggleDayModule       : ( session: Session, dayId: number, moduleId: number, dayModuleId: number ) => void;
	currentSession          : Session | null;
	availableSessions       : Session[];
	enabled                 : boolean;
	multiple?               : boolean;
	onCurrentSessionChange? : ( session: Session ) => void;
	showSessionButtons?     : boolean;
	sessionButtonLabel?     : ( session: Session, count: number ) => string;
}


export function SessionDayModuleSelector({
	selectedSessions,
	onToggleDayModule,
	currentSession,
	availableSessions,
	enabled,
	multiple = false,
	onCurrentSessionChange,
	showSessionButtons = true,
	sessionButtonLabel
}: Props ): JSX.Element {
	// Estados para drag-select (solo activos cuando multiple = true)
	const [ selectionMode, setSelectionMode ]   = useState<'select' | 'erase'>( 'select' );
	const [ isMouseDown, setIsMouseDown ]       = useState( false );

	// Calcular el count de cada sesión
	const getSessionCount = useCallback(( session: Session ): number => {
		return selectedSessions.filter( s => s.session === session ).length;
	}, [ selectedSessions ]);


	const {
		data        : modules = [],
		isLoading   : isLoadingModules,
		isError     : isErrorModules,
	} = useQuery({
		queryKey    : [KEY_QUERYS.MODULES],
		queryFn     : () => fetchApi<Module[]>({ url: 'modules/original' }),
	});

    const {
		data        : dayModules = [],
		isLoading   : isLoadingDayModules,
		isError     : isErrorDayModules,
	} = useQuery({
		queryKey    : [KEY_QUERYS.MODULES, 'dayModules'],
		queryFn     : () => fetchApi<DayModule[]>({ url: 'modules/dayModule' }),
	});


	const availableDays = useMemo(() => {
		const dayNames      = [ 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo' ];
		const uniqueDayIds  = new Set<number>();

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

	// Map para saber qué sesión(es) tiene cada dayModuleId
	const dayModuleSessionMap = useMemo(() => {
		const map = new Map<string, Session[]>();

		selectedSessions.forEach( item => {
			const key = `${item.dayId}-${item.moduleId}`;
			const existing = map.get( key ) || [];
			
			if ( !existing.includes( item.session )) {
				map.set( key, [...existing, item.session] );
			}
		});

		return map;
	}, [ selectedSessions ]);

	// Obtener sesiones para un dayModule
	const getSessionsForDayModule = useCallback(( dayId: number, moduleId: string ): Session[] => {
		const key = `${dayId}-${moduleId}`;
		return dayModuleSessionMap.get( key ) || [];
	}, [ dayModuleSessionMap ]);

	// Calcular el dayModuleId basado en dayId y moduleId
	const calculateDayModuleId = useCallback(( dayId: number, moduleId: number ): number => {
        return dayModules.find( dayModule => dayModule.dayId === dayId && dayModule.moduleId === moduleId )?.id || 0;
	}, [ dayModules ]);


	const handleCellClick = useCallback(( dayId: number, moduleId: number ): void => {
		if ( !currentSession || !enabled ) return;

		const sessionsInCell = getSessionsForDayModule( dayId, moduleId.toString() );
		const dayModuleId = calculateDayModuleId( dayId, moduleId );

		// Si multiple = false, comportamiento original (reemplazar)
		if ( !multiple ) {
			onToggleDayModule( currentSession, dayId, moduleId, dayModuleId );
			return;
		}

		// Si multiple = true, agregar/quitar sesión
		const isSessionInCell = sessionsInCell.includes( currentSession );

		if ( isSessionInCell ) {
			// Quitar la sesión
			onToggleDayModule( currentSession, dayId, moduleId, dayModuleId );
		} else {
			// Agregar la sesión (sin validación de límite aquí)
			// La validación de límite se debe hacer en el componente padre
			// que conoce el número real de RequestSession de cada tipo
			onToggleDayModule( currentSession, dayId, moduleId, dayModuleId );
		}
	}, [ currentSession, enabled, getSessionsForDayModule, calculateDayModuleId, onToggleDayModule, multiple, selectedSessions, availableSessions ]);

	// Manejar drag-select (solo cuando multiple = true)
	const handleCellDrag = useCallback(( dayId: number, moduleId: number ): void => {
		if ( !multiple || !isMouseDown || !currentSession || !enabled ) return;

		const sessionsInCell = getSessionsForDayModule( dayId, moduleId.toString() );
		const dayModuleId = calculateDayModuleId( dayId, moduleId );
		const isSessionInCell = sessionsInCell.includes( currentSession );

		// Modo Select: Agregar si no está
		if ( selectionMode === 'select' && !isSessionInCell ) {
			onToggleDayModule( currentSession, dayId, moduleId, dayModuleId );
		}

		// Modo Erase: Quitar si está
		if ( selectionMode === 'erase' && isSessionInCell ) {
			onToggleDayModule( currentSession, dayId, moduleId, dayModuleId );
		}
	}, [ multiple, isMouseDown, currentSession, enabled, selectionMode, getSessionsForDayModule, calculateDayModuleId, onToggleDayModule ]);

	// Event listeners para mouse up global
	useEffect(() => {
		if ( !multiple ) return;

		const handleMouseUp = () => setIsMouseDown( false );
		const handleMouseLeave = () => setIsMouseDown( false );

		window.addEventListener( 'mouseup', handleMouseUp );
		document.addEventListener( 'mouseleave', handleMouseLeave );

		return () => {
			window.removeEventListener( 'mouseup', handleMouseUp );
			document.removeEventListener( 'mouseleave', handleMouseLeave );
		};
	}, [ multiple ]);


	if ( isLoadingModules || isLoadingDayModules ) {
		return (
			<div className="w-full">
				{/* Botones de modo skeleton */}
				{ multiple && (
					<div className="flex gap-2 mb-3">
						<Skeleton className="h-9 w-32" />
						<Skeleton className="h-9 w-24" />
					</div>
				)}

				{/* Tabla skeleton */}
				<div className="border rounded-lg bg-background">
					{/* Header */}
					<div className="border-b">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[7.85rem] px-3 border-r">
										<Skeleton className="h-4 w-20" />
									</TableHead>
									{ Array.from({ length: 5 }).map(( _, index ) => (
										<TableHead key={ index } className="text-center w-20 min-w-20 px-2">
											<Skeleton className="h-4 w-16 mx-auto" />
										</TableHead>
									))}
								</TableRow>
							</TableHeader>
						</Table>
					</div>

					{/* Body */}
					<Table>
						<TableBody>
							{ Array.from({ length: 8 }).map(( _, rowIndex ) => (
								<TableRow key={ rowIndex }>
									<TableCell className="sticky left-0 bg-background z-10 w-32 min-w-32 p-3 border-r">
										<Skeleton className="h-4 w-24" />
									</TableCell>
									{ Array.from({ length: 5 }).map(( _, colIndex ) => (
										<TableCell key={ colIndex } className="text-center w-20 min-w-20 p-2">
											<Skeleton className="h-6 w-8 mx-auto" />
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		);
	}


	if ( isErrorModules || isErrorDayModules ) {
		return (
			<div className="w-full">
				{/* Botones de modo (deshabilitados) */}
				{ multiple && (
					<div className="flex gap-2 mb-3">
						<Button
							type		= "button"
							variant		= "outline"
							size		= "sm"
							disabled
							className	= "gap-2"
						>
							<MousePointer2 className="h-4 w-4" />
							Seleccionar
						</Button>

						<Button
							type		= "button"
							variant		= "outline"
							size		= "sm"
							disabled
							className	= "gap-2"
						>
							<Eraser className="h-4 w-4" />
							Borrar
						</Button>
					</div>
				)}

				{/* Mensaje de error */}
				<div className="border border-red-500 rounded-lg bg-red-50 dark:bg-red-950/20 p-8">
					<div className="text-center">
						<p className="text-red-600 dark:text-red-400 font-semibold mb-2">
							Error al cargar los datos
						</p>
						<p className="text-red-500 dark:text-red-300 text-sm">
							{ isErrorModules 
								? 'No se pudieron cargar los módulos' 
								: 'No se pudieron cargar los días y módulos'
							}
						</p>
					</div>
				</div>
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
		<div className="w-full space-y-2">
            <div className="flex items-center justify-between gap-4">
			    {/* Botones de selección de sesión (solo si enabled y showSessionButtons) */}
                { enabled && showSessionButtons && onCurrentSessionChange && availableSessions.length > 0 && (
                    <div className="flex items-center gap-2">
                        <ToggleGroup
                            type            = "single"
                            value           = { currentSession || undefined }
                            variant         = "outline"
                            onValueChange   = {( value ) => {
                                if ( value ) onCurrentSessionChange( value as Session );
                            }}
                        >
                            { availableSessions.map( session => {
                                const count = getSessionCount( session );
                                const label = sessionButtonLabel 
                                    ? sessionButtonLabel( session, count )
                                    : `${ sessionLabels[session] } (${ count })`;

                                return (
                                    <ToggleGroupItem
                                        key         = { session }
                                        value       = { session }
                                        aria-label  = { sessionLabels[session] }
                                        className   = "gap-2"
                                    >
                                        { label }
                                    </ToggleGroupItem>
                                );
                            })}
                        </ToggleGroup>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant     = "outline"
                                    size        = "sm"
                                    type        = "button"
                                >
                                    <CircleQuestionMark className="h-5 w-5"/>
                                </Button>
                            </TooltipTrigger>

                            <TooltipContent>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Primero seleccione el tipo de sesión y luego los días y módulos
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                )}

                {/* Botones de modo (solo cuando multiple = true) */}
                { multiple && enabled && (
                    <ToggleGroup
                        type            = "single"
                        value           = { selectionMode }
                        variant         = "outline"
                        className       = "justify-start"
                        onValueChange   = {( value ) => {
                            if ( value ) setSelectionMode( value as 'select' | 'erase' );
                        }}
                    >
                        <ToggleGroupItem
                            value       = "select"
                            aria-label  = "Modo seleccionar"
                            className   = "gap-2 data-[state=on]:bg-accent"
                            title       = "Seleccionar"
                        >
                            <MousePointer2 className="h-4 w-4" />
                        </ToggleGroupItem>

                        <ToggleGroupItem
                            value       = "erase"
                            aria-label  = "Modo borrar"
                            className   = "gap-2 data-[state=on]:bg-accent"
                            title       = "Borrar"
                        >
                            <Eraser className="h-4 w-4" />
                        </ToggleGroupItem>
                    </ToggleGroup>
                )}
            </div>

			<div 
				className	= "border rounded-lg bg-background relative"
				style		= {{
					cursor		: multiple && isMouseDown 
						? ( selectionMode === 'select' ? 'crosshair' : 'not-allowed' )
						: 'default',
					userSelect	: multiple && isMouseDown ? 'none' : 'auto'
				}}
				onMouseLeave = {() => multiple && setIsMouseDown( false )}
			>
				{/* Header fijo */}
				<div className="sticky top-0 z-30 bg-background border-b">
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[7.85rem] px-3 border-r bg-background">
										Módulos
									</TableHead>

									{availableDays.map(( day ) => (
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
                <Table>
                    <TableBody>
                        {modulesWithDays.map(( module ) => (
                            <TableRow key={module.id}>
                                <TableCell
                                    className   = "sticky left-0 bg-background z-10 w-32 min-w-32 p-3 border-r shadow-md text-xs truncate"
                                    title       = { `${ module.name } ${ module.difference ?? '' } ${ module.startHour }-${ module.endHour }` }
                                >
                                    { module.name } { module.difference ?? '' } { module.startHour }-{ module.endHour }
                                </TableCell>

                                { availableDays.map( day => {
                                    // Verificar si este módulo está disponible en este día
                                    const isModuleAvailableOnDay    = module.days.includes( day.id );
                                    const sessionsInCell            = getSessionsForDayModule( day.id, module.id.toString() );
                                    const isSelected                = sessionsInCell.length > 0;
                                    const canSelect                 = enabled && currentSession && availableSessions.includes( currentSession );

                                    const colorMap: Record<Session, string> = {
                                        [Session.C]: '#3b82f6', // blue-500
                                        [Session.A]: '#22c55e', // green-500
                                        [Session.T]: '#f97316', // orange-500
                                        [Session.L]: '#a855f7', // purple-500
                                    };

                                    return (
                                        <TableCell
                                            key         = { `${ module.id }-${ day.id }` }
                                            className   = {`text-center w-20 min-w-20 p-0 transition-colors overflow-hidden ${
                                                isModuleAvailableOnDay 
                                                    ? ( canSelect ? 'hover:bg-zinc-200/50 dark:hover:bg-zinc-800 cursor-pointer' : 'cursor-not-allowed opacity-70' )
                                                    : 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-50'
                                            }`}
                                            onClick     = {() => {
                                                if ( !isModuleAvailableOnDay || !canSelect ) return;
                                                handleCellClick( day.id, module.id );
                                            }}
                                            onMouseDown = {() => {
                                                if ( !multiple || !isModuleAvailableOnDay || !canSelect ) return;
                                                setIsMouseDown( true );
                                                handleCellClick( day.id, module.id );
                                            }}
                                            onMouseEnter = {() => {
                                                if ( !multiple || !isModuleAvailableOnDay || !canSelect ) return;
                                                handleCellDrag( day.id, module.id );
                                            }}
                                        >
                                            { isModuleAvailableOnDay ? (
                                                isSelected ? (
                                                    <div className="flex h-full w-full">
                                                        { sessionsInCell.map(( session, index ) => (
                                                            <div
                                                                key         = { `${session}-${index}` }
                                                                className   = "flex items-center justify-center font-semibold text-white"
                                                                style       = {{
                                                                    backgroundColor : colorMap[session],
                                                                    width           : `${100 / sessionsInCell.length}%`,
                                                                    padding         : '0.5rem'
                                                                }}
                                                            >
                                                                { session }
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 p-2 block">—</span>
                                                )
                                            ) : (
                                                <span className="text-gray-400 p-2 block">—</span>
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
	);
}
