export type SizeId = "XS" | "XE" | "S" | "SE" | "MS" | "M" | "L" | "XL" | "XXL";

export interface Size {
	id          : SizeId;
	detail      : string;
	min?        : number;
	max?        : number;
	greaterThan?: number;
	lessThan?   : number;
}

export interface SizeSave {
	id          : SizeId;
	detail      : string;
	min?        : number;
	max?        : number;
	greaterThan?: number;
	lessThan?   : number;
}

export type Sizes = Size;
