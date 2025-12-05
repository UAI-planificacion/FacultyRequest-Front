'use client'

import { JSX } from "react";

import {
	User,
	Languages,
	Link2,
	Sun,
	Cuboid,
	Proportions,
	Armchair,
	FileText,
    Edit,
} from "lucide-react"

import {
	Card,
	CardContent,
	CardHeader,
}					from "@/components/ui/card";
import { Badge }	from "@/components/ui/badge";
import { Button }   from "@/components/ui/button";

import { RequestSession }	from "@/types/request-session.model";
import { Session }			from "@/types/section.model";
import { getSpaceType }		from "@/lib/utils";


export interface Props {
	requestSession	: RequestSession;
	onEdit			: ( requestSession: RequestSession ) => void;
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


export function RequestSessionCard({
	requestSession,
	onEdit,
}: Props ): JSX.Element {
	return (
		<Card className="relative">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
                    <Badge 
                        className	= {`${sessionColors[requestSession.session]} text-white`}
                        variant		= "default"
                    >
                        { sessionLabels[requestSession.session] }
                    </Badge>

                    <Button
                        title       = "Editar"
                        variant     = "outline"
                        size        = "icon"
                        onClick     = {() => onEdit(requestSession)}
                    >
                        <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
				</div>
			</CardHeader>

			<CardContent className="space-y-3">
				<div className="flex flex-wrap items-center gap-1.5 text-sm">
					{requestSession.professor && (
						<div className="flex items-center gap-1" title="Profesor">
							<User className="h-4 w-4 text-muted-foreground" />

							<span>{ requestSession.professor.name }</span>
						</div>
					)}

					{requestSession.spaceId && (
						<div className="flex items-center gap-1" title="Espacio">
							<Cuboid className="h-4 w-4 text-muted-foreground" />

							<span>{ requestSession.spaceId }</span>
						</div>
					)}

					{requestSession.spaceType && (
						<div className="flex items-center gap-1" title="Tipo de espacio">
							<Armchair className="h-4 w-4 text-muted-foreground" />

							<span>{ getSpaceType( requestSession.spaceType )}</span>
						</div>
					)}

					{requestSession.spaceSize && (
						<div className="flex items-center gap-1" title="Tamaño del espacio">
							<Proportions className="h-4 w-4 text-muted-foreground" />

							<span>{ requestSession.spaceSize.id } {requestSession.spaceSize.detail}</span>
						</div>
					)}
				</div>

				<div className="flex flex-wrap gap-2">
					{requestSession.isEnglish && (
						<Badge variant="default" className="text-xs">
							<Languages className="h-3 w-3 mr-1" />
							Inglés
						</Badge>
					)}

					{requestSession.isConsecutive && (
						<Badge variant="default" className="text-xs">
							<Link2 className="h-3 w-3 mr-1" />
							Consecutivo
						</Badge>
					)}

					{requestSession.inAfternoon && (
						<Badge variant="default" className="text-xs">
							<Sun className="h-3 w-3 mr-1" />
							Tarde
						</Badge>
					)}
				</div>

				{requestSession.description && (
					<div className="space-y-1">
						<p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
							<FileText className="h-3 w-3" />
							Descripción:
						</p>

						<p className="text-xs text-muted-foreground break-words">
							{ requestSession.description }
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
