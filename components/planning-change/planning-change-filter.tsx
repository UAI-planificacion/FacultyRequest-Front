"use client"

import { JSX }	from "react";

import { Card, CardHeader }	from "@/components/ui/card";
import { Label }			from "@/components/ui/label";
import { ChangeStatus }		from "@/components/shared/change-status";
import { SectionSelect }	from "@/components/shared/item-select/section-select";
import { SearchInput }		from "@/components/shared/Search-input";
import { ViewMode }			from "@/components/shared/view-mode";

import { type ViewMode as ViewModeType }	from "@/hooks/use-view-mode";
import { KEY_QUERYS }	                    from "@/consts/key-queries";
import { type Status }	                    from "@/types/request";


interface Props {
	title				: string;
	setTitle			: ( value: string ) => void;
	statusFilter		: Status[];
	setStatusFilter		: ( value: Status[] ) => void;
	sectionFilter		: string[];
	setSectionFilter	: ( value: string[] ) => void;
	viewMode			: ViewModeType;
	onViewChange		: ( mode: ViewModeType ) => void;
	onNewPlanningChange	: () => void;
}


export function PlanningChangeFilter({
	title,
	setTitle,
	statusFilter,
	setStatusFilter,
	sectionFilter,
	setSectionFilter,
	viewMode,
	onViewChange,
	// onNewPlanningChange
}: Props ): JSX.Element {
	return (
		<Card>
			<CardHeader className="p-6">
				<div className="space-y-4">
					{/* Header con botón de crear */}
					{/* <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<h2 className="text-xl font-semibold">Cambios de Planificación</h2>
						<Button onClick={ onNewPlanningChange } size="sm">
							<Plus className="mr-2 h-4 w-4" />
							Crear Cambio
						</Button>
					</div> */}

					{/* Filtros */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{/* Buscar por título */}
						<SearchInput
							label		= "Buscar por Título"
							title		= { title }
							setTitle	= { setTitle }
						/>

						{/* Filtro por estado */}
						<div className="grid space-y-2">
							<Label>Estado</Label>

							<ChangeStatus
								multiple		= { true }
								value			= { statusFilter }
								onValueChange	= { setStatusFilter }
							/>
						</div>

						{/* Filtro por sección + ViewMode */}
						<div className="grid space-y-2">
							<div className="flex items-end justify-between gap-4">
								<div className="flex-1">
									<SectionSelect
										label				= "Sección"
										multiple			= { true }
										defaultValues		= { sectionFilter }
										onSelectionChange	= {( value ) => setSectionFilter(( value as string[] ) || [])}
										placeholder			= "Seleccionar secciones"
										queryKey			= {[ KEY_QUERYS.SECTIONS ]}
										url					= { KEY_QUERYS.SECTIONS }
									/>
								</div>

								<ViewMode
									viewMode		= { viewMode }
									onViewChange	= { onViewChange }
								/>
							</div>
						</div>
					</div>
				</div>
			</CardHeader>
		</Card>
	);
}
