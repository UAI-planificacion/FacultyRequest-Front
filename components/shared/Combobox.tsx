"use client"

import type React from "react"
import { useState, useMemo, useCallback, useRef, useEffect, useLayoutEffect } from "react";

import { Check, ChevronDown, X, Search } from "lucide-react";
import { FixedSizeList as List } from "react-window";

import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import LoaderMini from "@/icons/LoaderMini";


export type Option = {
    id?: string
    label: string
    value: string
}

export type GroupOption = {
    id?: string
    name: string
    options: Option[]
}


export type ComboboxItem = Option | GroupOption


export function isGroupOption(item: ComboboxItem): item is GroupOption {
    return "options" in item && Array.isArray(item.options)
}


interface ComboboxProps {
    isOpen?: boolean;
    options: ComboboxItem[];
    defaultValues?: string[] | string;
    placeholder?: string;
    searchPlaceholder?: string;
    className?: string;
    onSelectionChange?: (selectedValues: string[] | string | undefined) => void; // Puede ser undefined ahora
    maxDisplayItems?: number;
    multiple?: boolean;
    required?: boolean;
    isLoading?: boolean;
    disabled?: boolean;
}

interface FlattenedItem {
    type: "option" | "group";
    option?: Option;
    group?: GroupOption;
    groupIndex?: number;
    isGroupHeader?: boolean;
}

const ITEM_HEIGHT = 40
const MAX_HEIGHT = 300

export function MultiSelectCombobox({
    isOpen = false,
    options,
    defaultValues = [],
    placeholder = "Seleccionar opciones...",
    searchPlaceholder = "Buscar...",
    className,
    onSelectionChange,
    maxDisplayItems = 1,
    multiple = true,
    required = false,
    isLoading = false,
    disabled = false,
}: ComboboxProps) {
    const [open, setOpen] = useState( isOpen );
    const [searchValue, setSearchValue] = useState( "" );

    // Normalize defaultValues to a Set for efficient lookups
    const initialSelectedValues = useMemo(() => {
        if (multiple) {
            return new Set(Array.isArray(defaultValues) ? defaultValues : []);
        } else {
            // For single select, if defaultValues is undefined/null/empty string, treat as no selection
            const val = Array.isArray(defaultValues) ? defaultValues[0] : defaultValues;
            return new Set(val ? [val] : []);
        }
    }, [defaultValues, multiple]);

    const [selectedValues, setSelectedValues] = useState<Set<string>>(initialSelectedValues);

    // Sync internal state with external defaultValues changes
    useEffect(() => {
        setSelectedValues(initialSelectedValues);
    }, [initialSelectedValues]);


    const listRef = useRef<List>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)
    const [triggerWidth, setTriggerWidth] = useState<number>(0);

    useLayoutEffect(() => {
        if (triggerRef.current) {
            setTriggerWidth(triggerRef.current.offsetWidth)
        }
    }, [open, triggerRef])

    // Flatten options for virtualization (unchanged)
    const flattenedItems = useMemo(() => {
        const items: FlattenedItem[] = []

        options.forEach((item, groupIndex) => {
            if (isGroupOption(item)) {
                items.push({
                    type: "group",
                    group: item,
                    groupIndex,
                    isGroupHeader: true,
                })
                item.options.forEach((option: Option) => {
                    items.push({
                        type: "option",
                        option,
                        group: item,
                        groupIndex,
                    })
                })
            } else {
                items.push({
                    type: "option",
                    option: item,
                })
            }
        })
        return items
    }, [options])

    // Filter items based on search (unchanged)
    const filteredItems = useMemo(() => {
        if (!searchValue) return flattenedItems

        const filtered: FlattenedItem[] = []
        const searchLower = searchValue.toLowerCase()

        options.forEach((item, groupIndex) => {
            if (isGroupOption(item)) {
                const matchingOptions = item.options.filter(
                    (option: Option) =>
                        option.label.toLowerCase().includes(searchLower) || option.value.toLowerCase().includes(searchLower),
                )

                if (matchingOptions.length > 0 || item.name.toLowerCase().includes(searchLower)) {
                    filtered.push({
                        type: "group",
                        group: item,
                        groupIndex,
                        isGroupHeader: true,
                    })

                    const optionsToAdd = item.name.toLowerCase().includes(searchLower) ? item.options : matchingOptions
                    optionsToAdd.forEach((option: Option) => {
                        filtered.push({
                            type: "option",
                            option,
                            group: item,
                            groupIndex,
                        })
                    })
                }
            } else {
                if (item.label.toLowerCase().includes(searchLower) || item.value.toLowerCase().includes(searchLower)) {
                    filtered.push({
                        type: "option",
                        option: item,
                    })
                }
            }
        })

        return filtered
    }, [flattenedItems, searchValue, options])

    // Handle option selection
    const handleOptionToggle = useCallback(
        (value: string) => {
            if (!multiple) {
                // Modo de selección única:
                const newSelected = new Set<string>();
                if (selectedValues.has(value)) {
                    // Si el valor ya está seleccionado, intentar deseleccionar.
                    // Si el campo es requerido, no permitir deseleccionar.
                    if (required) {
                        newSelected.add(value); // Si es requerido, se mantiene seleccionado
                    } else {
                        // Si no es requerido, se deselecciona (Set queda vacío)
                        // Esto hará que onSelectionChange emita `undefined`
                    }
                } else {
                    // Si no está seleccionado, seleccionar este valor (y deseleccionar cualquier otro)
                    newSelected.add(value);
                }
                setSelectedValues(newSelected);
                // Emitir `undefined` si no hay selección para campos no requeridos
                onSelectionChange?.(newSelected.size === 0 ? undefined : Array.from(newSelected)[0]);
                setOpen(false); // Cerrar después de seleccionar en modo single
            } else {
                // Modo de selección múltiple (lógica actual, no cambia)
                const newSelected = new Set(selectedValues)
                if (newSelected.has(value)) {
                    newSelected.delete(value)
                } else {
                    newSelected.add(value)
                }
                setSelectedValues(newSelected)
                onSelectionChange?.(Array.from(newSelected))
            }
        },
        [selectedValues, onSelectionChange, multiple, required],
    )

    // Handle group selection (only relevant for multiple mode, no change needed for this spec)
    const handleGroupToggle = useCallback(
        (group: GroupOption) => {
            const groupValues = group.options.map((opt: Option) => opt.value)
            const newSelected = new Set(selectedValues)

            const allSelected = groupValues.every((value: string) => newSelected.has(value))

            if (allSelected) {
                groupValues.forEach((value: string) => newSelected.delete(value))
            } else {
                groupValues.forEach((value: string) => newSelected.add(value))
            }

            setSelectedValues(newSelected)
            onSelectionChange?.(Array.from(newSelected))
        },
        [selectedValues, onSelectionChange],
    )

    // Remove selected item (only relevant for multiple mode, no change needed for this spec)
    const handleRemoveItem = useCallback(
        (value: string) => {
            const newSelected = new Set(selectedValues)
            newSelected.delete(value)
            setSelectedValues(newSelected)
            onSelectionChange?.(Array.from(newSelected))
        },
        [selectedValues, onSelectionChange],
    )

    // Get selected options for display
    const selectedOptions = useMemo(() => {
        const selected: Option[] = []
        options.forEach((item) => {
            if (isGroupOption(item)) {
                item.options.forEach((option: Option) => {
                    if (selectedValues.has(option.value)) {
                        selected.push(option)
                    }
                })
            } else {
                if (selectedValues.has(item.value)) {
                    selected.push(item)
                }
            }
        })
        return selected
    }, [options, selectedValues])

    // Check if group is fully selected (unchanged)
    const isGroupSelected = useCallback(
        (group: GroupOption) => {
            return group.options.every((option: Option) => selectedValues.has(option.value))
        },
        [selectedValues],
    )

    // Check if group is partially selected (unchanged)
    const isGroupPartiallySelected = useCallback(
        (group: GroupOption) => {
            const selectedCount = group.options.filter((option: Option) => selectedValues.has(option.value)).length
            return selectedCount > 0 && selectedCount < group.options.length
        },
        [selectedValues],
    )

    // Render virtualized item (unchanged, as the logic for selection is in handleOptionToggle)
    const renderItem = useCallback(
        ({ index, style }: { index: number; style: React.CSSProperties }) => {
            const item = filteredItems[index]

            if (item.isGroupHeader && item.group && multiple) {
                const isSelected = isGroupSelected(item.group)
                const isPartial = isGroupPartiallySelected(item.group)

                return (
                    <div style={style} className="px-1">
                        <div
                            className={cn(
                                "flex items-center px-3 py-2 text-sm font-medium cursor-pointer rounded-md hover:bg-accent transition-colors",
                                isSelected && "bg-accent",
                            )}
                            onClick={() => handleGroupToggle(item.group!)}
                        >
                            <div
                                className={cn(
                                    "flex items-center justify-center w-4 h-4 mr-3 border rounded-sm flex-shrink-0",
                                    isSelected ? "bg-primary border-primary" : "border-input",
                                    isPartial && "bg-primary/50 border-primary",
                                )}
                            >
                                {(isSelected || isPartial) && <Check className="w-3 h-3 text-primary-foreground" />}
                            </div>
                            <span className="text-muted-foreground flex-1 truncate pr-2 leading-5" title={item.group.name}>{item.group.name}</span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                                ({item.group.options.filter((opt: Option) => selectedValues.has(opt.value)).length}/{item.group.options.length})
                            </span>
                        </div>
                    </div>
                )
            }

            if (item.isGroupHeader && !multiple) {
                return null // No show group headers in single selection mode
            }

            if (item.option) {
                const isSelected = selectedValues.has(item.option.value)

                return (
                    <div style={style} className="px-1">
                        <div
                            className={cn(
                                "flex items-center px-3 py-2 text-sm cursor-pointer rounded-md hover:bg-accent transition-colors",
                                isSelected && "bg-accent",
                                item.group && multiple && "ml-4", // Only indent if multiple and has group
                            )}
                            onClick={() => handleOptionToggle(item.option!.value)}
                        >
                            {multiple && (
                                <div
                                    className={cn(
                                        "flex items-center justify-center w-4 h-4 mr-3 border rounded-sm flex-shrink-0",
                                        isSelected ? "bg-primary border-primary" : "border-input",
                                    )}
                                >
                                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                                </div>
                            )}
                            <span className="flex-1 truncate pr-2 leading-5" title={item.option.label}>{item.option.label}</span>

                            {!multiple && isSelected && (
                                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                        </div>
                    </div>
                )
            }

            return null
        },
        [filteredItems, selectedValues, isGroupSelected, isGroupPartiallySelected, handleGroupToggle, handleOptionToggle, multiple],
    )

    useEffect(() => {
        const handleScroll = (event: Event) => event.stopPropagation();

        if (scrollContainerRef.current) {
            scrollContainerRef.current.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (scrollContainerRef.current) {
                scrollContainerRef.current.removeEventListener('scroll', handleScroll);
            }
        };
    }, [scrollContainerRef]);

    return (
        <Popover open={disabled ? false : (isOpen ? true : open)} onOpenChange={disabled ? undefined : setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between min-h-10", className)}
                    ref={triggerRef}
                    disabled={disabled}
                >
                    <div className="flex flex-wrap gap-1 flex-grow-0 min-w-0 mr-2">
                        {/* Lógica de display para el botón */}
                        {selectedOptions.length === 0 ? (
                            <span className="truncate">{placeholder}</span>
                        ) : !multiple ? (
                            // Modo selección única: mostrar solo el texto de la opción seleccionada
                            <span className="truncate flex-1 min-w-0">
                                {selectedOptions[0]?.label}
                            </span>
                        ) : selectedOptions.length <= maxDisplayItems ? (
                            // Modo múltiple: mostrar badges con X para eliminar
                            selectedOptions.map((option) => (
                                <Badge key={option.value} variant="secondary" className="text-xs">
                                    {option.label}
                                    <X
                                        className="ml-1 h-3 w-3 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleRemoveItem(option.value)
                                        }}
                                    />
                                </Badge>
                            ))
                        ) : (
                            <Badge variant="secondary" className="text-xs">
                                {selectedOptions.length} seleccionados
                            </Badge>
                        )}
                    </div>

                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-full p-0 -mr-1.5 z-[9999]"
                style={{ width: triggerWidth }}
                align="start"
                side="bottom"
                sideOffset={4}
                avoidCollisions={true}
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
                onWheel={(e) => e.stopPropagation()}
                onPointerDownOutside={(e) => e.stopPropagation()}
            >
                <div className="flex items-center border-b px-3 py-2 w-full">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />

                    <Input
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8"
                        onWheel={(e) => e.stopPropagation()}
                    />
                </div>
                <div
                    ref={scrollContainerRef}
                    className="max-h-[300px] overflow-x-hidden overflow-y-auto mt-1"
                    onWheel={(e) => e.stopPropagation()}
                >
                    {isLoading ? (
                        <div className="py-6 px-4 flex flex-col items-center justify-center space-y-3">
                            <LoaderMini />
                            <span className="text-sm text-muted-foreground">Cargando información...</span>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">No se encontraron opciones.</div>
                    ) : (
                        <List
                            ref={listRef}
                            height={Math.min(filteredItems.length * ITEM_HEIGHT, MAX_HEIGHT)}
                            itemCount={filteredItems.length}
                            itemSize={ITEM_HEIGHT}
                            width="100%"
                        >
                            {renderItem}
                        </List>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

export type { ComboboxProps }