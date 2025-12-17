'use client'

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";


interface PageLayoutProps {
	title       : string;
	children    : React.ReactNode;
	actions?    : React.ReactNode;
	showBack?   : boolean;
}

/**
 * Standard page layout component for consistent formatting across all pages
 */
export function PageLayout({ 
	title, 
	children, 
	actions, 
	showBack = true 
}: PageLayoutProps) {
	const router = useRouter();


	return (
		<div className="container mx-auto flex flex-col h-[calc(100vh-125px)]">
			{/* Header */}
			<header className="flex-shrink-0 flex justify-between items-center gap-4 mb-4">
				<div className="flex items-center gap-4">
					{showBack && (
						<Button
							onClick = { () => router.back() }
							size    = "icon"
							variant = "secondary"
						>
							<ArrowLeft className="w-4 h-4" />
						</Button>
					)}

					<h1 className="text-3xl font-bold">
						{ title }
					</h1>
				</div>

				{actions && (
					<div className="flex items-center gap-2">
						{ actions }
					</div>
				)}
			</header>

			{/* Content */}
			<div className="flex-1 overflow-hidden space-y-4">
				{ children }
			</div>
		</div>
	);
}
