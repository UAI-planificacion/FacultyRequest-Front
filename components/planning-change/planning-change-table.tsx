"use client"

import { JSX }	from "react";

import {
	Languages,
	Moon,
	Repeat,
	Calendar,
	CircleDashed,
	Eye,
	BadgeCheck,
	OctagonX
}	from "lucide-react";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
}							from "@/components/ui/table";
import { Card }				from "@/components/ui/card";
import { ScrollArea }		from "@/components/ui/scroll-area";
import { Badge }			from "@/components/ui/badge";
import { ActionButton }		from "@/components/shared/action";
import { Skeleton }			from "@/components/ui/skeleton";
import { sessionLabels }	from "@/components/section/section.config";

import type {
    PlanningChange,
    PlanningChangeAll
}                           from "@/types/planning-change.model";
import { getStatusName }	from "@/lib/utils";
import { Status }			from "@/types/request";

/**
 * Obtiene el ícono correspondiente a cada estado
 */
function getStatusIcon( status: Status ): JSX.Element {
	const icons = {
		[Status.PENDING]	: <CircleDashed className="h-4 w-4" />,
		[Status.REVIEWING]	: <Eye className="h-4 w-4" />,
		[Status.APPROVED]	: <BadgeCheck className="h-4 w-4" />,
		[Status.REJECTED]	: <OctagonX className="h-4 w-4" />,
	};

	return icons[status] || <CircleDashed className="h-4 w-4" />;
}

/**
 * Obtiene las clases de color para cada estado
 */
function getStatusClasses( status: Status ): string {
	const classes = {
		[Status.PENDING]	: "bg-amber-400 dark:bg-amber-500 text-black dark:text-white border-amber-400 dark:border-amber-500",
		[Status.REVIEWING]	: "bg-blue-400 dark:bg-blue-500 text-black dark:text-white border-blue-400 dark:border-blue-500",
		[Status.APPROVED]	: "bg-green-400 dark:bg-green-500 text-black dark:text-white border-green-400 dark:border-green-500",
		[Status.REJECTED]	: "bg-red-400 dark:bg-red-500 text-black dark:text-white border-red-400 dark:border-red-500",
	};

	return classes[status] || "bg-gray-100";
}


interface PlanningChangeTableProps {
	planningChanges	: PlanningChangeAll[] | PlanningChange[];
	onEdit			: ( planningChange: PlanningChangeAll | PlanningChange ) => void;
	onDelete		: ( planningChange: PlanningChangeAll | PlanningChange ) => void;
	isLoading		: boolean;
	isError			: boolean;
}


export function PlanningChangeTable({
	planningChanges,
	onEdit,
	onDelete,
	isLoading,
	isError
}: PlanningChangeTableProps ): JSX.Element {
	/**
	 * Renderiza los badges de cambios para un planning change
	 */
	function renderChangeBadges( planningChange: PlanningChangeAll | PlanningChange ): JSX.Element[] {
		const badges: JSX.Element[] = [];

		// Tipo de sesión
		if ( planningChange.sessionName ) {
			badges.push(
				<Badge key="sessionName" variant="outline">
					{ sessionLabels[planningChange.sessionName] }
				</Badge>
			);
		}

		// Espacio
		if ( planningChange.spaceId ) {
			badges.push(
				<Badge key="spaceId" variant="outline">
					{ planningChange.spaceId }
				</Badge>
			);
		} else if ( planningChange.spaceType || planningChange.spaceSize ) {
			const spaceText = [
				planningChange.spaceType,
				planningChange.spaceSize
			].filter( Boolean ).join( ' ' );

			badges.push(
				<Badge key="space" variant="outline">
					{ spaceText }
				</Badge>
			);
		}

		// En Inglés
		if ( planningChange.isEnglish ) {
			badges.push(
				<Badge key="isEnglish" variant="outline" className="gap-1">
					<Languages className="h-3 w-3" />
					Inglés
				</Badge>
			);
		}

		// Consecutivo
		if ( planningChange.isConsecutive ) {
			badges.push(
				<Badge key="isConsecutive" variant="outline" className="gap-1">
					<Repeat className="h-3 w-3" />
					Consecutivo
				</Badge>
			);
		}

		// En Tarde
		if ( planningChange.inAfternoon ) {
			badges.push(
				<Badge key="inAfternoon" variant="outline" className="gap-1">
					<Moon className="h-3 w-3" />
					En Tarde
				</Badge>
			);
		}

		// Profesor
		if ( planningChange.professor ) {
			badges.push(
				<Badge
					key			= "professor"
					variant		= "outline"
					title		= { `${planningChange.professor.id} - ${planningChange.professor.name}` }
				>
					{ planningChange.professor.name }
				</Badge>
			);
		}

		// Módulos
		if ( planningChange.dayModulesId && planningChange.dayModulesId.length > 0 ) {
			const moduleText = planningChange.dayModulesId.length === 1
				? '1 módulo'
				: `${planningChange.dayModulesId.length} módulos`;

			badges.push(
				<Badge key="dayModules" variant="outline" className="gap-1">
					<Calendar className="h-3 w-3" />
					{ moduleText }
				</Badge>
			);
		}

		return badges;
	}

	/**
	 * Determina el tipo de plan (Crear o Editar)
	 */
	function getPlanType( planningChange: PlanningChangeAll | PlanningChange ): string {
		// Para PlanningChangeAll
		if ( 'session' in planningChange ) {
			if ( planningChange.session && !planningChange.section ) {
				return 'Editar';
			}

			if ( planningChange.section && !planningChange.session ) {
				return 'Crear';
			}
		}
		// Para PlanningChange (legacy)
		else {
			if ( planningChange.sessionId && !planningChange.sectionId ) {
				return 'Editar';
			}

			if ( planningChange.sectionId && !planningChange.sessionId ) {
				return 'Crear';
			}
		}

		return '-';
	}


    if ( isLoading ) {
		return (
			<Card>
				<ScrollArea className="h-[600px]">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Título</TableHead>
								<TableHead>Estado</TableHead>
								<TableHead>Cambios</TableHead>
								<TableHead>Planificación</TableHead>
								<TableHead className="text-right">Acciones</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{ Array.from({ length: 5 }).map(( _, index ) => (
								<TableRow key={ index }>
									<TableCell><Skeleton className="h-4 w-48" /></TableCell>
									<TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
									<TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
									<TableCell>
										<div className="flex gap-2">
											<Skeleton className="h-6 w-20 rounded-full" />
											<Skeleton className="h-6 w-20 rounded-full" />
											<Skeleton className="h-6 w-20 rounded-full" />
										</div>
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Skeleton className="h-8 w-8 rounded" />
											<Skeleton className="h-8 w-8 rounded" />
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</ScrollArea>
			</Card>
		);
	}


	if ( isError ) {
		return (
			<Card className="p-8">
				<div className="text-center text-muted-foreground">
					<p>Error al cargar los cambios de planificación</p>
				</div>
			</Card>
		);
	}


	if ( planningChanges.length === 0 ) {
		return (
			<Card className="p-8">
				<div className="text-center text-muted-foreground">
					<p>No se encontraron cambios de planificación</p>
				</div>
			</Card>
		);
	}


	return (
		<Card>
			<ScrollArea className="h-[600px]">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Título</TableHead>
							<TableHead>Estado</TableHead>
							<TableHead>Cambios</TableHead>
							<TableHead>Planificación</TableHead>
							<TableHead className="text-right">Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{ planningChanges.map(( planningChange ) => {
							const planType = getPlanType( planningChange );
							const changeBadges = renderChangeBadges( planningChange );

							return (
								<TableRow key={ planningChange.id }>
									<TableCell className="font-medium">
										{ planningChange.title }
									</TableCell>

									<TableCell>
										<Badge className={ `gap-2 ${getStatusClasses( planningChange.status )}` }>
											{ getStatusIcon( planningChange.status )}
											{ getStatusName( planningChange.status )}
										</Badge>
									</TableCell>

									<TableCell>
										<div className="flex flex-wrap gap-2">
											{ changeBadges.length > 0 ? changeBadges : '-' }
										</div>
									</TableCell>

                                    <TableCell>
										<Badge
                                            className={ planType === 'Crear' ? 'text-white bg-green-500 hover:bg-green-600' : 'text-white bg-blue-500 hover:bg-blue-600' }
                                        >
											{ planType }
										</Badge>
									</TableCell>

									<TableCell className="text-right">
										<ActionButton
											editItem	= { onEdit }
											deleteItem	= { onDelete }
											item		= { planningChange }
										/>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</ScrollArea>
		</Card>
	);
}
