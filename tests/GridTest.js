import Grid from '../src/Grid';

describe('#grid', function() {
    describe('clipAxis', function () {
        it ('segment outside (neg)', function() {
            const g = new Grid();
            g.width = 10;
            g.height = 5;
            expect(g._clipAxis(-10, 5, 10)).toBeFalsy();
        });
        it ('segment outside (pos)', function() {
            const g = new Grid();
            g.width = 10;
            g.height = 5;
            expect(g._clipAxis(10, 5, 10)).toBeFalsy();
        });
        it ('segment very large', function() {
            const g = new Grid();
            g.width = 10;
            g.height = 5;
            expect(g._clipAxis(-10, 50, 10)).toEqual({n: 0, w: 10});
        });
        it ('segment same size', function() {
            const g = new Grid();
            g.width = 10;
            g.height = 5;
            expect(g._clipAxis(0, 10, 10)).toEqual({n: 0, w: 10});
        });
        it ('segment smaller', function() {
            const g = new Grid();
            g.width = 10;
            g.height = 5;
            expect(g._clipAxis(5, 2, 10)).toEqual({n: 5, w: 2});
        });
        it ('segment left clipped', function() {
            const g = new Grid();
            g.width = 10;
            g.height = 5;
            expect(g._clipAxis(-3, 6, 10)).toEqual({n: 0, w: 3});
        });
        it ('other test', function() {
            const g = new Grid();
            g.width = 10;
            g.height = 5;
            expect(g._clipAxis(-3, 6, 5)).toEqual({n: 0, w: 3});
        });
        it ('segment right clipped', function() {
            const g = new Grid();
            g.width = 10;
            g.height = 5;
            expect(g._clipAxis(7, 6, 10)).toEqual({n: 7, w: 3});
        });
    });
    describe('getRegion', function () {
        it ('should return 0, 0, 3, 3', function() {
            const g = new Grid();
            g.width = 10;
            g.height = 5;
            let c = g.getRegion(-3, -3, 6, 6);
            expect(c).not.toBeFalsy();
            expect(c).toEqual({x: 0, y: 0, width: 3, height: 3});
        });
    });
    describe('iterateRegion', function () {
        it ('should iterate from 0,0 to 2,2', function() {
            const g = new Grid();
            g.width = 10;
            g.height = 5;
            let a = [];
            g.iterateRegion(0, 0, 3, 3, function(x, y, n) {
                a.push('[' + x + ';' + y + ']');
                return n;
            });
            expect(a.join('')).toBe('[0;0][1;0][2;0][0;1][1;1][2;1][0;2][1;2][2;2]');
        });
    });
    describe('iterateRegion', function () {
        it ('should iterate from 8,4 to 9,4', function() {
            const g = new Grid();
            g.width = 10;
            g.height = 5;
            let a = [];
            g.iterateRegion(8, 4, 13, 23, function(x, y, n) {
                a.push('[' + x + ';' + y + ']');
                return n;
            });
            expect(a.join('')).toBe('[8;4][9;4]');
        });
    });

    describe('resize & content', function() {
        it ('should set new content', function() {
            // construct grid
            const g = new Grid();

            // define event when new cells are built
            g.on('rebuild', data => data.cell = data.x * data.y);

            // setting new size
            g.width = 3;
            g.height = 3;

            expect(g.cells).toEqual([ [ 0, 0, 0 ],
                [ 0, 1, 2 ],
                [ 0, 2, 4 ] ])
        })
        it ('should entirely rebuild set new content', function() {
            const g = new Grid();
            const f1 = data => data.cell = 1;
            const f2 = data => data.cell = 2;

            // set initial rebuild event handler
            g.on('rebuild', f1);
            g.width = 3;
            g.height = 3;
            expect(g.cells).toEqual([
                [ 1, 1, 1 ],
                [ 1, 1, 1 ],
                [ 1, 1, 1 ] ]);

            // changing rebuild event handler
            g.off('rebuild', f1);
            g.on('rebuild', f2);

            // change size
            g.width = 4;
            g.height = 4;
            expect(g.cells).toEqual([
                [ 2, 2, 2, 2 ],
                [ 2, 2, 2, 2 ],
                [ 2, 2, 2, 2 ],
                [ 2, 2, 2, 2 ]
            ]);
        });
    });
    describe('resize & content with lazy mode', function() {
        it ('should set new content', function() {
            // construct grid
            const g = new Grid();
            g.lazy = true;
            // define event when new cells are built
            g.on('rebuild', data => data.cell = data.x * data.y);

            // setting new size
            g.width = 3;
            g.height = 3;

            expect(g.cells).toEqual([
                [ 0, 0, 0 ],
                [ 0, 1, 2 ],
                [ 0, 2, 4 ] ])
        })
        it ('should only rebuild new content, should preserve existing cells', function() {
            const g = new Grid();
            g.lazy = true;
            const f1 = data => data.cell = 1;
            const f2 = data => data.cell = 2;

            // set initial rebuild event handler
            g.on('rebuild', f1);
            g.width = 3;
            g.height = 3;
            expect(g.cells).toEqual([
                [ 1, 1, 1 ],
                [ 1, 1, 1 ],
                [ 1, 1, 1 ] ]);

            // changing rebuild event handler
            g.off('rebuild', f1);
            g.on('rebuild', f2);

            // change size
            g.width = 4;
            g.height = 4;
            expect(g.cells).toEqual([
                [ 1, 1, 1, 2 ],
                [ 1, 1, 1, 2 ],
                [ 1, 1, 1, 2 ],
                [ 2, 2, 2, 2 ]
            ]);
        })
        it('should resize to zero', function() {
            const g = new Grid();
            g.lazy = true;
            expect(g.cells).toEqual([]);
            g.width = 2;
            expect(g.cells).toEqual([]);
            g.height = 3;
            expect(g.cells).toEqual([
                [null, null],
                [null, null],
                [null, null]
            ]);
            g.width = 0;
            expect(g.cells).toEqual([
                [],
                [],
                [],
            ]);
            g.height = 0;
            expect(g.cells).toEqual([
            ]);
        })
    })

    describe('shift array', function() {
        it('should rotate array', function() {
            const g = new Grid();
            g.cells = [
                [11, 21, 31],
                [12, 22, 32],
                [13, 23, 33],
                [14, 24, 34]
            ];
            g.scroll('w', 1);
            expect(g.cells).toEqual([
                [21, 31, 11, ],
                [22, 32, 12, ],
                [23, 33, 13, ],
                [24, 34, 14, ]
            ])
            g.scroll('s', 2);
            expect(g.cells).toEqual([
                [23, 33, 13, ],
                [24, 34, 14, ],
                [21, 31, 11, ],
                [22, 32, 12, ],
            ])
            g.scroll('e', 1);
            g.scroll('n', 2);
            expect(g.cells).toEqual([
                [11, 21, 31],
                [12, 22, 32],
                [13, 23, 33],
                [14, 24, 34]
            ]);
        });
    });

    describe('scroll region', function() {
        it('should scroll only a portion of grid', function() {
            const g = new Grid();
            g.cells = [
                [ 1, 1, 1, 1, 1, 1, ],
                [ 1, 1, 1, 1, 1, 1, ],
                [ 1, 1, 1, 1, 1, 1, ],
                [ 1, 1, 1, 1, 1, 1, ],
                [ 1, 1, 1, 1, 1, 1, ],
                [ 1, 1, 1, 1, 1, 1, ],
                [ 1, 1, 1, 1, 1, 1, ],
                [ 1, 1,10,11,12, 1, ],
                [ 1, 1,20,21,22, 1, ],
                [ 1, 1,30,31,32, 1, ],
                [ 1, 1,40,41,42, 1, ],
                [ 1, 1, 1, 1, 1, 1, ],
                [ 1, 1, 1, 1, 1, 1, ],
            ];
            g.scrollRegion(2, 7, 3, 4, 's', 1);
            expect(g.cells).toEqual([
                [ 1, 1, 1, 1, 1, 1, ],
                [ 1, 1, 1, 1, 1, 1, ],
                [ 1, 1, 1, 1, 1, 1, ],
                [ 1, 1, 1, 1, 1, 1, ],
                [ 1, 1, 1, 1, 1, 1, ],
                [ 1, 1, 1, 1, 1, 1, ],
                [ 1, 1, 1, 1, 1, 1, ],
                [ 1, 1,40,41,42, 1, ],
                [ 1, 1,10,11,12, 1, ],
                [ 1, 1,20,21,22, 1, ],
                [ 1, 1,30,31,32, 1, ],
                [ 1, 1, 1, 1, 1, 1, ],
                [ 1, 1, 1, 1, 1, 1, ],
            ])
        })
    })
});
