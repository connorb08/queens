// import logger from "clog";
import type { Color } from "./color.ts";
import { VariableSet } from "./common.ts";

class Row extends VariableSet {
	public constructor(id: number) {
		super(id, "row");
	}

	protected search(): boolean {
		const colorSet = new Set<Color>();

		for (const cell of this._cells) {
			colorSet.add(cell.color);
		}

		const [color] = colorSet;
		if (colorSet.size === 1 && color) {
			// logger.debug(
			// 	`Row ${this._id} only has one color left. Removing cells of color ${color.id} in other rows.`,
			// );
			return color.filter((cell) => cell.row === this);
		}
		return false;
	}
}

export { Row };
