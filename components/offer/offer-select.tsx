"use client"

import {
    useState,
    useMemo,
    useCallback,
    useRef,
    useLayoutEffect,
    JSX
}                   from "react";
import type React   from "react"

import { Check, ChevronDown, Search }   from "lucide-react";
import { FixedSizeList as List }        from "react-window";
import { useQuery }                     from '@tanstack/react-query';

import {
    Popover,
    PopoverContent,
    PopoverTrigger
}                           from "@/components/ui/popover";
import {
    SessionShort,
    getSessionCounts
}                           from "@/components/section/session-short";
import { Button }           from "@/components/ui/button";
import { Input }            from "@/components/ui/input";
import { Badge }            from "@/components/ui/badge";
import { SpaceSizeType }    from "@/components/shared/space-size-type";

import { Offer }            from "@/types/offer.model";
import { KEY_QUERYS }       from "@/consts/key-queries";
import { fetchApi }         from "@/services/fetch";
import { cn }               from "@/lib/utils";
import LoaderMini           from "@/icons/LoaderMini";


interface Props {
    facultyId           : string;
    value?              : string;
    placeholder?        : string;
    searchPlaceholder?  : string;
    className?          : string;
    onSelectionChange?  : ( selectedValue: string | undefined ) => void;
    disabled?           : boolean;
}


const ITEM_HEIGHT   = 50;
const MAX_HEIGHT    = 400;


export function OfferSelect({
    facultyId,
    value,
    placeholder = "Seleccionar oferta...",
    searchPlaceholder = "Buscar por asignatura o período...",
    className,
    onSelectionChange,
    disabled = false,
}: Props ): JSX.Element {
    const [open, setOpen]                   = useState( false );
    const [searchValue, setSearchValue]     = useState( "" );
    const listRef                           = useRef<List>( null );
    const scrollContainerRef                = useRef<HTMLDivElement>( null );
    const triggerRef                        = useRef<HTMLButtonElement>( null );
    const [triggerWidth, setTriggerWidth]   = useState<number>( 0 );


    useLayoutEffect(() => {
        if ( triggerRef.current ) {
            setTriggerWidth( triggerRef.current.offsetWidth );
        }
    }, [ open, triggerRef ]);

    // Fetch offers
    const {
        data: offerList,
        isLoading,
        isError
    } = useQuery({
        queryKey    : [ KEY_QUERYS.OFFERS, facultyId ],
        queryFn     : () => fetchApi<Offer[]>({ url: `offers/facultyId/${facultyId}` }),
        enabled     : !!facultyId
    });

    // Filter offers based on search
    const filteredOffers = useMemo(() => {
        if ( !offerList ) return [];
        if ( !searchValue ) return offerList;

        const searchLower = searchValue.toLowerCase();
        return offerList.filter( offer => 
            offer.subject.id.toLowerCase().includes( searchLower ) ||
            offer.subject.name.toLowerCase().includes( searchLower ) ||
            offer.period.id.toLowerCase().includes( searchLower ) ||
            offer.period.name.toLowerCase().includes( searchLower )
        );
    }, [ offerList, searchValue ]);

    // Get selected offer for display
    const selectedOffer = useMemo(() => {
        if ( !value || !offerList ) return null;
        return offerList.find( offer => offer.id === value ) || null;
    }, [ value, offerList ]);

    // Handle offer selection
    const handleOfferSelect = useCallback(
        ( offerId: string ) => {
            onSelectionChange?.( offerId );
            setOpen( false );
        },
        [ onSelectionChange ]
    );

    // Render virtualized offer item
    const renderOfferItem = useCallback(
        ({ index, style }: { index: number; style: React.CSSProperties }) => {
            const offer = filteredOffers[index];
            const isSelected = value === offer.id;

            return (
                <div style={ style } className="px-1">
                    <div
                        className={ cn(
                            "flex gap-2 p-3 text-sm cursor-pointer rounded-md hover:bg-accent transition-colors border-b border-border/50",
                            isSelected && "bg-accent"
                        )}
                        onClick={ () => handleOfferSelect( offer.id )}
                    >
                        {/* Header with space type and period */}
                        <SpaceSizeType
                            spaceType   = { offer.spaceType }
                            spaceSizeId = { offer.spaceSize?.id }
                        />

                        <Badge variant="outline" className="text-xs">
                            { offer.period.id } - { offer.period.name }
                        </Badge>

                        {/* Subject info */}
                        <Badge variant="secondary" className="text-xs font-mono">
                            { offer.subject.id }
                        </Badge>

                        {/* Sessions */}
                        <SessionShort 
                            sessionCounts   = { getSessionCounts( offer )}
                            showZero        = { true }
                        />

                        { isSelected && (
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                    </div>
                </div>
            );
        },
        [ filteredOffers, value, handleOfferSelect ]
    );

    return (
        <Popover open={ open } onOpenChange={ setOpen }>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={ open }
                    className={ cn( "w-full justify-between min-h-10", className )}
                    ref={ triggerRef }
                    disabled={ disabled }
                >
                    <div className="flex flex-wrap gap-1 flex-grow-0 min-w-0 mr-2">
                        { selectedOffer ? (
                            <div className="flex items-center gap-2 truncate">
                                <SpaceSizeType
                                    spaceType   = { selectedOffer.spaceType }
                                    spaceSizeId = { selectedOffer.spaceSize?.id }
                                />

                                <Badge variant="outline" className="text-xs">
                                    { selectedOffer.period.id } - { selectedOffer.period.name }
                                </Badge>

                                {/* Subject info */}
                                <Badge variant="secondary" className="text-xs font-mono">
                                    { selectedOffer.subject.id }
                                </Badge>

                                {/* Sessions */}
                                <SessionShort 
                                    sessionCounts   = { getSessionCounts( selectedOffer )}
                                    showZero        = { true }
                                />
                            </div>
                        ) : (
                            <span className="truncate">{ placeholder }</span>
                        )}
                    </div>

                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className               = "w-full p-0 -mr-1.5 z-[9999]"
                style                   = {{ width: triggerWidth }}
                align                   = "start"
                side                    = "bottom"
                sideOffset              = { 4 }
                avoidCollisions         = { true }
                onOpenAutoFocus         = { ( e ) => e.preventDefault() }
                onCloseAutoFocus        = { ( e ) => e.preventDefault() }
                onWheel                 = { ( e ) => e.stopPropagation() }
                onPointerDownOutside    = { ( e ) => e.stopPropagation() }
            >
                <div className="flex items-center border-b px-3 py-2 w-full">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />

                    <Input
                        placeholder = { searchPlaceholder }
                        value       = { searchValue }
                        onChange    = {( e ) => setSearchValue( e.target.value )}
                        className   = "border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8"
                        onWheel     = {( e ) => e.stopPropagation() }
                    />
                </div>

                <div
                    ref         ={ scrollContainerRef }
                    className   = "max-h-[400px] overflow-x-hidden overflow-y-auto mt-1"
                    onWheel     ={( e ) => e.stopPropagation() }
                >
                    { isLoading ? (
                        <div className="py-6 px-4 flex flex-col items-center justify-center space-y-3">
                            <LoaderMini />
                            <span className="text-sm text-muted-foreground">Cargando ofertas...</span>
                        </div>
                    ) : isError ? (
                        <div className="py-6 text-center text-sm text-destructive">
                            Error al cargar las ofertas
                        </div>
                    ) : filteredOffers.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            No se encontraron ofertas.
                        </div>
                    ) : (
                        <List
                            ref         = { listRef }
                            height      = { Math.min( filteredOffers.length * ITEM_HEIGHT, MAX_HEIGHT )}
                            itemCount   = { filteredOffers.length }
                            itemSize    = { ITEM_HEIGHT }
                            width       = "100%"
                        >
                            { renderOfferItem }
                        </List>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
