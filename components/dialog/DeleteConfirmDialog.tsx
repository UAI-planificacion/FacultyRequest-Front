"use client";

import type React from 'react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';


interface DeleteConfirmDialogProps {
    isOpen      : boolean;
    onClose     : () => void;
    onConfirm   : () => void;
    type        : string;
    name        : string;
}


export function DeleteConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    type,
    name,
}: DeleteConfirmDialogProps ): React.JSX.Element {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>

                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente { type }{ ' ' }
                        <span className="font-semibold">"{ name }"</span> del sistema.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>

                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
