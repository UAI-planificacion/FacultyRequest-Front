'use client'

import { JSX } from "react";

import {
	Calendar,
	User,
	FileText,
	BookOpen,
	Languages,
	Moon,
	Repeat
} from "lucide-react";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShowStatus } from "@/components/shared/status";
import { ActionButton } from "@/components/shared/action";

import type {
	PlanningChange,
	PlanningChangeAll
} from "@/types/planning-change.model";
import { sessionLabels } from "@/components/section/section.config";
import { tempoFormat } from "@/lib/utils";


export interface Props {
	planningChange	: PlanningChangeAll | PlanningChange;
	onEdit			: ( planningChange: PlanningChangeAll | PlanningChange ) => void;
	onDelete		: ( planningChange: PlanningChangeAll | PlanningChange ) => void;
}


export function PlanningChangeCard({
	planningChange,
	onEdit,
	onDelete
}: Props ): JSX.Element {
	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader className="pb-3">
				<div className="space-y-2">
					<CardTitle className="text-md font-medium max-w-full">
						{ planningChange.title }
						<p className="text-[11px] text-muted-foreground">{ planningChange.id }</p>
					</CardTitle>

					<div className="flex items-center gap-2">
						<ShowStatus status={ planningChange.status } />
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-3">
				<div className="space-y-2 text-sm">
					{/* Sección */}
					{ 'section' in planningChange && planningChange.section && (
						<div className="flex items-center gap-1.5">
							<BookOpen className="h-4 w-4" />

							<span className="font-medium max-w-full truncate overflow-hidden whitespace-nowrap">
								{ planningChange.section.subject.name } - { planningChange.section.code }
							</span>
						</div>
					)}

					{/* Tipo de Sesión */}
					{ planningChange.sessionName && (
						<div className="flex items-center gap-1.5">
							<FileText className="h-4 w-4" />

							<span className="max-w-full truncate overflow-hidden whitespace-nowrap">
								{ sessionLabels[planningChange.sessionName] }
							</span>
						</div>
					)}

					{/* Creado por */}
					{ 'staffCreate' in planningChange && planningChange.staffCreate && (
						<div className="flex items-center gap-1.5">
							<User className="h-4 w-4" />

							<span className="max-w-full truncate overflow-hidden whitespace-nowrap">
								{ planningChange.staffCreate.name }
							</span>
						</div>
					)}

					{/* Fecha de creación */}
					<div className="flex items-center gap-1.5">
						<Calendar className="h-4 w-4" />

						<span className="max-w-full truncate overflow-hidden whitespace-nowrap">
							{ tempoFormat( planningChange.createdAt )}
						</span>
					</div>

					{/* Badges de características */}
					<div className="flex gap-1.5 flex-wrap mt-2">
						{ planningChange.isEnglish && (
							<Badge variant="outline" className="text-xs">
								<Languages className="h-3 w-3 mr-1" />
								Inglés
							</Badge>
						)}

						{ planningChange.inAfternoon && (
							<Badge variant="outline" className="text-xs">
								<Moon className="h-3 w-3 mr-1" />
								Tarde
							</Badge>
						)}

						{ planningChange.isConsecutive && (
							<Badge variant="outline" className="text-xs">
								<Repeat className="h-3 w-3 mr-1" />
								Consecutivo
							</Badge>
						)}
					</div>
				</div>

				{/* Acciones */}
				<div className="pt-2">
					<ActionButton
						editItem	= { onEdit }
						deleteItem	= { onDelete }
						item		= { planningChange }
					/>
				</div>
			</CardContent>
		</Card>
	);
}
