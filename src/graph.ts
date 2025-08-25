import type { CellId, QueensSolution } from "./types.ts";
import { combinations } from "./utils/index.ts";
import { Cell } from "./variables/cell.ts";
import { Color } from "./variables/color.ts";
import { Column } from "./variables/column.ts";
import { Row } from "./variables/row.ts";

class Graph {
	// #region Properties
	private readonly _cells: Set<Cell> = new Set();
	private readonly _cellMap: Map<CellId, Cell> = new Map();
	private readonly _colors: Set<Color> = new Set();
	private readonly _rows: Set<Row> = new Set();
	private readonly _columns: Set<Column> = new Set();
	// #endregion Properties

	// Game Data
	#sideLength = -1;
	readonly #queenPositions: number[] = [];
	readonly #colors: string[] = [];
	readonly #cellColors: number[] = [];
	readonly #cellsRemoved: number[] = [];

	get #solved(): boolean {
		return this.#queenPositions.length === this.#sideLength;
	}

	public get solution(): QueensSolution {
		return {
			sideLength: this.#sideLength,
			colors: this.#colors,
			cellColors: this.#cellColors,
			cellsRemoved: this.#cellsRemoved,
			queenPositions: this.#queenPositions,
		};
	}

	public placeQueen(cell: Cell): void {
		this.#queenPositions.push(cell.id);
	}

	public placeCross(cell: Cell): void {
		this.#cellsRemoved.push(cell.id);
	}

	// #region Constructor
	public constructor() {
		return;
	}
	// #endregion Constructor

	// #region Getters
	public get rows(): ReadonlySet<Row> {
		return this._rows;
	}
	public get columns(): ReadonlySet<Column> {
		return this._columns;
	}
	public get cells(): ReadonlySet<Cell> {
		return this._cells;
	}
	public get colors(): ReadonlySet<Color> {
		return this._colors;
	}
	public get sideLength(): number {
		return this.#sideLength;
	}
	// #endregion Getters

	// #region Setters

	public set sideLength(value: number) {
		if (value <= 0) {
			throw new Error("Side length must be a positive integer.");
		}
		this.#sideLength = value;
	}

	// #endregion Setters

	// #region Methods

	private _getRow(rowId: number): Row {
		for (const row of this._rows) {
			if (row.id === rowId) {
				return row;
			}
		}
		// logger.debug("Creating new row", { rowId });
		const row = new Row(rowId);
		this._rows.add(row);
		return row;
	}

	private _getColumn(columnId: number): Column {
		for (const column of this._columns) {
			if (column.id === columnId) {
				return column;
			}
		}
		// logger.debug("Creating new column", { columnId });
		const column = new Column(columnId);
		this._columns.add(column);
		return column;
	}

	private _getColor(colorId: number, colorName: string, value: string): Color {
		for (const color of this._colors) {
			if (color.id === colorId) {
				return color;
			}
		}
		// logger.debug("Creating new color", { colorId, colorName, value });
		const color = new Color({ id: colorId, name: colorName, value });
		this._colors.add(color);
		this.#colors[color.id] = color.value;
		return color;
	}

	public print(): void {
		for (let rowId = 0; rowId < this.#sideLength; rowId++) {
			const rowCellValues: string[] = [];
			for (let columnId = 0; columnId < this.#sideLength; columnId++) {
				const cellId = rowId * this.#sideLength + columnId;
				const cell = this._cellMap.get(cellId as CellId);
				if (cell) {
					if (cell.isQueen === null) {
						rowCellValues.push(cell.color.id.toString());
					} else if (cell.isQueen) {
						rowCellValues.push("Q");
					} else {
						rowCellValues.push("X");
					}
				}
			}
			console.log(rowCellValues);
		}
	}

	public addCell({
		id,
		rowId,
		columnId,
		colorInfo,
	}: {
		id: number;
		rowId: number;
		columnId: number;
		colorInfo: { id: number; name: string; value: string };
	}): void {
		// logger.debug(`Adding cell ${id}`);
		const row = this._getRow(rowId);
		const column = this._getColumn(columnId);
		const color = this._getColor(colorInfo.id, colorInfo.name, colorInfo.value);
		const cell = new Cell({
			id,
			row,
			column,
			color,
			graph: this,
		});
		this._cells.add(cell);
		row.addCell(cell);
		column.addCell(cell);
		color.addCell(cell);
		this._cellMap.set(id as CellId, cell);
		this.#cellColors.push(color.id);

		// Add diagonal edges to the top left and top right cells
		// creating an edge is bidirectional
		// bottom left and bottom right cells will also be connected on the next iteration
		if (rowId > 0 && columnId > 0) {
			const topLeftCellId = (rowId - 1) * this.#sideLength + (columnId - 1);
			const topLeftCell = this._cellMap.get(topLeftCellId as CellId);
			if (topLeftCell) {
				cell.addCorner(topLeftCell);
			}
		}
		if (rowId > 0 && columnId < this.#sideLength - 1) {
			const topRightCellId = (rowId - 1) * this.#sideLength + (columnId + 1);
			const topRightCell = this._cellMap.get(topRightCellId as CellId);
			if (topRightCell) {
				cell.addCorner(topRightCell);
			}
		}
	}

	// #region Methods

	public findSolution(): QueensSolution {
		let constraintUpdated = true;
		search: while (constraintUpdated) {
			if (this.#solved) {
				// logger.debug("Solution found");
				return this.solution;
			}

			constraintUpdated = false;

			for (const row of this._rows) {
				// logger.debug(`Searching row ${row.id}`);
				// continue local search until no more constraints are updated
				while (row.localSearch()) {
					constraintUpdated = true;
				}
			}

			for (const column of this._columns) {
				// logger.debug(`Searching column ${column.id}`);
				// continue local search until no more constraints are updated
				while (column.localSearch()) {
					constraintUpdated = true;
					// continue;
				}
			}

			for (const color of this._colors) {
				// logger.debug(`Searching color ${color.id}`);
				// continue local search until no more constraints are updated
				while (color.localSearch()) {
					constraintUpdated = true;
				}
			}

			if (constraintUpdated) {
				continue;
			}

			// Find  combination of all color sets. we only have to look at 2 or more colors, local search for 1 color is alrady done
			// For a group of x colors, if each color has x columns or x rows,
			// and each color in the group has the same columns or rows (use set calculation),
			// then all other cells in that column or row can be removed
			// Example: 3 colors all occupy the same 3 columns, then all other colored cells in those columns can be removed because they cannot be queens
			// This is a very expensive operation, so it should be done only when necessary when the other local searches have not found a solution
			// logger.debug("Searching for color combinations");
			for (let k = 2; k < this._colors.size; k++) {
				const combinationSet = combinations(this._colors, k);
				// dont find all combinations at once, only for current k
				for (const colorSet of combinationSet) {
					const [firstColor] = colorSet;
					if (!firstColor) {
						continue;
					}
					let sharedRows = new Set<Row>(firstColor.rows);
					// .difference(this._cells);
					let sharedColumns = new Set<Column>(firstColor.columns);

					for (const color of colorSet) {
						sharedRows = sharedRows.union(color.rows);
						sharedColumns = sharedColumns.union(color.columns);
					}

					// Check if x colors all share exactly x rows
					if (sharedRows.size === colorSet.size) {
						// Remove all other colored cells from these rows
						for (const row of sharedRows) {
							if (row.filter((c) => colorSet.has(c.color))) {
								constraintUpdated = true;
								break;
							}
						}
						if (constraintUpdated) {
							continue search;
						}
					}

					// Check if x colors all share exactly x columns
					if (sharedColumns.size === colorSet.size) {
						// Remove all other colored cells from these columns
						for (const column of sharedColumns) {
							if (column.filter((c) => colorSet.has(c.color))) {
								constraintUpdated = true;
								break;
							}
						}
						if (constraintUpdated) {
							continue search;
						}
					}
				}
			}
		}

		return this.solution as QueensSolution;
	}
}

export { Graph };
