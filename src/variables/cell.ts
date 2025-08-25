// import logger from "clog";
import type { Graph } from "../graph";
import type { CellId } from "../types.ts";
import type { Color } from "./color";
import type { Column } from "./column";
import type { Row } from "./row";

class Cell {
	// #region Properties
	readonly #graph: Graph;
	readonly #corners: Set<Cell> = new Set();
	private readonly _id: CellId;
	private readonly _row: Row;
	private readonly _column: Column;
	private readonly _color: Color;
	// #endregion Properties

	// #region Domain
	private _isQueen: boolean | null = null;
	// #endregion Domain

	public constructor({
		id,
		row,
		column,
		color,
		graph,
	}: { id: number; row: Row; column: Column; color: Color; graph: Graph }) {
		this._id = id as CellId;
		this._row = row;
		this._column = column;
		this._color = color;
		this.#graph = graph;
	}

	public get id(): CellId {
		return this._id;
	}

	public get row(): Row {
		return this._row;
	}

	public get column(): Column {
		return this._column;
	}

	public get color(): Color {
		return this._color;
	}

	public get edges(): ReadonlySet<Cell> {
		return new Set<Cell>()
			.union(this.#corners)
			.union(this._row.cells)
			.union(this._column.cells);
	}

	public get isQueen(): boolean | null {
		return this._isQueen;
	}

	public addCorner(corner: Cell): void {
		if (this.#corners.has(corner)) {
			// logger.warn(`Corner ${corner.id} already exists for cell ${this._id}.`);
		} else {
			this.#corners.add(corner);
			corner.#corners.add(this); // Ensure bidirectional corner
		}
	}

	public removeCorner(corner: Cell): void {
		if (!this.#corners.has(corner)) {
			// logger.warn(`Corner ${corner.id} does not exist for cell ${this._id}.`);
		} else {
			this.#corners.delete(corner);
		}
	}

	public placeQueen(): void {
		// logger.debug(`Placing queen at cell ${this._id}.`);
		this._isQueen = true;
		this._color.queen = this;
		this._row.queen = this;
		this._column.queen = this;
		for (const corner of this.#corners) {
			// logger.debug(`Removing corner ${corner.id} from cell ${this._id}.`);
			corner.placeCross();
		}
		this.#graph.placeQueen(this);
	}

	public placeCross(): void {
		// logger.debug(`Cell - Placing cross at cell ${this._id}.`);
		this._isQueen = false;
		this._color.removeCell(this);
		this._row.removeCell(this);
		this._column.removeCell(this);
		for (const corner of this.#corners) {
			corner.removeCorner(this);
		}
		this.#corners.clear();
		this.#graph.placeCross(this);
	}

	public filter(filterFunction: (cell: Cell) => boolean): boolean {
		if (!filterFunction(this)) {
			this.placeCross();
			return true;
		}
		return false;
	}
}

export { Cell };
