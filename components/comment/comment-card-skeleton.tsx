import { JSX } from "react";

import { Card, CardContent } from "@/components/ui/card";


/**
 * Skeleton component for comment cards while loading
 */
export function CommentCardSkeleton(): JSX.Element {
	return (
		<Card className="w-full">
			<CardContent className="p-4">
				<div className="flex items-start space-x-3">
					{/* Avatar skeleton */}
					<div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse flex-shrink-0" />
					
					<div className="flex-1 space-y-2">
						{/* Author info skeleton */}
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								{/* Name skeleton */}
								<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-24" />
								
								{/* Badge skeleton */}
								<div className="h-5 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse w-12" />
							</div>
							
							{/* Date skeleton */}
							<div className="h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-20" />
						</div>
						
						{/* Content skeleton */}
						<div className="space-y-2">
							<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-full" />
							<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-3/4" />
							<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-1/2" />
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}


/**
 * Multiple comment skeletons for loading state
 */
export function CommentsSkeleton({ count = 3 }: { count?: number }): JSX.Element {
	return (
		<div className="space-y-4">
			{Array.from({ length: count }).map((_, index) => (
				<CommentCardSkeleton key={index} />
			))}
		</div>
	);
}