'use client';

import { ShowDate } from "@/components/shared/date";

interface ShowDateAtProps {
    createdAt: Date | string;
    updatedAt: Date | string | undefined;
}

export function ShowDateAt({ createdAt, updatedAt }: ShowDateAtProps ) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-800/70 p-2 rounded">
                <span>Creado</span>
                <ShowDate date={createdAt} />
            </div>

            <div className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-800/70 p-2 rounded">
                <span>Actualizado</span>

                {updatedAt && updatedAt !== createdAt
                    ? <ShowDate date={updatedAt} />
                    : <span>-</span>
                }
            </div>
        </div>
    );
}
