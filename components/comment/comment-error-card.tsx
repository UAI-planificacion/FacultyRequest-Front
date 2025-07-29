import { JSX } from "react";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Card, CardContent }    from "@/components/ui/card";
import { Button }               from "@/components/ui/button";


interface CommentErrorCardProps {
	onRetry?: () => void;
	message?: string;
}


/**
 * Error card component for when comments fail to load
 */
export function CommentErrorCard({ 
	onRetry, 
	message = "Ocurrió un error al cargar los comentarios" 
}: CommentErrorCardProps ): JSX.Element {
	return (
		<Card className="w-full border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
			<CardContent className="p-6">
				<div className="flex flex-col items-center justify-center space-y-4 text-center">
					{/* Error icon */}
					<div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
						<AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
					</div>
					
					{/* Error message */}
					<div className="space-y-2">
						<h3 className="text-lg font-medium text-red-900 dark:text-red-100">
							Error al cargar comentarios
						</h3>
						
						<p className="text-sm text-red-700 dark:text-red-300 max-w-md">
							{message}
						</p>
					</div>
					
					{/* Retry button */}
					{onRetry && (
						<Button
							variant="outline"
							size="sm"
							onClick={onRetry}
							className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
						>
							<RefreshCw className="w-4 h-4 mr-2" />
							Intentar de nuevo
						</Button>
					)}
					
					{/* Disabled comment notice */}
					<div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
						<p className="text-xs text-red-600 dark:text-red-400">
							Los comentarios están deshabilitados mientras no se puedan cargar correctamente.
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}