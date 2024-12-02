const { calculateTotalDistance } = require('./day1.solution');

describe('Location ID Distance Calculator', () => {
    test('Example case should return 11', () => {
        const leftList = [3, 4, 2, 1, 3, 3];
        const rightList = [4, 3, 5, 3, 9, 3];
        expect(calculateTotalDistance(leftList, rightList)).toBe(11);
    });

    test('Empty lists should return 0', () => {
        expect(calculateTotalDistance([], [])).toBe(0);
    });

    test('Single number lists should return their difference', () => {
        expect(calculateTotalDistance([1], [3])).toBe(2);
    });

    test('Lists with same numbers should return 0', () => {
        const list = [1, 2, 3];
        expect(calculateTotalDistance(list, list)).toBe(0);
    });

    test('Lists must be of equal length', () => {
        expect(() => calculateTotalDistance([1, 2], [1])).toThrow('Lists must be of equal length');
    });
});