"use client"

import { JSX, useMemo, useState } from "react";

import {
    useMutation,
    useQuery,
    useQueryClient
}                       from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { toast }        from "sonner";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
}                               from "@/components/ui/table";
import {
    SubjectForm,
    SubjectFormValues
}                               from "@/components/subject/subject-form";
import {
    Card,
    CardContent,
    CardHeader
}                               from "@/components/ui/card";
import { DataPagination }       from "@/components/ui/data-pagination";
import { Button }               from "@/components/ui/button";
import { ScrollArea }           from "@/components/ui/scroll-area";
import { DeleteConfirmDialog }  from "@/components/dialog/DeleteConfirmDialog";
import { Input }                from "@/components/ui/input";
import { Label }                from "@/components/ui/label";
import { ShowDate }             from "@/components/shared/date";
import { ActionButton }         from "@/components/shared/action";
import { MultiSelectCombobox }  from "@/components/shared/Combobox";
import { 
    SubjectTableSkeleton, 
    SubjectErrorMessage 
}                               from "@/components/subject/subject-table-skeleton";
import { Badge }                from "@/components/ui/badge";

import {
    CreateSubject,
    Subject,
    UpdateSubject
}                                   from "@/types/subject.model";
import { KEY_QUERYS }               from "@/consts/key-queries"
import { Method, fetchApi }         from "@/services/fetch"
import { errorToast, successToast } from "@/config/toast/toast.config"
import { usePagination }            from "@/hooks/use-pagination";
import { useCostCenter }            from "@/hooks/use-cost-center";
import { Role, Staff } from "@/types/staff.model";


interface SubjectsManagementProps {
    facultyId   : string;
    enabled     : boolean;
    staff       : Staff;
}


export function SubjectsManagement({
    facultyId,
    enabled,
    staff
}: SubjectsManagementProps ): JSX.Element {
    const queryClient                                   = useQueryClient();
    const [isFormOpen, setIsFormOpen]                   = useState( false );
    const [editingSubject, setEditingSubject]           = useState<Subject | undefined>( undefined );
    const [searchQuery, setSearchQuery]                 = useState( '' );
    const [selectedCostCenter, setSelectedCostCenter]   = useState<string>( 'all' );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen]   = useState( false );
    const [deletingSubjectId, setDeletingSubjectId]     = useState<string | undefined>( undefined );
    const isAdmin                                       = staff.role === Role.ADMIN_FACULTY || staff.role === Role.ADMIN;


    const {
        data: subjects,
        isLoading,
        isError
    } = useQuery<Subject[]>({
        queryKey: [KEY_QUERYS.SUBJECTS, facultyId],
        queryFn : () => fetchApi({ url: `subjects/all/${facultyId}` }),
        enabled,
    });


    const {
        costCenter,
        isLoading: isLoadingCostCenter,
        isError: isErrorCostCenter
    } = useCostCenter({ enabled });


    const filteredSubjects = useMemo(() => {
        if ( !subjects ) return [];

        const searchLower = searchQuery.toLowerCase();

        return subjects.filter(subject => {
            const matchesSearch = 
                subject.id.toLowerCase().includes( searchLower ) ||
                subject.name.toLowerCase().includes( searchLower );

            const matchesCostCenter = 
                selectedCostCenter === 'all' || 
                subject.costCenterId === selectedCostCenter;

            return matchesSearch && matchesCostCenter;
        });
    }, [subjects, searchQuery, selectedCostCenter]);


    /**
     * Hook de paginación
     */
    const {
        currentPage,
        itemsPerPage,
        totalItems,
        totalPages,
        startIndex,
        endIndex,
        paginatedData: paginatedSubjects,
        setCurrentPage,
        setItemsPerPage,
        resetToFirstPage
    } = usePagination({
        data: filteredSubjects,
        initialItemsPerPage: 10
    });


    /**
     * Resetea la página actual cuando cambian los filtros
     */
    const handleFilterChange = ( filterType: 'search' | 'costCenter', value: string = 'all' ) => {
        resetToFirstPage();

        switch ( filterType ) {
            case 'search':
                setSearchQuery( value );
                break;
            case 'costCenter':
                setSelectedCostCenter( value );
                break;
        }
    };


    const createSubjectApi = async ( newSubject: CreateSubject ): Promise<Subject>  =>
        fetchApi<Subject>( { url: `subjects`, method: Method.POST, body: newSubject } );


    const updateSubjectApi = async ( updatedSubject: UpdateSubject ): Promise<Subject>  =>
        fetchApi<Subject>( { url: `subjects/${updatedSubject.id}`, method: Method.PATCH, body: updatedSubject } );


    const deleteSubjectApi = async ( subjectId: string ): Promise<Subject> =>
        fetchApi<Subject>( { url: `subjects/${subjectId}`, method: Method.DELETE } );


    function saveSuject( isCreated: boolean ): void {
        queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SUBJECTS, facultyId] });
        setIsFormOpen( false );
        setEditingSubject( undefined );
        toast( `Asignatura ${isCreated ? 'creada' : 'actualizada'} exitosamente`, successToast );
    }


    const createSubjectMutation = useMutation<Subject, Error, CreateSubject>({
        mutationFn  : createSubjectApi,
        onSuccess   : () => saveSuject( true ),
        onError     : ( mutationError ) => toast(`Error al crear asignatura: ${mutationError.message}`, errorToast ),
    });


    const updateSubjectMutation = useMutation<Subject, Error, UpdateSubject>({
        mutationFn  : updateSubjectApi,
        onSuccess   : () => saveSuject( false ),
        onError     : ( mutationError ) => toast(`Error al actualizar asignatura: ${mutationError.message}`, errorToast ),
    });


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


    function handleFormSubmit( formData: SubjectFormValues ): void {
        const { dates, ...rest } = formData;

        if ( editingSubject ) {
            updateSubjectMutation.mutate({
                ...rest,
            } as UpdateSubject );
        } else {
            createSubjectMutation.mutate({
                ...rest,
                facultyId,
            } as CreateSubject );
        }
    };


    function onOpenDeleteSubject( subject: Subject ): void {
        setDeletingSubjectId( subject.id );
        setIsDeleteDialogOpen( true );
    }


    return (
        <div className="space-y-4">
            <Card className="w-full">
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

                            <div className="grid space-y-2">
                                <Label htmlFor="costCenter">Centro de Costos</Label>

                                <MultiSelectCombobox
                                    multiple            = { false }
                                    placeholder         = "Seleccionar centro de costo"
                                    defaultValues       = { '' }
                                    onSelectionChange   = {( value ) => handleFilterChange( 'costCenter', value as string )}
                                    options             = { costCenter }
                                />
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
            </Card>

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
                                        <TableHead className="bg-background w-[120px]">Código</TableHead>

                                        <TableHead className="bg-background w-[250px]">Nombre</TableHead>

                                        <TableHead className="bg-background w-[200px]">Fecha Inicio</TableHead>

                                        <TableHead className="bg-background w-[200px]">Fecha Fin</TableHead>

                                        <TableHead className="text-center bg-background w-[80px]">Alumnos</TableHead>

                                        <TableHead className="text-center bg-background w-[150px]">Centro de Costo</TableHead>

                                        <TableHead className="text-center bg-background w-[100px]">Inglés</TableHead>

                                        { isAdmin &&
                                            <TableHead className="text-right bg-background w-[100px]">Acciones</TableHead>
                                        }
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
                                            {paginatedSubjects.map((subject) => (
                                                <TableRow key={subject.id}>
                                                    <TableCell className="font-medium w-[120px]">{subject.id}</TableCell>

                                                    <TableCell className="w-[250px]">{subject.name}</TableCell>

                                                    <TableCell className="w-[200px]">
                                                        <div className="flex gap-2">
                                                            <ShowDate date={ subject.startDate[0] } />

                                                            <Badge variant="outline">
                                                                { subject.startDate.length }
                                                            </Badge>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="w-[200px]">
                                                        <div className="flex gap-2">
                                                            <ShowDate date={ subject.endDate.at( -1 )} />

                                                            <Badge variant="outline">
                                                                { subject.endDate.length }
                                                            </Badge>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="text-center w-[80px]">{subject.students}</TableCell>

                                                    <TableCell className="text-center w-[150px] truncate">{subject.costCenterId}</TableCell>

                                                    <TableCell className="text-right w-[110px]">
                                                        <Badge variant="secondary">
                                                            { subject.isEnglish ? 'Sí' : 'No' }
                                                        </Badge>
                                                    </TableCell>

                                                    { isAdmin &&
                                                        <TableCell className="text-right w-[100px]">
                                                            <ActionButton
                                                                editItem    = { openEditSubjectForm }
                                                                deleteItem  = { () => onOpenDeleteSubject( subject )}
                                                                item        = { subject }
                                                            />
                                                        </TableCell>
                                                    }
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
                startIndex              = { startIndex }
                endIndex                = { endIndex }
            />

            {/* Subject Form Dialog */}
            <SubjectForm
                subject     = { editingSubject }
                onSubmit    = { handleFormSubmit }
                onClose     = { () => setIsFormOpen( false )}
                isOpen      = { isFormOpen }
                costCenter  = { costCenter }
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
