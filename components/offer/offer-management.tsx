"use client"

import { JSX, useState }    from "react";
import { useRouter }        from 'next/navigation';


import {
    useMutation,
    useQuery,
    useQueryClient
}                                   from "@tanstack/react-query";
import { Eye, Grid2x2, Plus, Search }    from "lucide-react";
import { toast }                    from "sonner";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
}                               from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
}                               from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
}                               from "@/components/ui/table"
// import {
//     OfferForm,
//     updateSubjectOffersCount
// }                               from "@/components/offer/offer-form"
import { DataPagination }       from "@/components/ui/data-pagination";
import { Button }               from "@/components/ui/button"
import { ScrollArea }           from "@/components/ui/scroll-area"
import { ActionButton }         from "@/components/shared/action";
import { Input }                from "@/components/ui/input";
import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog";
import { Label }                from "@/components/ui/label";
import { Badge }                from "@/components/ui/badge";
import { Skeleton }             from "@/components/ui/skeleton";
import { SessionShort }         from "@/components/section/session-short";
import { SpaceSizeType }        from "@/components/shared/space-size-type";

import { Offer }                    from "@/types/offer.model";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { Method, fetchApi }         from "@/services/fetch";
import { errorToast, successToast } from "@/config/toast/toast.config";
import { usePagination }            from "@/hooks/use-pagination";
import { OfferForm } from "./offer-form";
// import { updateFacultyTotal } from "@/app/faculties/page";


interface OfferManagementProps {
    facultyId   : string;
    enabled     : boolean;
}


export function OfferManagement({
    facultyId,
    enabled
}: OfferManagementProps ): JSX.Element {
    const router                                        = useRouter();
    const queryClient                                   = useQueryClient();
    const [searchQuery, setSearchQuery]                 = useState( '' );
    const [buildingFilter, setBuildingFilter]           = useState<string>( 'all' );
    const [englishFilter, setEnglishFilter]             = useState<string>( 'all' );
    const [isFormOpen, setIsFormOpen]                   = useState( false );
    const [editingOffer, setEditingOffer]               = useState<Offer | undefined>( undefined );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen]   = useState( false );
    const [deletingOfferId, setDeletingOfferId]         = useState<string | undefined>( undefined );

    // Fetch offers
    const {
        data: offerList,
        isLoading,
        isError
    } = useQuery({
        queryKey    : [ KEY_QUERYS.OFFERS, facultyId ],
        queryFn     : () => fetchApi<Offer[]>({ url: `offers/facultyId/${facultyId}` }),
        enabled
    });


    const filteredOffers = offerList?.filter( offer => {
        const subjectName = offer.subject.name;
        const matchesSearch = searchQuery === ''
            || subjectName.toLowerCase().includes( searchQuery.toLowerCase() )
            || offer.building?.toLowerCase().includes( searchQuery.toLowerCase() )
            || offer.spaceType?.toLowerCase().includes( searchQuery.toLowerCase() );

        const matchesBuilding = buildingFilter === 'all'
        || offer.building === buildingFilter;

        const matchesEnglish = englishFilter === 'all'
            || ( englishFilter === 'english' && offer.isEnglish )
            || ( englishFilter === 'spanish' && !offer.isEnglish );

        return matchesSearch && matchesBuilding && matchesEnglish;
    }) || [];


    /**
     * Hook de paginación
     */
    const {
        currentPage,
        itemsPerPage,
        totalItems,
        totalPages,
        paginatedData: paginatedOffers,
        setCurrentPage,
        setItemsPerPage,
        resetToFirstPage
    } = usePagination({
        data: filteredOffers,
        initialItemsPerPage: 10
    });


    /**
     * Resetea la página actual cuando cambian los filtros
     */
    function handleFilterChange( filterType: 'search' | 'building' | 'english', value: string ): void {
        resetToFirstPage();

        switch ( filterType ) {
            case 'search':
                setSearchQuery( value );
            break;
            case 'building':
                setBuildingFilter( value );
            break;
            case 'english':
                setEnglishFilter( value );
            break;
        }
    };


    // function openNewOfferForm(): void {
    //     setEditingOffer( undefined );
    //     setIsFormOpen( true );
    // }


    function openEditOfferForm( offer: Offer ): void {
        setEditingOffer( offer );
        setIsFormOpen( true );
    }


    const deleteOfferApi = async ( offerId: string ): Promise<Offer> =>
        fetchApi<Offer>({ url: `offers/${offerId}`, method: Method.DELETE });


    const deleteOfferMutation = useMutation<Offer, Error, string>({
        mutationFn: deleteOfferApi,
        onSuccess: ( deletedOffer ) => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.OFFERS, facultyId] });
            // updateSubjectOffersCount( queryClient, facultyId, deletedOffer.subject.id, false );
            // updateFacultyTotal( queryClient, facultyId, false, 'totalOffers' );
            setIsDeleteDialogOpen( false );
            toast( 'Oferta eliminada exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al eliminar oferta: ${mutationError.message}`, errorToast )
    });


    function onOpenDeleteOffer( offer: Offer ): void {
        setDeletingOfferId( offer.id.toString() );
        setIsDeleteDialogOpen( true );
    }


    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="lg:flex lg:justify-between items-end gap-4 space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full max-w-4xl items-center">
                            <div className="grid space-y-2">
                                <Label htmlFor="search">Buscar</Label>

                                <div className="relative flex items-center">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />

                                    <Input
                                        id          = "search"
                                        type        = "search"
                                        placeholder = "Buscar ofertas..."
                                        value       = {searchQuery}
                                        className   = "pl-8"
                                        onChange    = {(e) => handleFilterChange( 'search', e.target.value )}
                                    />
                                </div>
                            </div>

                            <div className="grid space-y-2">
                                <Label htmlFor="building">Edificio</Label>

                                <Select
                                    value           = { buildingFilter }
                                    onValueChange   = {( value ) => handleFilterChange( 'building', value )}
                                >
                                    <SelectTrigger id="building">
                                        <SelectValue placeholder="Filtrar por edificio" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="all">Todos los edificios</SelectItem>
                                        <SelectItem value="A">Edificio A</SelectItem>
                                        <SelectItem value="B">Edificio B</SelectItem>
                                        <SelectItem value="C">Edificio C</SelectItem>
                                        <SelectItem value="D">Edificio D</SelectItem>
                                        <SelectItem value="E">Edificio E</SelectItem>
                                        <SelectItem value="F">Edificio F</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid space-y-2">
                                <Label htmlFor="english">Idioma</Label>

                                <Select
                                    value           = { englishFilter }
                                    onValueChange   = {( value ) => handleFilterChange( 'english', value )}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filtrar por idioma" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="all">Todos los idiomas</SelectItem>
                                        <SelectItem value="english">Inglés</SelectItem>
                                        <SelectItem value="spanish">Español</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* <Button
                            onClick     = { openNewOfferForm }
                            className   = "flex items-center gap-1 w-full lg:w-40"
                        >
                            <Plus className="h-4 w-4" />

                            Crear Oferta
                        </Button> */}
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardContent className="mt-5">
                    {offerList?.length === 0 && !isLoading && !isError ? (
                        <div className="text-center p-8 text-muted-foreground">
                            Aún no se han creado ofertas para esta facultad.
                        </div>
                    ) : (
                        <div>
                            {isError ? (
                                <div className="text-center p-8 text-destructive">
                                    Error al cargar las ofertas
                                </div>
                            ) : isLoading ? (
                                <div className="space-y-2 p-4">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <Skeleton key={i} className="h-12 w-full" />
                                    ))}
                                </div>
                            ) : (
                                <ScrollArea className="h-[calc(100vh-555px)]">
                                    <Table>
                                        <TableHeader className="sticky top-0 z-10 bg-background">
                                            <TableRow>
                                                <TableHead className="bg-background w-[120px]">Espacio</TableHead>
                                                <TableHead className="bg-background w-[140px]">Período</TableHead>
                                                <TableHead className="bg-background w-[350px]">Asignatura</TableHead>
                                                <TableHead className="bg-background w-[120px]">Sesiones</TableHead>
                                                <TableHead className="bg-background w-[80px] text-center">Fechas</TableHead>
                                                <TableHead className="bg-background w-[80px] text-center">Edificio</TableHead>
                                                <TableHead className="bg-background w-[80px] text-center">Inglés</TableHead>
                                                <TableHead className="text-right bg-background w-[80px]">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedOffers.map(( offer ) => (
                                                <TableRow key={ offer.id }>
                                                    {/* Tipo/Tamaño */}
                                                    <TableCell className="w-[120px]">
                                                        <SpaceSizeType
                                                            spaceType   = { offer.spaceType }
                                                            spaceSizeId = { offer.spaceSize?.id }
                                                        />
                                                    </TableCell>

                                                    {/* Periodo */}
                                                    <TableCell className="w-[140px]">
                                                        <Badge variant="outline">
                                                            { offer.period.id } - { offer.period.name }
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Asignatura */}
                                                    <TableCell
                                                        className   = "w-[350px] truncate"
                                                        title       = { `${offer.subject.id} - ${offer.subject.name}` }
                                                    >
                                                        { offer.subject.name }
                                                    </TableCell>

                                                    {/* Sesiones */}
                                                    <TableCell className="w-[120px]">
                                                        <SessionShort
                                                            showZero        = { true }
                                                            sessionCounts   = {{
                                                                C: offer.lecture,
                                                                T: offer.workshop,
                                                                A: offer.tutoringSession,
                                                                L: offer.laboratory,
                                                            }}
                                                        />
                                                    </TableCell>

                                                    {/* Fechas */}
                                                    <TableCell className="text-center w-[80px]">
                                                        <Badge variant="outline">
                                                            {offer.startDate?.length || 0}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Edificio */}
                                                    <TableCell className="text-center w-[80px]">
                                                        { offer.building
                                                            ? <Badge variant="outline">
                                                                { offer.building.replace( 'BUILDING_', '' )}
                                                            </Badge>
                                                            : <span className="text-muted-foreground">-</span>
                                                        }
                                                    </TableCell>

                                                    {/* Inglés */}
                                                    <TableCell className="text-center w-[80px]">
                                                        <Badge variant={offer.isEnglish ? "default" : "secondary"}>
                                                            {offer.isEnglish ? "Sí" : "No"}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Acciones */}
                                                    <TableCell className="w-[80px] text-end">
                                                        {/* <div className="flex items-center gap-1.5"> */}
                                                            <Button
                                                                title   = "Ver Oferta"
                                                                size    = "icon"
                                                                variant = "outline"
                                                                onClick = { () => openEditOfferForm( offer ) }
                                                                // onClick = { () => router.push( `/sections?subject=${ offer.subject.id }` )}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>

                                                            {/* <ActionButton
                                                                editItem    = { openEditOfferForm }
                                                                deleteItem  = { onOpenDeleteOffer }
                                                                item        = { offer }
                                                            /> */}
                                                        {/* </div> */}
                                                    </TableCell>
                                                </TableRow>
                                            ))}

                                            { filteredOffers.length === 0 && searchQuery ? (
                                                <TableRow>
                                                    <TableCell colSpan={11} className="h-24 text-center">
                                                        No se encontraron resultados para &quot;{searchQuery}&quot;
                                                    </TableCell>
                                                </TableRow>
                                            ) : offerList?.length === 0 && !searchQuery ? (
                                                <TableRow>
                                                    <TableCell colSpan={11} className="h-24 text-center">
                                                        No hay ofertas registradas
                                                    </TableCell>
                                                </TableRow>
                                            ) : null }
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            <DataPagination
                currentPage             = { currentPage }
                totalPages              = { totalPages }
                totalItems              = { totalItems }
                itemsPerPage            = { itemsPerPage }
                onPageChange            = { setCurrentPage }
                onItemsPerPageChange    = { setItemsPerPage }
            />

            {/* Offer Form Dialog */}
            <OfferForm
                offer       = { editingOffer }
                isOpen      = { isFormOpen }
                facultyId   = { facultyId }
                onClose     = {() => {
                    setIsFormOpen( false )
                    setEditingOffer( undefined );
                }}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen      = { isDeleteDialogOpen }
                onClose     = {() => setIsDeleteDialogOpen( false )}
                onConfirm   = {() => deleteOfferMutation.mutate( deletingOfferId! )}
                name        = { deletingOfferId! }
                type        = "la Oferta"
            />
        </div>
    );
}
