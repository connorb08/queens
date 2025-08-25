declare const __brand: unique symbol;
type Brand<B> = { [__brand]: B };
export type Branded<T, B> = T & Brand<B>;

type ColorId = Branded<number, "ColorId">;
type CellId = Branded<number, "CellId">;
type RowId = Branded<number, "RowId">;
type ColumnId = Branded<number, "ColumnId">;

interface ColorInfo {
	id: number;
	name: string;
	hex: string;
}

export type { ColorInfo, ColorId, CellId, RowId, ColumnId };

export type QueensSolution = {
	cellColors: number[];
	cellsRemoved: number[];
	colors: string[];
	queenPositions: number[];
	sideLength: number;
};
