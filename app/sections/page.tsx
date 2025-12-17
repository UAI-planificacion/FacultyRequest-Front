'use client'

import { useSearchParams } from "next/navigation";


import { SectionMain }  from "@/components/section/section-main"
import { PageLayout }   from "@/components/layout";


export default function SectionPage() {
    const searchParams = useSearchParams();

    return (
        <PageLayout
            title="Administrador de Secciones"
        >
            <SectionMain
                searchParams={ searchParams }
            />
        </PageLayout>
    )
}