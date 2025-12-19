"use client"

import { JSX, useMemo, useState }   from "react";
import { useRouter }                from "next/navigation";

import {
    useMutation,
    useQuery,
    useQueryClient
}                   from "@tanstack/react-query";
import { Album }    from "lucide-react";
import { toast }    from "sonner";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
}                               from "@/components/ui/table";
import { 
    SubjectTableSkeleton, 
    SubjectErrorMessage 
}                               from "@/components/subject/subject-table-skeleton";
import { DataPagination }       from "@/components/ui/data-pagination";
import { Button }               from "@/components/ui/button";
import { ScrollArea }           from "@/components/ui/scroll-area";
import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog";
import { ActionButton }         from "@/components/shared/action";
import { ActiveBadge }          from "@/components/shared/active";
import { SpaceSizeType }        from "@/components/shared/space-size-type";
import { SessionShort }         from "@/components/session/session-short";
import { SubjectFilter }        from "@/components/subject/subject-filter";
import { Card, CardContent }    from "@/components/ui/card";
import { SubjectForm }          from "@/components/subject/subject-form";

import { Subject }                  from "@/types/subject.model";
import { KEY_QUERYS }               from "@/consts/key-queries"
import { Method, fetchApi }         from "@/services/fetch"
import { errorToast, successToast } from "@/config/toast/toast.config"
import { usePagination }            from "@/hooks/use-pagination";
import { Role, Staff }              from "@/types/staff.model";


interface Props {
    facultyId   : string;
    enabled     : boolean;
    staff       : Staff;
}


export function SubjectsManagement({
    facultyId,
    enabled,
    staff
}: Props ): JSX.Element {
    const router						                = useRouter();
    const queryClient                                   = useQueryClient();
    const [isFormOpen, setIsFormOpen]                   = useState( false );
    const [editingSubject, setEditingSubject]           = useState<Subject | undefined>( undefined );
    const [searchQuery, setSearchQuery]                 = useState( '' );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen]   = useState( false );
    const [deletingSubjectId, setDeletingSubjectId]     = useState<string | undefined>( undefined );
    const isAdmin                                       = staff.role === Role.ADMIN;
    const [selectedSizes, setSelectedSizes]             = useState<string[]>( [] );
    const [selectedSpaceTypes, setSelectedSpaceTypes]   = useState<string[]>( [] );

    const {
        data: subjects,
        isLoading,
        isError
    } = useQuery<Subject[]>({
        queryKey: [KEY_QUERYS.SUBJECTS, facultyId],
        queryFn : () => fetchApi({ url: `subjects/all/${facultyId}` }),
        enabled,
    });


    const filteredSubjects = useMemo(() => {
        if ( !subjects ) return [];

        const searchLower = searchQuery.toLowerCase();

        return subjects.filter(subject => {
            const matchesSearch = subject.id.toLowerCase().includes( searchLower )
                || subject.name.toLowerCase().includes( searchLower );

            const matchesSpaceType = selectedSpaceTypes.length === 0 
                || selectedSpaceTypes.includes('none') && !subject.spaceType
                || (subject.spaceType && selectedSpaceTypes.includes(subject.spaceType));

            const matchesSize = selectedSizes.length === 0 
                || (subject.spaceSizeId && selectedSizes.includes(subject.spaceSizeId));

            return matchesSearch && matchesSpaceType && matchesSize;
        });
    }, [subjects, searchQuery, selectedSpaceTypes, selectedSizes]);

    /**
     * Hook de paginación
     */
    const {
        currentPage,
        itemsPerPage,
        totalItems,
        totalPages,
        paginatedData: paginatedSubjects,
        setCurrentPage,
        setItemsPerPage,
        resetToFirstPage
    } = usePagination({
        data: filteredSubjects,
        initialItemsPerPage: 10
    });


    const handleSearchChange = ( value: string ) => {
        resetToFirstPage();
        setSearchQuery( value );
    };

    const handleSpaceTypeChange = ( value: string | string[] | undefined ) => {
        resetToFirstPage();
        setSelectedSpaceTypes( Array.isArray(value) ? value : value ? [value] : [] );
    };

    const handleSizeChange = ( value: string | string[] | undefined ) => {
        resetToFirstPage();
        setSelectedSizes( Array.isArray(value) ? value : value ? [value] : [] );
    };

    const handleClearFilters = () => {
        resetToFirstPage();
        setSearchQuery( '' );
        setSelectedSpaceTypes( [] );
        setSelectedSizes( [] );
    };

    /**
     * Resetea la página actual cuando cambian los filtros
     */
    // const handleFilterChange = ( filterType: 'search' | 'costCenter', value: string = 'all' ) => {
    //     resetToFirstPage();

    //     switch ( filterType ) {
    //         case 'search':
    //             setSearchQuery( value );
    //             break;
    //         case 'costCenter':
    //             setSelectedCostCenter( value );
    //             break;
    //     }
    // };

    // const createSubjectApi = async ( newSubject: CreateSubject ): Promise<Subject>  =>
    //     fetchApi<Subject>( { url: `subjects`, method: Method.POST, body: newSubject } );


    // const updateSubjectApi = async ( updatedSubject: UpdateSubject ): Promise<Subject>  =>
    //     fetchApi<Subject>( { url: `subjects/${updatedSubject.id}`, method: Method.PATCH, body: updatedSubject } );


    const deleteSubjectApi = async ( subjectId: string ): Promise<Subject> =>
        fetchApi<Subject>( { url: `subjects/${subjectId}`, method: Method.DELETE } );


    // function saveSuject( isCreated: boolean ): void {
    //     queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SUBJECTS, facultyId] });
    //     setIsFormOpen( false );
    //     setEditingSubject( undefined );
    //     toast( `Asignatura ${isCreated ? 'creada' : 'actualizada'} exitosamente`, successToast );
    // }


    // const createSubjectMutation = useMutation<Subject, Error, CreateSubject>({
    //     mutationFn  : createSubjectApi,
    //     onSuccess   : () => saveSuject( true ),
    //     onError     : ( mutationError ) => toast(`Error al crear asignatura: ${mutationError.message}`, errorToast ),
    // });


    // const updateSubjectMutation = useMutation<Subject, Error, UpdateSubject>({
    //     mutationFn  : updateSubjectApi,
    //     onSuccess   : () => saveSuject( false ),
    //     onError     : ( mutationError ) => toast(`Error al actualizar asignatura: ${mutationError.message}`, errorToast ),
    // });


    const deleteSubjectMutation = useMutation<Subject, Error, string>({
        mutationFn: deleteSubjectApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SUBJECTS, facultyId] });
            setIsDeleteDialogOpen( false );
            toast( 'Asignatura eliminada exitosamente', successToast );
        },
        onError: ( mutationError ) => toast( `Error al eliminar asignatura: ${mutationError.message}`, errorToast ),
    });


    const openNewSubjectForm = () => {
        setEditingSubject( undefined );
        setIsFormOpen( true );
    }


    const openEditSubjectForm = ( subject: Subject ) => {
        setEditingSubject( subject );
        setIsFormOpen( true );
    }


    // function handleFormSubmit( formData: SubjectFormValues ): void {
    //     if ( editingSubject ) {
    //         updateSubjectMutation.mutate({
    //             ...formData,
    //         } as UpdateSubject );
    //     } else {
    //         createSubjectMutation.mutate({
    //             ...formData,
    //             facultyId,
    //         } as CreateSubject );
    //     }
    // };


    function onOpenDeleteSubject( subject: Subject ): void {
        setDeletingSubjectId( subject.id );
        setIsDeleteDialogOpen( true );
    }


//    const openOfferSubjectForm = ( subject?: Subject ) => {
//         setOfferingSubject( subject );
//         setIsOfferSubjectOpen( true );
//     }

    return (
        <div className="space-y-4">
            {/* <Card className="w-full">
                <CardHeader>
                    <div className="lg:flex justify-between items-end gap-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl items-center">
                            <div className="grid space-y-2">
                                <Label htmlFor="search">Buscar</Label>

                                <div className="relative flex items-center">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />

                                    <Input
                                        id          = "search"
                                        type        = "search"
                                        placeholder = "Buscar por código o nombre..."
                                        value       = { searchQuery }
                                        className   = "pl-8"
                                        onChange    = {( e ) => handleFilterChange( 'search', e.target.value )}
                                    />
                                </div>
                            </div>

                        </div>

                        { isAdmin &&
                            <Button
                                onClick     = { openNewSubjectForm }
                                className   = "flex items-center gap-1 w-full lg:w-40"
                            >
                                <Plus className="h-4 w-4" />
                                Crear Asignatura
                            </Button>
                        }
                    </div>
                </CardHeader>
            </Card> */}

            <SubjectFilter
                searchQuery         = { searchQuery }
                selectedSpaceTypes  = { selectedSpaceTypes }
                selectedSizes       = { selectedSizes }
                onSearchChange      = { handleSearchChange }
                onSpaceTypeChange   = { handleSpaceTypeChange }
                onSizeChange        = { handleSizeChange }
                onClearFilters      = { handleClearFilters }
                onNewSubject        = { openNewSubjectForm }
                showOfferButton     = { isAdmin }
                // onOfferSubjects     = { () => openOfferSubjectForm() }
                // showOfferButton     = { true }
            />

            <Card>
                <CardContent className="mt-5">
                    {subjects?.length === 0 && !isLoading && !isError ? (
                        <div className="text-center p-8 text-muted-foreground">
                            No se han agregado asignaturas a esta facultad.
                        </div>
                    ) : (
                        <div>
                            <Table>
                                <TableHeader className="sticky top-0 z-10 bg-background">
                                    <TableRow>
                                        <TableHead className="bg-background w-[120px]">Sigla</TableHead>
                                        <TableHead className="bg-background w-[370px]">Nombre</TableHead>
                                        <TableHead className="bg-background w-[140px] text-start">Espacio</TableHead>
                                        <TableHead className="bg-background w-[170px] text-start">Sesiones</TableHead>
                                        <TableHead className="bg-background w-[100px] text-start">Grado</TableHead>
                                        <TableHead className="bg-background w-[100px] text-start">Cupo</TableHead>
                                        <TableHead className="bg-background w-[100px] text-start">Estado</TableHead>
                                        <TableHead className="bg-background w-[120px] text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                            </Table>

                            {isError ? (
                                <SubjectErrorMessage />
                            ) : isLoading ? (
                                <SubjectTableSkeleton rows={10} />
                            ) : (
                                <ScrollArea className="h-[calc(100vh-600px)]">
                                    <Table>
                                        <TableBody>
                                            { paginatedSubjects.map(( subject ) => (
                                                <TableRow key={ subject.id }>
                                                    {/* Sigla */}
                                                    <TableCell className="font-medium w-[120px] truncate">
                                                        { subject.id }
                                                    </TableCell>

                                                    {/* Nombre */}
                                                    <TableCell
                                                        className	= "w-[400px] truncate"
                                                        title		= { subject.name }
                                                    >
                                                        { subject.name }
                                                    </TableCell>

                                                    {/* Espacio */}
                                                    <TableCell className="w-[140px]">
                                                        <div className="flex justify-end">
                                                            <SpaceSizeType
                                                                spaceType	= { subject.spaceType }
                                                                spaceSizeId	= { subject.spaceSizeId }
                                                            />
                                                        </div>
                                                    </TableCell>

                                                    {/* Sesiones */}
                                                    <TableCell className="w-[170px]">
                                                        <div className="flex justify-center">
                                                            <SessionShort
                                                                showZero		= { true }
                                                                sessionCounts	= {{
                                                                    C: subject.lecture,
                                                                    T: subject.workshop,
                                                                    A: subject.tutoringSession,
                                                                    L: subject.laboratory,
                                                                }}
                                                            />
                                                        </div>
                                                    </TableCell>

                                                    {/* Grado */}
                                                    <TableCell className="w-[100px]">
                                                        <div className="flex justify-center">
                                                            { subject.grade?.name }
                                                        </div>
                                                    </TableCell>

                                                    {/* Cupo */}
                                                    <TableCell className="w-[100px]">
                                                        <div className="flex justify-center">
                                                            { subject.quota ?? '-' }
                                                        </div>
                                                    </TableCell>

                                                    {/* Estado */}
                                                    <TableCell className="w-[100px] text-end">
                                                        <ActiveBadge isActive={ subject.isActive } />
                                                    </TableCell>

                                                    {/* Acciones */}
                                                    <TableCell className="w-[120px] text-right">
                                                        <div className="flex gap-2 items-center justify-end">
                                                            <Button
                                                                title		= "Ofertas"
                                                                size		= "sm"
                                                                variant		= "outline"
                                                                className	= "flex items-center gap-1.5"
                                                                onClick     = { () => router.push( `/sections?subject=${ subject.id }` )}
                                                            >
                                                                { subject.offersCount }
                                                                <Album className="h-4 w-4" />
                                                            </Button>

                                                            <ActionButton
                                                                editItem    = { openEditSubjectForm }
                                                                deleteItem  = { () => onOpenDeleteSubject( subject )}
                                                                item        = { subject }
                                                            />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}

                                            { filteredSubjects.length === 0 && searchQuery ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="h-24 text-center">
                                                        No se encontraron resultados para &quot;{searchQuery}&quot;
                                                    </TableCell>
                                                </TableRow>
                                            ) : subjects?.length === 0 && !searchQuery ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="h-24 text-center">
                                                        No hay asignaturas registradas
                                                    </TableCell>
                                                </TableRow>
                                            ) : null}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Paginación */}
            <DataPagination
                currentPage             = { currentPage }
                totalPages              = { totalPages }
                totalItems              = { totalItems }
                itemsPerPage            = { itemsPerPage }
                onPageChange            = { setCurrentPage }
                onItemsPerPageChange    = { setItemsPerPage }
            />

            {/* Subject Form Dialog */}
            <SubjectForm
                subject     = { editingSubject }
                // onSubmit    = { handleFormSubmit }
                onClose     = { () => setIsFormOpen( false )}
                isOpen      = { isFormOpen }
            />

            <DeleteConfirmDialog
                isOpen      = { isDeleteDialogOpen }
                onClose     = { () => setIsDeleteDialogOpen( false )}
                onConfirm   = { () => deleteSubjectMutation.mutate( deletingSubjectId! ) }
                name        = { deletingSubjectId! }
                type        = "la Asignatura"
            />
        </div>
    );
}
