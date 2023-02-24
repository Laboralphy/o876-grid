/**
 * @class Grid
 * This class is a generic grid containing anything
 * When new items are needed (when the grid changes size and gets larger)
 * an event is fired : "rebuild" which can be handled to construct cell content.
 */
const Events = require('events');

class Grid {
	constructor() {
        this._cells = [];
        this._width = 0;
        this._height = 0;
        this._events = new Events();
        this._lazyMode = false;
	}

	/**
	 * defines a new event
	 * @param args
	 * @returns {Grid}
	 */
    on(...args) { return this._events.on(...args); }
    off(...args) { return this._events.off(...args); }
    once(...args) { return this._events.once(...args); }
    emit(...args) { return this._events.emit(...args); }

	get lazy() {
		return this._lazyMode;
	}

	set lazy(value) {
		this._lazyMode = value;
	}


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
		this._resize(w, this._height);
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
        this._resize(this._width, h);
        this._height = h;
    }

    get height() {
        return this._height;
	}

	_lazyResizeRow(row, n, y) {
    	const l = row.length;
    	if (n < l) {
    		// new length is small than current length
    		// we must reduce row length
    		row.splice(n);
		} else if (n > l) {
    		// we must add some cells
			for (let x = l; x < n; ++x) {
				const data = {x, y, width: n, height: this.height, cell: null};
				this.emit('rebuild', data);
				row.push(data.cell);
			}
		}
	}

	_lazyResizeGrid(w, h) {
    	const l = this._cells.length;
    	if (l > h) {
    		// current size is greater than new size
			this._cells.splice(h);
		}
    	if (l < h) {
    		// current size is smaller than new size
			// old row must be resized
    		// new rows must be added and sized
			for (let y = 0; y < h; ++y) {
				if (y >= l) {
					const row = [];
					this._cells.push(row);
				}
			}
		}
    	for (let y = 0; y < h; ++y) {
			this._lazyResizeRow(this._cells[y], w, y);
		}
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
	 * resize grid according to lazyMode (or efficient mode)
	 * lazy mode : will only create necessary new cells, existing cells will be preserved. outbound cells will be dropped out
	 * ,p, lazy mode : will entirely rebuild grid.
	 * @param w {number}
	 * @param h {number}
	 * @private
	 */
	_resize(w, h) {
		if (this._lazyMode) {
			this._lazyResizeGrid(w, h);
		} else {
			this._rebuild(w, h);
		}
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

	_shiftArray(grid, direction, nCount = 1) {
		for (let i = 0; i < nCount; ++i) {
			switch (direction) {
				case 'n': {
					grid.push(grid.shift());
					break;
				}

				case 's': {
					grid.unshift(grid.pop());
					break;
				}

				case 'e': {
					grid.forEach(row => {
						row.unshift(row.pop());
					});
					break;
				}

				case 'w': {
					grid.forEach(row => {
						row.push(row.shift());
					});
					break;
				}
			}
		}
	}

	scroll(direction, count) {
		this._shiftArray(this._cells, direction, count);
	}

	scrollRegion(x, y, nw, nh, direction, count = 1) {
		const regionXYWH = this.getRegion(x, y, nw, nh)
		if (regionXYWH.width * regionXYWH.height === 0) {
			return;
		}
		const grid = this._cells;
		const localGrid = [];
		const region = {
			x1: regionXYWH.x,
			y1: regionXYWH.y,
			x2: regionXYWH.x + regionXYWH.width - 1,
			y2: regionXYWH.y + regionXYWH.height - 1,
		}
		const {x1, y1, x2, y2} = region;
		// copier la partie de grille qui va bouger
		for (let y = 0; y < (y2 - y1 + 1); ++y) {
			const row = [];
			for (let x = 0; x < (x2 - x1 + 1); ++x) {
				row.push(grid[y + y1][x + x1]);
			}
			localGrid.push(row);
		}
		this._shiftArray(localGrid, direction, count);
		// replacer la grille
		for (let y = 0; y < (y2 - y1 + 1); ++y) {
			for (let x = 0; x < (x2 - x1 + 1); ++x) {
				grid[y + y1][x + x1] = localGrid[y][x];
			}
		}
	}
}

module.exports = Grid;