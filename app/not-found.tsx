'use client'

import Image 			from "next/image";
import { useRouter } 	from "next/navigation";

import { Button } from "@/components/ui/button";


export default function Error404() {
	const router = useRouter();

	return (
		<div className="min-h-[calc(100vh-148px)] flex flex-col">
			<main className="flex-1 flex items-center justify-center px-4 py-8 lg:py-16">
				<div className="max-w-6xl mx-auto w-full">
					<div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-8 lg:gap-16">
						{/* Content Section */}
						<div className="flex-1 max-w-lg text-center lg:text-left">
							<div className="space-y-6">
								<div className="space-y-4">
									<h1 className="text-3xl lg:text-4xl font-bold text-foreground">
										404
									</h1>

									<h2 className="text-xl lg:text-2xl font-semibold text-foreground">
										Parece que has encontrado la puerta para llegar a donde querías ☹️
									</h2>

									<p className="text-muted-foreground text-base lg:text-lg">
										Lo sentimos por eso! Visita nuestra página de inicio para llegar a donde necesitas ir.
									</p>
								</div>

								<Button
									onClick     = {() => router.push( '/' )}
									size        = "lg"
									className   = "w-full sm:w-auto"
								>
									Seguir buscando!
								</Button>
							</div>
						</div>

						{/* Images Section */}
						<div className="flex-1 flex flex-col items-center gap-8 lg:gap-12">
							<div className="relative">
								<Image
									src         = "https://i.ibb.co/G9DC8S0/404-2.png"
									alt         = "Error 404 illustration"
									width       = { 350 }
									height      = { 350 }
									className   = "w-64 h-64 lg:w-80 lg:h-80 object-contain"
									priority
								/>
							</div>

							<div className="hidden lg:block">
								<Image
									src         = "https://i.ibb.co/ck1SGFJ/Group.png"
									alt         = "Decorative illustration"
									width       = { 200 }
									height      = { 200 }
									className   = "w-32 h-32 lg:w-48 lg:h-48 object-contain opacity-80"
								/>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
