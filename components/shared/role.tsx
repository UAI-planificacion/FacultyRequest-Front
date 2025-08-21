'use client'

import { Eye, Shield, SquarePen, UsersRound } from "lucide-react";

import { Badge }    from "@/components/ui/badge";
import { Role }     from "@/types/staff.model";


interface RoleProps {
    role: Role;
}


const getColorRole = ( role: Role ): string => ({
    ADMIN       : 'bg-blue-500 text-white',
    EDITOR      : 'bg-amber-500 text-white',
    VIEWER      : 'bg-gray-500 text-white',
    ADMIN_FACULTY: 'bg-green-500 text-white',
})[role] || 'bg-gray-500 text-white'


const getNameRole = ( role: Role ): string => ({
    ADMIN       : 'Administrador',
    EDITOR      : 'Editor',
    VIEWER      : 'Visualizador',
    ADMIN_FACULTY: 'Admin Facultad',
})[role] || 'Administrador de Facultad'


const getIconRole = ( role: Role ) => ({
    ADMIN       : <Shield className="h-4 w-4 mr-1" />,
    EDITOR      : <SquarePen className="h-4 w-4 mr-1" />,
    VIEWER      : <Eye className="h-4 w-4 mr-1" />,
    ADMIN_FACULTY: <UsersRound className="h-4 w-4 mr-1" />,
})[role] || <Eye className="h-4 w-4 mr-1" />


export function RoleBadge({ role }: RoleProps) {
    return (
        <div className="flex items-center">
            <Badge className={getColorRole(role)}>
                {getIconRole(role)}
                {getNameRole(role)}
            </Badge>
        </div>
    );
}
