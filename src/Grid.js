/**
 * @class Grid
 * This class is a generic grid containing anything
 * When new items are needed (when the grid changes size and gets larger)
 * an event is fired : "rebuild" which can be handled to construct cell content.
 */
import Events from 'events';

class Grid {
	constructor() {
        this._cells = null;
        this._width = 0;
        this._height = 0;
        this._events = new Events();
	}

    on(...args) { this._events.on(...args); return this; }
    off(...args) { this._events.off(...args); return this; }
    one(...args) { this._events.once(...args); return this; }
    emit(...args) { this._events.emit(...args); return this; }


    /**
	 * Setter/Getter for a dimensionnal array of cells, wich represents the grid content.
     * @param (x) {array}
     */
	set cells(x) {
        if (x !== undefined) {
            this._height = x.length;
            if (this._height) {
            	this._width = x[0].length;
			} else {
                this._width = 0;
			}
        }
		this._cells = x;
	}

	get cells() {
		return this._cells;
	}

	iterate(f) {
        const w = this.width;
        const h = this.height;
		for (let y = 0; y < h; ++y) {
			for (let x = 0; x < w; ++x) {
				this.cell(x, y, f(x, y, this.cell(x, y)));
			}
		}
	}

	_clipAxis(nStart, nRegionWidth, nGridWidth) {
		const nEnd = nStart + nRegionWidth - 1;
        if (nEnd < 0 && nStart < 0) {
            return false;
        }
        if (nEnd >= nGridWidth && nStart >= nGridWidth) {
            return false;
        }
        if (nStart < 0 && nEnd >= nGridWidth) {
        	return {n: 0, w: nGridWidth};
		}
		let n = nStart;
        let w = nRegionWidth;
		if (n < 0) {
			w += n;
			n = 0;
		}
		if ((n + w) > nGridWidth) {
			w = nGridWidth - n;
		}
		return {n, w};
	}

	getRegion(xRegion, yRegion, wRegion, hRegion) {
        const wGrid = this.width;
        const hGrid = this.height;
        const xClip = this._clipAxis(xRegion, wRegion, wGrid);
        const yClip = this._clipAxis(yRegion, hRegion, hGrid);
        if (xClip === false || yClip === false) {
        	return false;
		}
		return {
        	x: xClip.n,
			y: yClip.n,
			width: xClip.w,
			height: yClip.w
		};
	}

	iterateRegion(xRegion, yRegion, wRegion, hRegion, f) {
		const {x, y, width, height} = this.getRegion(xRegion, yRegion, wRegion, hRegion);
        for (let yi = 0; yi < height; ++yi) {
        	let ym = y + yi;
            for (let xi = 0; xi < width; ++xi) {
                let xm = x + xi;
                this.cell(xm, ym, f(xm, ym, this.cell(xm, ym)));
            }
        }
	}

    /**
     * Setter/Getter for the grid width.
	 * setting a new width will rebuild the grid
     * @param (w) {number}
     */
    set width(w) {
		this._rebuild(w, this._height);
        this._width = w;
    }

    get width() {
        return this._width;
    }

    /**
     * Setter/Getter for the grid height.
     * setting a new height will rebuild the grid
     * @param (h) {number}
     */
    set height(h) {
        this._rebuild(this._width, h);
        this._height = h;
    }

    get height() {
        return this._height;
	}

    /**
	 * Rebuilds the grid according to the given dimensions
	 * @param w {number}
	 * @param h {number}
	 * @private
	 * @return {array}
	 */
	_rebuild(w, h) {
		let g = [];
		let x, y, aRow, data;
		for (y = 0; y < h; y++) {
			aRow = [];
			for (x = 0; x < w; x++) {
				data = {x: x, y: y, width: w, height: h, cell: null};
				this.emit('rebuild', data);
				aRow.push(data.cell);
			}
			g.push(aRow);
		}
		this._width = w;
		this._height = h;
		this.cells = g;
	}

    /**
	 * Sets/Gets a cell value given its coordinates
     * @param x {number}
     * @param y {number}
     * @param (v) {*}
     * @return {*}
     */
	cell(x, y, v) {
		if (v === undefined) {
			if (y >= 0 && y >= 0 && y < this._height && x < this._width) {
				return this._cells[y][x];
			} else {
				return null;
			}
		} else {
			if (y >= 0 && y >= 0 && y < this._height && x < this._width) {
				this._cells[y][x] = v;
			}
			return this;
		}
	}
}

export default Grid;