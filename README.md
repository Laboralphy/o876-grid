#O876 Grid
A grid manager.

## Definition
- A grid is a two dimensional array cells.
- A cell may contain any thing, number, strings, objects...

This class allows you to simply resize a grid, and provide :
- Events to notify grid size alterations.
- Function initializer
- A lazy mode to call function initializer only on cell that are actually created when resize a bigger grid.

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

// set initial rebuild event handler
g.on('rebuild', f1);
g.width = 3;
g.height = 3;
```

will print

```application/javascript
[ [ 1, 1, 1 ], 
  [ 1, 1, 1 ], 
  [ 1, 1, 1 ]
]
```

and now resize grid with another cell initializer

```application/javascript
// change rebuild event handler
const f2 = data => data.cell = 2;

g.off('rebuild', f1); // removing previous initializer
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

### lazy mode

In lazy mode, only new built cells are initialized, the unchanged cells are not :

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