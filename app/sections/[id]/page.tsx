'use client'

import { useState }             from "react";
import { useParams, useRouter } from "next/navigation";

import { useQuery }             from "@tanstack/react-query";
import { ArrowLeft, Search }    from "lucide-react";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
}                           from "@/components/ui/select";
import {
	Card,
	CardContent,
}                           from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
}                           from "@/components/ui/table";
import { DataPagination }   from "@/components/ui/data-pagination";
import { ScrollArea }       from "@/components/ui/scroll-area"
import { Input }            from "@/components/ui/input";
import { Label }	        from "@/components/ui/label";
import { Badge }	        from "@/components/ui/badge";
import { Skeleton }	        from "@/components/ui/skeleton";
import { Button }           from "@/components/ui/button";

import { Section }          from "@/types/section.model";
import { KEY_QUERYS }       from "@/consts/key-queries";
import { fetchApi }         from "@/services/fetch";
import { ENV }              from "@/config/envs/env";
import { usePagination }    from "@/hooks/use-pagination";


type SizeFilter = 'XS' | 'XE' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'all';


const days = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
];


export default function SectionsPage() {
    const params                        = useParams();
    const subjectId                     = params.id as string;
	const [searchQuery, setSearchQuery] = useState( '' );
	const [sizeFilter, setSizeFilter]   = useState<SizeFilter>( 'all' );
	const url                           = `${ENV.ACADEMIC_SECTION}Sections/subjectId/${subjectId}`;
    const router                        = useRouter();

    const {
        data: sectionsList,
        isLoading,
        isError
    } = useQuery({
		queryKey    : [ KEY_QUERYS.SECTIONS, subjectId ],
		queryFn     : () => fetchApi<Section[]>({ url, isApi: false }),
        enabled     : !!subjectId
	});


	/**
	 * Filtra la lista de secciones según los criterios de búsqueda
	 */
	const filteredSections = sectionsList?.filter( section => {
		const getStringValue = ( value: any ): string => {
			if ( typeof value === 'object' && value !== null ) {
				return (( value as any ).name || JSON.stringify( value )).toLowerCase();
			}

            return String( value || '' ).toLowerCase();
		};

		const matchesSearch = searchQuery === ''
            || getStringValue( section.code ).includes( searchQuery.toLowerCase() )
            // || getStringValue( section.professorName ).includes( searchQuery.toLowerCase() )
            || getStringValue( section.room ).includes( searchQuery.toLowerCase() )
            || getStringValue( section.session ).includes( searchQuery.toLowerCase() );

		const sectionSize = typeof section.size === 'object' && section.size && 'name' in section.size 
			? ( section.size as any ).name 
			: section.size;

        const matchesSize = sizeFilter === 'all' || sectionSize === sizeFilter;

		return matchesSearch && matchesSize;
	}) || [];


	/**
	 * Hook de paginación
	 */
	const {
		currentPage,
		itemsPerPage,
		totalPages,
		paginatedData: paginatedSections,
		setCurrentPage,
		setItemsPerPage,
		resetToFirstPage
	} = usePagination({
		data                : filteredSections,
		initialItemsPerPage : 10
	});


	/**
	 * Resetea la página actual cuando cambian los filtros
	 */
	const handleFilterChange = ( filterType: 'search' | 'size', value: string ) => {
		resetToFirstPage();

		switch ( filterType ) {
			case 'search':
				setSearchQuery( value );
			break;

            case 'size':
				setSizeFilter( value as SizeFilter );
			break;
		}
	};

	if ( isLoading ) {
		return (
			<main className="container mx-auto p-6 space-y-6 min-h-[calc(100vh-74px)]">
				<div className="space-y-4">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-96 w-full" />
				</div>
			</main>
		);
	}

	if ( isError ) {
		return (
			<main className="container mx-auto p-6 space-y-6 min-h-[calc(100vh-74px)]">
				<div className="text-center py-8">
					<p className="text-muted-foreground">Error al cargar las secciones</p>
				</div>
			</main>
		);
	}

	return (
		<main className="container mx-auto p-6 space-y-6 min-h-[calc(100vh-74px)]">
			<header className="flex justify-start gap-4 items-center">
                <Button
                    onClick = { () => router.back() }
                    size    = "icon"
                    variant = "secondary"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>

				<h1 className="text-3xl font-bold">Secciones de la Asignatura { subjectId }</h1>
			</header>

			{/* Filtros */}
			<Card>
				<CardContent className="space-y-4 mt-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="search">Buscar</Label>

							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />

								<Input
									id          = "search"
									placeholder = "Buscar por código, profesor, sala o sesión..."
									value       = { searchQuery }
									onChange    = { (e) => handleFilterChange( 'search', e.target.value ) }
									className   = "pl-10"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="size-filter">Tamaño de Sección</Label>

							<Select value={ sizeFilter } onValueChange={ (value) => handleFilterChange( 'size', value ) }>
								<SelectTrigger id="size-filter">
									<SelectValue placeholder="Seleccionar tamaño" />
								</SelectTrigger>

								<SelectContent>
									<SelectItem value="all">Todos</SelectItem>
									<SelectItem value="XS">XS</SelectItem>
									<SelectItem value="XE">XE</SelectItem>
									<SelectItem value="S">S</SelectItem>
									<SelectItem value="M">M</SelectItem>
									<SelectItem value="L">L</SelectItem>
									<SelectItem value="XL">XL</SelectItem>
									<SelectItem value="XXL">XXL</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tabla de secciones */}
            <div className="space-y-4">
                <Card>
                    <CardContent className="mt-5">
                        { sectionsList?.length === 0 && !isLoading && !isError ? (
                            <div className="text-center p-8 text-muted-foreground">
                                No se han encontrado secciones.
                            </div>
                        ) : (
                            <div>
                                <Table>
                                    <TableHeader className="sticky top-0 z-10 bg-background">
                                        <TableRow>
                                            <TableHead className="bg-background w-20">Código</TableHead>
                                            <TableHead className="bg-background w-28">Sala</TableHead>
                                            <TableHead className="bg-background w-28">Día</TableHead>
                                            <TableHead className="bg-background w-24">Módulo</TableHead>
                                            <TableHead className="bg-background w-32">Período</TableHead>
                                            <TableHead className="bg-background w-40">Profesor</TableHead>
                                            <TableHead className="bg-background w-24">Sesión</TableHead>
                                            <TableHead className="bg-background w-20">Tamaño</TableHead>
                                            <TableHead className="bg-background w-28">Registrados Corregidos</TableHead>
                                            <TableHead className="bg-background w-28">Registrados Reales</TableHead>
                                            <TableHead className="bg-background w-32">Edificio Planificado</TableHead>
                                            <TableHead className="bg-background w-28">Sillas Disponibles</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                </Table>

                                { isError ? (
                                    <div className="text-center p-8 text-muted-foreground flex gap-2 items-center">
                                        <Button
                                            onClick={ () => router.back() }
                                            variant="outline"
                                            size="icon"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                        </Button>

                                        <h2>Error al cargar las secciones</h2>
                                    </div>
                                ) 
                                : (
                                    <ScrollArea className="h-[calc(100vh-500px)]">
                                        <Table>
                                            <TableBody>
                                                {isLoading
                                                ? (
                                                    Array.from({ length: 10 }).map((_, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                                            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                                        </TableRow>
                                                    ))
                                                )
                                                : (
                                                    paginatedSections.map( section => (
                                                        <TableRow key={ section.id }>
                                                            <TableCell className="font-medium w-20">
                                                                { section.code }
                                                            </TableCell>

                                                            <TableCell className="w-28">
                                                                { section.room }
                                                            </TableCell>

                                                            <TableCell className="w-28">
                                                                {/* { days[section.day - 1] } */}
                                                            </TableCell>

                                                            <TableCell className="w-24">
                                                                {/* M{ section.moduleId } */}
                                                                M
                                                            </TableCell>

                                                            <TableCell className="whitespace-nowrap w-32">
                                                                {/* { section.period } */}
                                                                p
                                                            </TableCell>

                                                            <TableCell
                                                                className   = "truncate w-40"
                                                                // title       = { section.professorName }
                                                            >
                                                                {/* { section.professorName } */}
                                                                Name
                                                            </TableCell>

                                                            <TableCell className="w-24">
                                                                { section.session }
                                                            </TableCell>

                                                            <TableCell className="w-20 text-center">
                                                                <Badge variant="outline">
                                                                    { section.size }
                                                                </Badge>
                                                            </TableCell>

                                                            <TableCell className="w-28 text-end">
                                                                { section.correctedRegistrants }
                                                            </TableCell>

                                                            <TableCell className="w-28 text-end">
                                                                { section.realRegistrants }
                                                            </TableCell>

                                                            <TableCell
                                                                className   = "truncate w-32"
                                                                title       = { section.plannedBuilding || '' }
                                                            >
                                                                { section.plannedBuilding }
                                                            </TableCell>

                                                            <TableCell className="w-28 text-end">
                                                                { section.chairsAvailable }
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}

                                                { filteredSections.length === 0 && searchQuery ? (
                                                    <TableRow>
                                                        <TableCell colSpan={ 12 } className="h-24 text-center">
                                                            No se encontraron resultados para &quot;{ searchQuery }&quot;
                                                        </TableCell>
                                                    </TableRow>
                                                ) : sectionsList?.length === 0 && !searchQuery ? (
                                                    <TableRow>
                                                        <TableCell colSpan={ 12 } className="h-24 text-center">
                                                            No hay secciones registradas
                                                        </TableCell>
                                                    </TableRow>
                                                ) : null }
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                ) }
                            </div>
                        ) }
                    </CardContent>
                </Card>

                {/* Paginación */}
                <DataPagination
                    currentPage             = { currentPage }
                    totalPages              = { totalPages }
                    totalItems              = { filteredSections.length }
                    itemsPerPage            = { itemsPerPage }
                    onPageChange            = { setCurrentPage }
                    onItemsPerPageChange    = { setItemsPerPage }
                />
            </div>
		</main>
	);
}
