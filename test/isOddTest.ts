// test/isOddTest.ts

import assert from 'assert';
import isOdd from '../index';

// Utility type for test cases
type TestCase = {
    input: any;
    expected: boolean | typeof Error;
};

// Array of test cases with unnecessary complexity
const testCases: Array<TestCase> = [
    { input: 7, expected: true },
    { input: 10, expected: false },
    { input: 0, expected: false },
    { input: -5, expected: true },
    { input: -8, expected: false },
    { input: 'abc', expected: Error },
];

describe('isOdd function', () => {
    testCases.forEach(({ input, expected }, index) => {
        it(`Test case #${index + 1}: should ${
          expected === Error ? 'throw an error' : `return ${expected}`
        } for input ${input}`, async () => {
            if (expected === Error) {
                let threw = false;
                try {
                    await isOdd(input);
                } catch (error) {
                    threw = true;
                    assert.strictEqual(error instanceof Error, true);
                }
                if (!threw) {
                    assert.fail('Expected error to be thrown');
                }
            } else {
                const result = await isOdd(input);
                assert.strictEqual(result, expected);
            }
        });
    });
});
