#O876 Grid
A grid manager.

## Definition
A grid is an array of arrays of cells.
This class allows you to simply resize a 2-dimensional array of cells. 
Each cell may hold any value of any type, including number, string, objects 
or other grids.

## a few examples

```application/javascript
// construct grid
const g = new Grid();

// define event when new cells are built
g.on('rebuild', data => data.cell = data.x * data.y);

// setting new size
g.width = 3;
g.height = 3;

// inspect grid
console.log(g.cells)
```

will print : 
```
[ [ 0, 0, 0 ], 
  [ 0, 1, 2 ], 
  [ 0, 2, 4 ] ]
```

when grid size changes, all cells are rebuilt

```application/javascript
const g = new Grid();
const f1 = data => data.cell = 1;
const f2 = data => data.cell = 2;

// set initial rebuild event handler
g.on('rebuild', f1);
g.width = 3;
g.height = 3;

// change rebuild event handler
g.off('rebuild', f1);
g.on('rebuild', f2);

// change size
g.width = 4;
g.height = 4;
console.log(g.cells)
```

will print : 
```
[ [ 2, 2, 2, 2 ], 
  [ 2, 2, 2, 2 ], 
  [ 2, 2, 2, 2 ], 
  [ 2, 2, 2, 2 ] ]
```

###lazy mode
In lazy mode this is not true :

```application/javascript
const g = new Grid();
g.lazy = true;

const f1 = data => data.cell = 'first';
const f2 = data => data.cell = 'second';

// set initial rebuild event handler
g.on('rebuild', f1);
g.width = 3;
g.height = 3;

// change rebuild event handler
g.off('rebuild', f1);
g.on('rebuild', f2);

// change size
g.width = 4;
g.height = 4;
console.log(g.cells)
```

will print : 
```
[ [ 'first', 'first', 'first', 'second' ], 
  [ 'first', 'first', 'first', 'second' ], 
  [ 'first', 'first', 'first', 'second' ], 
  [ 'second', 'second', 'second', 'second' ] ]
```