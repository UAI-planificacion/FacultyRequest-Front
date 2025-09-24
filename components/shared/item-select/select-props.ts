export interface Props {
    defaultValues       : string | string[] | undefined;
    onSelectionChange?  : ( selectedValues: string[] | string | undefined ) => void;
    multiple?           : boolean;
    label?              : string;
    placeholder?        : string;
    enabled?            : boolean;
    disabled?           : boolean;
    className?          : string;
    queryKey?           : string[];
    url?                : string;
}
