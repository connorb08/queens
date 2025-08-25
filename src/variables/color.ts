// import logger from "clog";
import type { Column } from "./column.ts";
import { VariableSet } from "./common.ts";
import type { Row } from "./row.ts";

class Color extends VariableSet {
	public constructor({
		id,
		name,
		value,
	}: { id: number; name: string; value: string }) {
		super(id, "color");
		this._name = name;
		this._value = value;
	}

	// #region Properties
	private readonly _name: string;
	private readonly _value: string;
	// #endregion Properties

	public get name(): string {
		return this._name;
	}

	public get value(): string {
		return this._value;
	}

	public get rows(): ReadonlySet<Row> {
		const rows: Set<Row> = new Set();
		for (const cell of this._cells) {
			rows.add(cell.row);
		}
		return rows;
	}

	public get columns(): ReadonlySet<Column> {
		const columns: Set<Column> = new Set();
		for (const cell of this._cells) {
			columns.add(cell.column);
		}
		return columns;
	}

	protected search(): boolean {
		/**
		 * All cells of this color are in the same row
		 * We can remove all cells in this row that are a different color
		 */
		const [row] = this.rows;
		if (this.rows.size === 1 && row) {
			// logger.debug(
			// 	`All remaining cells of color ${this.id} are in Row ${row.id}. Removing cells of a different color in the row.`,
			// );
			return row.filter((cell) => cell.color === this);
		}
		/**
		 * All cells of this color are in the same column
		 * We can remove all cells in this column that are a different color
		 */
		if (this.columns.size === 1) {
			const [firstColumn] = this.columns;
			if (!firstColumn) {
				// logger.error("No column found for color search.");
				return false;
			}
			return firstColumn.filter((cell) => cell.color === this);
		}
		for (const column of this.columns) {
			// all cells in this column are of this color, remove cells in other columns
			if (column.cells.isSubsetOf(this._cells)) {
				let filtered = false;
				for (const cell of this._cells) {
					filtered ||= cell.filter((c) => c.column === column);
				}
				return filtered;
			}
		}
		for (const row of this.rows) {
			// all cells in this row are of this color, remove cells in other rows
			if (row.cells.isSubsetOf(this._cells)) {
				let filtered = false;
				for (const cell of this._cells) {
					filtered ||= cell.filter((c) => c.row === row);
				}
				return filtered;
			}
		}

		return false;
	}
}

export { Color };
