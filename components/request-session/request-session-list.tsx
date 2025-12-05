"use client"

import { JSX } from "react";

import { Card, CardContent }				from "@/components/ui/card";
import { RequestSessionCard }				from "@/components/request-session/request-session-card";
import { RequestSessionCardSkeleton }		from "@/components/request-session/request-session-card-skeleton";

import type { RequestSession }	from "@/types/request-session.model";


interface Props {
	data		: RequestSession[] | undefined;
	isLoading	: boolean;
	onEdit		: ( requestSession: RequestSession ) => void;
}


export function RequestSessionList({
	data,
	isLoading,
	onEdit,
}: Props ): JSX.Element {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
			{isLoading ? (
				Array.from({ length: 3 }).map(( _, index ) => (
					<RequestSessionCardSkeleton key={`skeleton-${index}`} />
				))
			) : (
				data?.map( requestSession => (
					<RequestSessionCard
						key				= { requestSession.id }
						requestSession	= { requestSession }
						onEdit			= { onEdit }
					/>
				))
			)}

			{!isLoading && data?.length === 0 && (
				<div className="col-span-full">
					<Card>
						<CardContent className="text-center py-8">
							<p className="text-muted-foreground">No hay sesiones para esta solicitud.</p>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
