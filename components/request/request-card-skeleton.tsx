"use client"

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle
}                   from "@/components/ui/card";


/**
 * Skeleton component for RequestCard loading state
 * Displays animated placeholders that match the structure of RequestCard
 */
export function RequestCardSkeleton() {
	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader className="pb-3">
				<div className="space-y-1.5">
					{/* Title skeleton */}
					<CardTitle className="text-md font-medium max-w-full">
						<div className="h-5 w-48 bg-gray-300 rounded animate-pulse" />
					</CardTitle>

					{/* ID skeleton */}
					<div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />

					{/* Status and consecutive badges skeleton */}
					<div className="flex items-center gap-2">
						<div className="h-5 w-20 bg-gray-300 rounded-full animate-pulse" />
						<div className="h-5 w-16 bg-gray-300 rounded-full animate-pulse" />
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-3">
				<div className="space-y-2 text-sm">
					{/* Subject skeleton */}
					<div className="flex items-center gap-2">
						<div className="h-4 w-4 bg-gray-300 rounded animate-pulse" />
						<div className="h-4 w-36 bg-gray-300 rounded animate-pulse" />
					</div>

					{/* Staff skeleton */}
					<div className="flex items-center gap-2">
						<div className="h-4 w-4 bg-gray-300 rounded animate-pulse" />
						<div className="h-4 w-28 bg-gray-300 rounded animate-pulse" />
					</div>

					{/* Date skeleton */}
					<div className="flex items-center gap-2">
						<div className="h-4 w-4 bg-gray-300 rounded animate-pulse" />
						<div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
					</div>
				</div>

				{/* Description skeleton */}
				<div className="space-y-1">
					<div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
					<div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
				</div>

				{/* Footer with badge and buttons skeleton */}
				<div className="flex items-center justify-between pt-2">
					<div className="h-5 w-16 bg-gray-300 rounded-full animate-pulse" />

					<div className="flex items-center gap-2">
						{/* Edit button skeleton */}
						<div className="h-8 w-8 bg-gray-300 rounded border animate-pulse" />

						{/* Delete button skeleton */}
						<div className="h-8 w-8 bg-gray-300 rounded border animate-pulse" />

						{/* View details button skeleton */}
						<div className="h-8 w-24 bg-gray-300 rounded animate-pulse" />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}


/**
 * Component that renders multiple RequestCardSkeleton components in a grid
 * @param count - Number of skeleton cards to display (default: 6)
 */
export function RequestCardSkeletonGrid({ count = 6 }: { count?: number }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{Array.from({ length: count }).map((_, index) => (
				<RequestCardSkeleton key={index} />
			))}
		</div>
	);
}


/**
 * Error card component for displaying error messages
 */
export function RequestErrorCard() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			<Card className="col-span-full">
				<CardContent className="text-center py-8">
					<p className="text-muted-foreground">
						Ocurrió un error al tratar de obtener las solicitudes, intente más tarde.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}