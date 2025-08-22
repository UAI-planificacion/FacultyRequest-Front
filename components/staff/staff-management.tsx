"use client"

import { JSX, useState } from "react";

import {
    useMutation,
    useQuery,
    useQueryClient
}                       from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { toast }        from "sonner";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
}                                       from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
}                                       from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
}                                       from "@/components/ui/table"
import {
    StaffTableSkeleton,
    StaffErrorMessage
}                                       from "@/components/staff/staff-table-skeleton"
import { DataPagination }               from "@/components/ui/data-pagination";
import { StaffForm, StaffFormValues }   from "@/components/staff/staff-form"
import { Button }                       from "@/components/ui/button"
import { ScrollArea }                   from "@/components/ui/scroll-area"
import { RoleBadge }                    from "@/components/shared/role";
import { ActionButton }                 from "@/components/shared/action";
import { ActiveBadge }                  from "@/components/shared/active";
import { Input }                        from "@/components/ui/input";
import { DeleteConfirmDialog }          from "@/components/dialog/DeleteConfirmDialog";
import { Label }                        from "@/components/ui/label";

import {
    CreateStaff,
    Role,
    Staff,
    UpdateStaff
}                                   from "@/types/staff.model";
import { KEY_QUERYS }               from "@/consts/key-queries";
import { Method, fetchApi }         from "@/services/fetch";
import { errorToast, successToast } from "@/config/toast/toast.config";
import { usePagination }            from "@/hooks/use-pagination";


interface StaffManagementProps {
    facultyId   : string;
    enabled     : boolean;
    staff       : Staff;
}


export function StaffManagement({
    facultyId,
    enabled,
    staff
}: StaffManagementProps ): JSX.Element {
    const queryClient                                   = useQueryClient();
    const [searchQuery, setSearchQuery]                 = useState( '' );
    const [roleFilter, setRoleFilter]                   = useState<string>( 'all' );
    const [statusFilter, setStatusFilter]               = useState<string>( 'all' );
    const [isFormOpen, setIsFormOpen]                   = useState( false );
    const [editingStaff, setEditingStaff]               = useState<Staff | undefined>( undefined );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen]   = useState( false );
    const [deletingStaffId, setDeletingStaffId]         = useState<string | undefined>( undefined );
    const isAdmin                                       = staff.role === Role.ADMIN_FACULTY || staff.role === Role.ADMIN;
    const { data: staffList, isLoading, isError }       = useQuery({
        queryKey    : [ KEY_QUERYS.STAFF, facultyId ],
        queryFn     : () => fetchApi<Staff[]>( { url: `staff/all/${facultyId}` } ),
        enabled
    });


    const filteredStaff = staffList?.filter(staff => {
        const matchesSearch = searchQuery === ''
            || staff.name.toLowerCase().includes( searchQuery.toLowerCase() )
            || staff.email.toLowerCase().includes( searchQuery.toLowerCase() );

        const matchesRole = roleFilter === 'all'
            || ( roleFilter === 'admin' && staff.role === 'ADMIN' )
            || ( roleFilter === 'editor' && staff.role === 'EDITOR' )
            || ( roleFilter === 'viewer' && staff.role === 'VIEWER' );

        const matchesStatus = statusFilter === 'all'
            || ( statusFilter === 'active' && staff.isActive )
            || ( statusFilter === 'inactive' && !staff.isActive );

        return matchesSearch && matchesRole && matchesStatus;
    }) || [];


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
        paginatedData: paginatedStaff,
        setCurrentPage,
        setItemsPerPage,
        resetToFirstPage
    } = usePagination({
        data: filteredStaff,
        initialItemsPerPage: 10
    });


    /**
     * Resetea la página actual cuando cambian los filtros
     */
    const handleFilterChange = ( filterType: 'search' | 'role' | 'status', value: string ) => {
        resetToFirstPage();

        switch ( filterType ) {
            case 'search':
                setSearchQuery( value );
            break;
            case 'role':
                setRoleFilter( value );
            break;
            case 'status':
                setStatusFilter( value );
            break;
        }
    };


    function openNewStaffForm(): void {
        setEditingStaff( undefined );
        setIsFormOpen( true );
    }


    function openEditStaffForm( staff: Staff ): void {
        setEditingStaff( staff );
        setIsFormOpen( true );
    }


    const createStaffApi = async ( newStaff: CreateStaff ): Promise<Staff>  =>
        fetchApi<Staff>( { url: `staff`, method: Method.POST, body: newStaff } );


    const updateStaffApi = async ( updatedStaff: UpdateStaff ): Promise<Staff>  =>
        fetchApi<Staff>( { url: `staff/${updatedStaff.id}`, method: Method.PATCH, body: updatedStaff } );


    const deleteStaffApi = async ( staffId: string ): Promise<Staff> =>
        fetchApi<Staff>( { url: `staff/${staffId}`, method: Method.DELETE } );


    const createStaffMutation = useMutation<Staff, Error, CreateStaff>({
        mutationFn: createStaffApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.STAFF, facultyId] });
            setIsFormOpen( false );
            setEditingStaff( undefined );
            toast( 'Personal creado exitosamente', successToast );
        },
        onError: ( mutationError ) => {
            toast( `Error al crear personal: ${mutationError.message}`, errorToast );
        },
    });


    const updateStaffMutation = useMutation<Staff, Error, UpdateStaff>({
        mutationFn: updateStaffApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.STAFF, facultyId] });
            setIsFormOpen( false );
            setEditingStaff( undefined );
            toast( 'Personal actualizado exitosamente', successToast );
        },
        onError: ( mutationError ) => {
            toast(`Error al actualizar personal: ${mutationError.message}`, errorToast );
        },
    });


    const deleteStaffMutation = useMutation<Staff, Error, string>({
        mutationFn: deleteStaffApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.STAFF, facultyId] });
            setIsDeleteDialogOpen( false );
            toast( 'Personal eliminado exitosamente', successToast );
        },
        onError: (mutationError) => {
            toast(`Error al eliminar personal: ${mutationError.message}`, errorToast );
        },
    });


    function handleFormSubmit( formData: StaffFormValues ): void {
        if ( staff.role === Role.VIEWER ) return;

        if ( editingStaff ) {
            updateStaffMutation.mutate({
                ...formData,
                id: editingStaff.id
            } as UpdateStaff );
        } else {
            createStaffMutation.mutate({
                ...formData,
                facultyId,
            } as CreateStaff );
        }
    };


    function onOpenDeleteStaff( staff: Staff ): void {
        setDeletingStaffId( staff.id );
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
                                        placeholder = "Buscar personal..."
                                        value       = {searchQuery}
                                        className   = "pl-8"
                                        onChange    = {(e) => handleFilterChange( 'search', e.target.value )}
                                    />
                                </div>
                            </div>

                            <div className="grid space-y-2">
                                <Label htmlFor="role">Role</Label>

                                <Select value={roleFilter} onValueChange={(value) => handleFilterChange( 'role', value )}>
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Filtrar por rol" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="all">Roles</SelectItem>
                                        <SelectItem value="admin">Administrador</SelectItem>
                                        <SelectItem value="viewer">Visualizador</SelectItem>
                                        <SelectItem value="editor">Editor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid space-y-2">
                                <Label htmlFor="role">Estados</Label>

                                <Select value={statusFilter} onValueChange={(value) => handleFilterChange( 'status', value )}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filtrar por estado" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="all">Estados</SelectItem>
                                        <SelectItem value="active">Activos</SelectItem>
                                        <SelectItem value="inactive">Inactivos</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        { isAdmin &&
                            <Button
                                onClick     = { openNewStaffForm }
                                className   = "flex items-center gap-1 w-full lg:w-40"
                            >
                                <Plus className="h-4 w-4" />

                                Crear Personal
                            </Button>
                        }
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardContent className="mt-5">
                    {staffList?.length === 0 && !isLoading && !isError ? (
                        <div className="text-center p-8 text-muted-foreground">
                            Aún no se ha asignado personal a esta facultad.
                        </div>
                    ) : (
                        <div>
                            <Table>
                                <TableHeader className="sticky top-0 z-10 bg-background">
                                    <TableRow>
                                        <TableHead className="bg-background w-[250px]">Nombre</TableHead>

                                        <TableHead className="bg-background w-[150px]">Rol</TableHead>

                                        <TableHead className="bg-background w-[250px]">Correo</TableHead>

                                        <TableHead className="bg-background w-[120px]">Activo</TableHead>

                                        { isAdmin &&
                                            <TableHead className="text-right bg-background w-[120px]">Acciones</TableHead>
                                        }
                                    </TableRow>
                                </TableHeader>
                            </Table>

                            {isError ? (
                                <StaffErrorMessage />
                            ) : isLoading ? (
                                <StaffTableSkeleton rows={10} />
                            ) : (
                                <ScrollArea className="h-[calc(100vh-600px)]">
                                    <Table>
                                        <TableBody>
                                            { paginatedStaff.map( staffData => (
                                                <TableRow key={ staffData.id }>
                                                    <TableCell className="font-medium w-[250px]">{ staffData.name }</TableCell>

                                                    <TableCell className="w-[150px]">
                                                        <RoleBadge role={ staffData.role } />
                                                    </TableCell>

                                                    <TableCell className="w-[250px]">{ staffData.email }</TableCell>

                                                    <TableCell className="w-[120px]">
                                                        <ActiveBadge isActive={ staffData.isActive } />
                                                    </TableCell>

                                                    { isAdmin &&
                                                        <TableCell className="text-right w-[120px]">
                                                            <ActionButton
                                                                editItem    = { openEditStaffForm }
                                                                deleteItem  = { () => onOpenDeleteStaff(staffData) }
                                                                item        = { staffData }
                                                            />
                                                        </TableCell>
                                                    }
                                                </TableRow>
                                            ))}

                                            { filteredStaff.length === 0 && searchQuery ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="h-24 text-center">
                                                        No se encontraron resultados para &quot;{searchQuery}&quot;
                                                    </TableCell>
                                                </TableRow>
                                            ) : staffList?.length === 0 && !searchQuery ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="h-24 text-center">
                                                        No hay personal registrado
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
                startIndex              = { startIndex }
                endIndex                = { endIndex }
            />

            {/* Staff Form Dialog */}
            <StaffForm
                staff       = { editingStaff }
                onSubmit    = { handleFormSubmit }
                onClose     = { () => setIsFormOpen( false )}
                isOpen      = { isFormOpen }
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen      = { isDeleteDialogOpen }
                onClose     = { () => setIsDeleteDialogOpen( false )}
                onConfirm   = { () => deleteStaffMutation.mutate( deletingStaffId! ) }
                name        = { deletingStaffId! }
                type        = "el Personal"
            />
        </div>
    );
}
