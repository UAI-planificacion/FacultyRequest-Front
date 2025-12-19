"use client"

import { Album, BrushCleaning, Plus, Search } from "lucide-react";

import { Button }           from "@/components/ui/button";
import { Input }            from "@/components/ui/input";
import { Label }            from "@/components/ui/label";
import { Card, CardHeader } from "@/components/ui/card";
import { SpaceTypeSelect }  from "@/components/shared/item-select/space-type-select";
import { SizeSelect }       from "@/components/shared/item-select/size-select";


interface SubjectFilterProps {
	searchQuery			: string;
	selectedSpaceTypes  : string[];
	selectedSizes		: string[];
	onSearchChange		: ( value: string ) => void;
	onSpaceTypeChange	: ( value: string | string[] | undefined ) => void;
	onSizeChange		: ( value: string | string[] | undefined ) => void;
	onClearFilters		: () => void;
	onNewSubject		: () => void;
	// onOfferSubjects			: () => void;
	showOfferButton?	: boolean;
}


export function SubjectFilter({
	searchQuery,
	selectedSpaceTypes,
	selectedSizes,
	onSearchChange,
	onSpaceTypeChange,
	onSizeChange,
	onClearFilters,
	onNewSubject,
	// onOfferSubjects,
	showOfferButton = true
}: SubjectFilterProps ) {
	return (
		<Card>
			<CardHeader>
				<div className="lg:flex lg:justify-between items-end gap-4 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl items-center">
						{/* Búsqueda */}
						<div className="grid space-y-2">
							<Label htmlFor="search">Buscar</Label>

							<div className="relative flex items-center">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />

								<Input
									id			= "search"
									type		= "search"
									placeholder	= "Buscar por sigla o nombre..."
									value		= { searchQuery }
									className	= "pl-8"
									onChange	= {( e ) => onSearchChange( e.target.value )}
								/>
							</div>
						</div>

						{/* Tipo de Espacio */}
						<SpaceTypeSelect
							label				= "Tipo de Espacio"
							placeholder			= "Seleccionar tipos de espacio"
							onSelectionChange	= { onSpaceTypeChange }
							defaultValues		= { selectedSpaceTypes }
							multiple			= { true }
							className			= "grid"
						/>

						{/* Tamaño */}
						<SizeSelect
							label				= "Tamaño del Espacio"
							placeholder			= "Seleccionar tamaños"
							onSelectionChange	= { onSizeChange }
							defaultValues		= { selectedSizes }
							multiple			= { true }
							className			= "grid"
						/>

						{/* Limpiar filtros */}
						<div className="grid space-y-2">
							<Label className="text-transparent">Acciones</Label>

							<Button
								variant	= "outline"
								type	= "button"
								size	= "icon"
								onClick	= { onClearFilters }
							>
								<BrushCleaning className="h-4 w-4" />
							</Button>
						</div>
					</div>

					{/* Botones de acción */}
					{/* <div className="flex items-center gap-4"> */}
						{/* { showOfferButton && (
							<Button
								onClick		= { onOfferSubjects }
								className	= "flex items-center gap-1.5"
							>
								<Album className="h-4 w-4" />
								Ofertar Asignaturas
							</Button>
						)} */}

                        { showOfferButton && (
                            <Button
                                onClick		= { onNewSubject }
                                className	= "flex items-center gap-1 w-full lg:w-40"
                            >
                                <Plus className="h-4 w-4" />
                                Crear Asignatura
                            </Button>
                        )}
					{/* </div> */}
				</div>
			</CardHeader>
		</Card>
	);
}
