import solution from './solution.js';

describe('Red-Nosed Reports', () => {
    test('should count safe reports according to rules', () => {
        const input = [
            '7 6 4 2 1',
            '1 2 7 8 9',
            '9 7 6 2 1',
            '1 3 2 4 5',
            '8 6 4 4 1',
            '1 3 6 7 9'
        ];

        expect(solution(input)).toBe(2);
    });

    test('checks if levels are all increasing or decreasing', () => {
        expect(solution(['1 2 3 4 5'])).toBe(1); // increasing
        expect(solution(['5 4 3 2 1'])).toBe(1); // decreasing
        expect(solution(['1 3 2 4 5'])).toBe(0); // mixed
    });

    test('checks if adjacent levels differ by 1-3', () => {
        expect(solution(['1 2 4 5 6'])).toBe(1); // valid differences
        expect(solution(['1 2 7 8 9'])).toBe(0); // invalid difference (2->7)
        expect(solution(['9 7 6 2 1'])).toBe(0); // invalid difference (6->2)
    });

    test('checks if levels are strictly increasing or decreasing', () => {
        expect(solution(['8 6 4 4 1'])).toBe(0); // invalid: same number
    });
});