'use client'

import { JSX } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlanningChangeCard } from "@/components/planning-change/planning-change-card";

import { type PlanningChangeAll } from "@/types/planning-change.model";


interface PlanningChangeListProps {
	planningChanges	: PlanningChangeAll[];
	onEdit			: ( planningChange: PlanningChangeAll ) => void;
	onDelete		: ( planningChange: PlanningChangeAll ) => void;
	isLoading		: boolean;
	isError			: boolean;
}


export function PlanningChangeList({
	planningChanges,
	onEdit,
	onDelete,
	isLoading,
	isError
}: PlanningChangeListProps ): JSX.Element {

	if ( isLoading ) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{Array.from({ length: 6 }).map(( _, index ) => (
					<Card key={ index }>
						<CardContent className="p-6 space-y-3">
							<Skeleton className="h-6 w-3/4" />
							<Skeleton className="h-4 w-1/2" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-2/3" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if ( isError ) {
		return (
			<Card>
				<CardContent className="text-center py-8">
					<p className="text-destructive">Error al cargar los planes de cambio.</p>
				</CardContent>
			</Card>
		);
	}

	if ( planningChanges.length === 0 ) {
		return (
			<Card>
				<CardContent className="text-center py-8">
					<p className="text-muted-foreground">No se encontraron planes de cambio.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{planningChanges.map( planningChange => (
				<PlanningChangeCard
					planningChange	= { planningChange }
					key				= { planningChange.id }
					onEdit			= { () => onEdit( planningChange )}
					onDelete		= { () => onDelete( planningChange )}
				/>
			))}
		</div>
	);
}
