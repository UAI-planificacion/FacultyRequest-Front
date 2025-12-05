"use client"

import { JSX, useCallback } from "react";

import { Edit } from "lucide-react";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
}								from "@/components/ui/table";
import { Card, CardContent }	from "@/components/ui/card";
import { ScrollArea }			from "@/components/ui/scroll-area";
import { Badge }				from "@/components/ui/badge";
import { Skeleton }				from "@/components/ui/skeleton";
import { Button }               from "@/components/ui/button";

import type { RequestSession }	from "@/types/request-session.model";
import { Session }				from "@/types/section.model";
import { getSpaceType }			from "@/lib/utils";


interface Props {
	data		: RequestSession[] | undefined;
	isLoading	: boolean;
	onEdit		: ( requestSession: RequestSession ) => void;
}


const sessionLabels: Record<Session, string> = {
	[Session.C]	: 'Cátedra',
	[Session.A]	: 'Ayudantía',
	[Session.T]	: 'Taller',
	[Session.L]	: 'Laboratorio',
};


const sessionColors: Record<Session, string> = {
	[Session.C]	: 'bg-blue-500',
	[Session.A]	: 'bg-green-500',
	[Session.T]	: 'bg-orange-500',
	[Session.L]	: 'bg-purple-500',
};


function TableRowSkeleton() {
	return (
		<TableRow>
			<TableCell><Skeleton className="h-4 w-16" /></TableCell>
			<TableCell><Skeleton className="h-4 w-24" /></TableCell>
			<TableCell><Skeleton className="h-4 w-20" /></TableCell>
			<TableCell><Skeleton className="h-6 w-12" /></TableCell>
			<TableCell><Skeleton className="h-6 w-12" /></TableCell>
			<TableCell><Skeleton className="h-6 w-12" /></TableCell>
			<TableCell><Skeleton className="h-4 w-32" /></TableCell>
			<TableCell>
				<div className="flex gap-2">
					<Skeleton className="h-8 w-8" />
				</div>
			</TableCell>
		</TableRow>
	);
}


export function RequestSessionTable({
	data,
	isLoading,
	onEdit,
}: Props ): JSX.Element {
	const getSpaceDisplay = useCallback(( requestSession: RequestSession ): string => {
		if ( requestSession.spaceId )   return requestSession.spaceId;
		if ( requestSession.spaceType ) return getSpaceType( requestSession.spaceType ) || requestSession.spaceType;
		if ( requestSession.spaceSize ) return `${requestSession.spaceSize.id} ${requestSession.spaceSize.detail}`;

		return "-";
	}, []);


	return (
		<Card>
			<CardContent className="p-0">
				{/* <ScrollArea className="h-[calc(100vh-1300px)]"> */}
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Sesión</TableHead>
								<TableHead>Profesor</TableHead>
								<TableHead>Espacio</TableHead>
								<TableHead>Inglés</TableHead>
								<TableHead>Consecutivo</TableHead>
								<TableHead>Tarde</TableHead>
								<TableHead>Descripción</TableHead>
								<TableHead className="text-right">Acciones</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{isLoading ? (
								Array.from({ length: 5 }).map(( _, index ) => (
									<TableRowSkeleton key={`skeleton-${index}`} />
								))
							) : data && data.length > 0 ? (
								data.map(( requestSession ) => (
									<TableRow key={ requestSession.id }>
										<TableCell className="font-medium">
                                            <Badge 
                                                className	= {`${sessionColors[requestSession.session]} text-white`}
                                                variant		= "default"
                                            >
                                                { sessionLabels[requestSession.session] }
                                            </Badge>
										</TableCell>

										<TableCell>
											{ requestSession.professor?.name || "-" }
										</TableCell>

										<TableCell>
											{ getSpaceDisplay( requestSession ) }
										</TableCell>

										<TableCell>
											<Badge variant={ requestSession.isEnglish ? "default" : "secondary" }>
												{ requestSession.isEnglish ? "Sí" : "No" }
											</Badge>
										</TableCell>

										<TableCell>
											<Badge variant={ requestSession.isConsecutive ? "default" : "secondary" }>
												{ requestSession.isConsecutive ? "Sí" : "No" }
											</Badge>
										</TableCell>

										<TableCell>
											<Badge variant={ requestSession.inAfternoon ? "default" : "secondary" }>
												{ requestSession.inAfternoon ? "Sí" : "No" }
											</Badge>
										</TableCell>

										<TableCell>
											<div className="max-w-xs truncate">
												{ requestSession.description || "-" }
											</div>
										</TableCell>

										<TableCell className="text-right">
                                            <Button
                                                title       = "Editar"
                                                variant     = "outline"
                                                size        = "icon"
                                                onClick     = {() => onEdit( requestSession )}
                                            >
                                                <Edit className="h-4 w-4 text-blue-500" />
                                            </Button>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={ 8 } className="text-center py-8">
										<p className="text-muted-foreground">No hay sesiones para esta solicitud.</p>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				{/* </ScrollArea> */}
			</CardContent>
		</Card>
	);
}
