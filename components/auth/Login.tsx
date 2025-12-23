'use client'

import { JSX }  from "react";
import Image    from "next/image";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
}                       from "@/components/ui/dropdown-menu"
import { Button }       from "@/components/ui/button";
import { useSession }   from "@/hooks/use-session";

import { MicrosoftIcon }    from "@/icons/microsoft";
import LoaderMini           from "@/icons/LoaderMini";
import { signIn, signOut }  from "@/config/better-auth/auth-client";


export function Login(): JSX.Element {
    const { data: session, isLoading } = useSession();

    return (
        <>
            {isLoading ? (
                <Button
                    className   = "bg-black text-white border-zinc-700 hover:bg-zinc-900 hover:text-white gap-1.5"
                    variant     = "outline"
                    disabled    = { true }
                >
                    Cargando...
                    <LoaderMini />
                </Button>
            ) : (
                session?.user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant     = "outline"
                                className   = "gap-2 bg-black text-white border-zinc-700"
                                title       = { `Hola ${session?.user?.name || 'User'}` }
                            >
                                <Image
                                    src         = { session?.user?.image || '/default-avatar.png' }
                                    alt         = { session?.user?.name || 'User' }
                                    width       = { 30 }
                                    height      = { 30 }
                                    loading     = "lazy"
                                    className   = "rounded-full"
                                />

                                <span className="hidden md:flex">{session?.user?.name}</span>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-56" align="start">
                            <DropdownMenuLabel title="Mi cuenta">Mi cuenta</DropdownMenuLabel>

                            <DropdownMenuSeparator />

                            <DropdownMenuLabel title={session?.user?.name}>{session?.user?.name}</DropdownMenuLabel>

                            <DropdownMenuSeparator />

                            <DropdownMenuLabel title={session?.user?.email}>{session?.user?.email}</DropdownMenuLabel>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem>
                                <Button
                                    type        = "button"
                                    variant     = {'outline'}
                                    className   = "bg-black text-white border-zinc-700 hover:bg-zinc-900 hover:text-white gap-1.5 w-full"
                                    onClick     = { async () => await signOut() }
                                >
                                    <MicrosoftIcon />
                                    Cerrar sesión
                                </Button>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button
                        type        = "button"
                        variant     = {'outline'}
                        className   = "bg-black text-white border-zinc-700 hover:bg-zinc-900 hover:text-white gap-1.5"
                        onClick     = { async () => await signIn()}
                    >
                        <MicrosoftIcon />
                        <span className="hidden sm:block">Iniciar sesión</span>
                    </Button>
                )
            )}
        </>
    );
}
