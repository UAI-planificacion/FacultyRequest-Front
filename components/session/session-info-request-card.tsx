'use client'

import { JSX } from 'react'

import { LucideIcon } from 'lucide-react'

import { Session } from '@/types/section.model'
import { SessionName } from './session-name'


interface SessionValue {
	session	: Session
	value	: string | number | null | undefined
}


interface Props {
	icon		: LucideIcon
	label		: string
	values		: SessionValue[]
}


export function SesionInfoRequestCard( { icon: Icon, label, values }: Props ): JSX.Element {
	return (
		<div className="p-3 rounded-lg bg-muted/50">
			{/* Contenido */}
			<div className=" space-y-3">
                <div className='flex items-center gap-2'>
			        {/* Ícono */}
                    <Icon className="h-5 w-5 text-primary" />

				    {/* Label */}
                    <span className="text-xs font-medium text-muted-foreground block">
                        { label }
                    </span>
                </div>

				{/* Listado de valores por sesión */}
				<div className="space-y-2">
					{ values.map( ( { session, value }, index ) => (
						<div key={ index } className="flex items-center gap-2">
							<SessionName
								session		= { session }
								hideCount	= { true }
							/>

							<span className="text-sm font-semibold">
								{ value || (
									<span className="text-muted-foreground">
										No especificado
									</span>
								)}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
