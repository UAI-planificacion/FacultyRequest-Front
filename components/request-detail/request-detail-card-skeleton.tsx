"use client"

import { JSX } from "react";

import {
	Card,
	CardContent,
	CardHeader,
}				from "@/components/ui/card";


/**
 * Skeleton component for RequestDetailCard during loading state
 */
export function RequestDetailCardSkeleton(): JSX.Element {
	return (
		<Card className="relative">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					{/* ID Skeleton */}
					<div className="h-4 w-16 bg-muted rounded animate-pulse" />

					{/* Action buttons skeleton */}
					<div className="flex gap-1">
						<div className="h-8 w-8 bg-muted rounded animate-pulse" />
						<div className="h-8 w-8 bg-muted rounded animate-pulse" />
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-3">
				{/* Info items skeleton */}
				<div className="flex flex-wrap items-center gap-1.5">
					<div className="h-4 w-12 bg-muted rounded animate-pulse" />
					<div className="h-4 w-16 bg-muted rounded animate-pulse" />
					<div className="h-4 w-14 bg-muted rounded animate-pulse" />
					<div className="h-4 w-10 bg-muted rounded animate-pulse" />
					<div className="h-4 w-8 bg-muted rounded animate-pulse" />
				</div>

				{/* Badges skeleton */}
				<div className="flex flex-wrap gap-2">
					<div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
					<div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
					<div className="h-5 w-12 bg-muted rounded-full animate-pulse" />
				</div>

				{/* Days section skeleton */}
				<div>
					<div className="h-3 w-8 bg-muted rounded animate-pulse mb-2" />
					<div className="flex flex-wrap gap-1">
						<div className="h-5 w-12 bg-muted rounded-full animate-pulse" />
						<div className="h-5 w-14 bg-muted rounded-full animate-pulse" />
						<div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
						<div className="h-5 w-12 bg-muted rounded-full animate-pulse" />
					</div>
				</div>

				{/* Description skeleton */}
				<div>
					<div className="h-3 w-20 bg-muted rounded animate-pulse mb-2" />
					<div className="space-y-1">
						<div className="h-3 w-full bg-muted rounded animate-pulse" />
						<div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}


/**
 * Error card component for when request details fail to load
 */
export function RequestDetailErrorCard(): JSX.Element {
	return (
		<Card className="relative border-destructive/50">
			<CardContent className="text-center py-8">
				<div className="space-y-2">
					<p className="text-sm font-medium text-destructive">
						Error
					</p>
					<p className="text-xs text-muted-foreground">
						Ocurrió un error al obtener los detalles de la solicitud.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}