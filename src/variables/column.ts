// import logger from "clog";
import type { Color } from "./color.ts";
import { VariableSet } from "./common.ts";

class Column extends VariableSet {
	public constructor(id: number) {
		super(id, "column");
	}

	protected search(): boolean {
		const colorSet = new Set<Color>();

		for (const cell of this._cells) {
			colorSet.add(cell.color);
		}

		const [color] = colorSet;
		if (colorSet.size === 1 && color && color.columns.size > 1) {
			// logger.debug(
			// 	`Column ${this._id} only has one color left. Removing cells of color ${color.id} in other columns.`,
			// );
			return color.filter((cell) => cell.column === this);
		}
		return false;
	}
}

export { Column };
