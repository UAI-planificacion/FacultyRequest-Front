"use client"

import { Card, CardContent } from "@/components/ui/card"
import LoaderMini from "@/icons/LoaderMini";
import { cn } from "@/lib/utils"

interface StatisticCardProps {
    title       : string;
    value?      : string | number;
    icon        : React.ReactNode;
    className?  : string;
}


export function StatisticCard({
    title,
    value,
    icon,
    className,
}: StatisticCardProps) {
    return (
        <Card className={cn("p-4 overflow-hidden", className)}>
            <CardContent className="flex justify-between items-center p-0">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 text-muted-foreground flex items-center">{icon}</div>

                    {title}
                </div>

                {value === undefined
                    ? <LoaderMini  />
                    : <div className="text-2xl font-bold">{value}</div>
                }

            </CardContent>
        </Card>
    );
}
