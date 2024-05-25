"use client";
import mixpanel from "mixpanel-browser";
import React from "react";

type MatrixType = number[][];
const MatrixRenderer: React.FC<{ matrix: MatrixType }> = ({ matrix }) => {
  const { maximalPath, maximalSum } = getMaximalPathAndSum(matrix);
  return (
    <>
      <p className="mb-6 text-xl">
        A path with the maximal sum that avoids zeroes and visits each cell at
        most once is highlighted. The sum of values on that path is{" "}
        <strong>{maximalSum}</strong>.
      </p>
      <table className="mx-auto border-collapse border border-gray-300">
        <tbody>
          {matrix.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {row.map((col, colIndex) => (
                <td
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={`w-1/6 border border-gray-300 p-2 text-center ${
                    maximalPath.some(
                      ([r, c]) => r === rowIndex && c === colIndex,
                    )
                      ? "bg-blue-200 dark:bg-blue-800"
                      : ""
                  }`}
                >
                  {col}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

/**
 * ```
 * [
 *   [8, 3, 1, 9, 5, 4, 6, 0, 2, 7],
 *   [4, 2, 8, 6, 0, 7, 3, 1, 9, 5],
 *   [7, 6, 0, 2, 8, 1, 5, 9, 4, 3],
 *   [1, 5, 9, 3, 7, 6, 8, 2, 0, 4],
 *   [6, 0, 4, 5, 3, 9, 7, 8, 1, 2],
 *   [9, 1, 5, 4, 2, 0, 3, 7, 6, 8],
 *   [2, 7, 3, 8, 4, 5, 9, 6, 0, 1],
 *   [3, 9, 2, 0, 1, 8, 4, 5, 7, 6],
 *   [5, 4, 6, 7, 9, 2, 1, 3, 8, 0],
 *   [0, 8, 7, 1, 6, 3, 2, 4, 5, 9]
 * ]
 * ```
 * is a 10x10 matrix with 100 elements, 90 of which are non-zero.
 * It can take a while to process and may make the page unresponsive.
 *
 * ```
[[1,10,7,10,14,0],[2,12,6,10,1,10],[3,5,6,7,4,2],[4,3,1,1,2,10],[3,40,5,0,20,10]]
 * ```
 * takes a while, but should finish in a reasonable amount of time.
 */
const theMaximumNumberOfNonZeroElements = 27;
const debug = process.env.NODE_ENV === "development";
const inputIsMatrix = (input: unknown): input is MatrixType =>
  Array.isArray(input) &&
  input.every(
    (row) =>
      Array.isArray(row) && row.every((cell) => typeof cell === "number"),
  );

/**
 * Use a verbose error message in development to help with debugging.
 */
const initialErrorMessage = debug
  ? "Invalid input: SyntaxError: Expected ',' or ']' after array element in JSON at position 67 (line 1 column 68)"
  : "";

/**
 * Example valid input:
 *
 * ```
[[0,6,0],[5,8,7],[0,9,0]]
[[1,0,7],[2,0,6],[3,4,5],[0,3,0],[9,0,20]]
[[1,0,7,0,0,0],[2,0,6,0,1,0],[3,5,6,7,4,2],[4,3,1,0,2,0],[3,0,5,0,20,0]]
[[0,0,0],[0,0,0]]
[[0]]
 * ```
 */
const Matrix = () => {
  const matrixInputRef = React.useRef<HTMLTextAreaElement>(null);
  const [error, setError] = React.useState(initialErrorMessage);
  const [matrix, setMatrix] = React.useState<MatrixType>([
    [1, 0, 7, 0, 0, 0],
    [2, 0, 6, 0, 1, 0],
    [3, 5, 6, 7, 4, 2],
    [4, 3, 1, 0, 2, 0],
    [3, 0, 5, 0, 20, 0],
  ]);
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const inputMatrix = JSON.parse(event.target.value);
      if (inputIsMatrix(inputMatrix)) {
        const theNumberOfNonZeroElements = inputMatrix
          .flat()
          .filter(Boolean).length;
        if (theNumberOfNonZeroElements > theMaximumNumberOfNonZeroElements) {
          const warning = `The matrix has ${theNumberOfNonZeroElements} nonzero elements, which is more than the recommended maximum of ${theMaximumNumberOfNonZeroElements}. Attempting to process it may make the page unresponsive.`;
          const proceeding = confirm(`${warning} Do you want to proceed?`);
          if (!proceeding) {
            throw new Error(`Invalid input: ${warning}`);
          }
        }
        setError("");
        setMatrix(inputMatrix);
        track(inputMatrix);
      } else {
        throw new Error("Invalid input: Not a 2D array of numbers");
      }
    } catch (error) {
      console.error(error);
      setError(`${error}`);
    }
  };

  React.useEffect(() => {
    if (matrixInputRef.current) {
      matrixInputRef.current.focus();
      matrixInputRef.current.value = JSON.stringify(matrix);
      mixpanel.init(`${process.env.NEXT_PUBLIC_MIXPANEL_TOKEN}`, {
        debug,
        track_pageview: true,
        persistence: "localStorage",
      });
    }
  }, [matrix]);

  return (
    <section className="w-full p-4">
      <h1 className="mb-4 text-center text-2xl font-bold">Max Matrix Path</h1>
      <textarea
        className="mb-4 w-full rounded-md border border-gray-300 p-2 text-black dark:bg-gray-800 dark:text-white"
        name="matrix"
        onChange={handleChange}
        placeholder="[[1,0,7,0,0,0],[2,0,6,0,1,0],[3,5,6,7,4,2],[4,3,1,0,2,0],[3,0,5,0,20,0]]"
        ref={matrixInputRef}
        rows={5}
      />
      <section className="items-center text-center">
        {error && (
          <p className="mb-4 text-xl font-bold text-red-500">{error}</p>
        )}
        <MatrixRenderer matrix={matrix} />
      </section>
    </section>
  );
};

export default Matrix;

const debounce = (func: (...args: unknown[]) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: unknown[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
const track = debounce((input: unknown) => {
  if (inputIsMatrix(input)) {
    mixpanel.track("Matrix Input", { inputMatrix: input });
    if (debug) {
      console.log("Tracked input matrix", input);
    }
  } else if (debug) {
    throw new Error(`Invalid input for tracking: ${input}`);
  }
}, 3000);

const getMaximalPathAndSum = (grid: MatrixType) => {
  let maximalPath = [] as [number, number][];
  let maximalSum = 0;
  const dfs = (
    row: number,
    col: number,
    current: number,
    currentPath: [number, number][],
  ) => {
    if (!grid[row]?.[col]) return;
    const runningTotal = grid[row][col] + current;
    currentPath.push([row, col]);
    maximalPath = runningTotal > maximalSum ? [...currentPath] : maximalPath;
    maximalSum = Math.max(maximalSum, runningTotal);
    grid[row][col] = 0;
    dfs(row - 1, col, runningTotal, currentPath);
    dfs(row + 1, col, runningTotal, currentPath);
    dfs(row, col - 1, runningTotal, currentPath);
    dfs(row, col + 1, runningTotal, currentPath);
    grid[row][col] = runningTotal - current;
    currentPath.pop();
  };
  for (let r = 0; r < grid.length; r += 1) {
    for (let c = 0; c < grid[r].length; c += 1) {
      dfs(r, c, 0, []);
    }
  }
  return {
    maximalPath,
    maximalSum,
  };
};

// in-source test suites
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  const testCase1 = {
    matrix: [
      [0, 6, 0],
      [5, 8, 7],
      [0, 9, 0],
    ],
    expectedPath: [
      [1, 2],
      [1, 1],
      [2, 1],
    ],
    expectedSum: 24,
  };
  const testCase2 = {
    matrix: [
      [1, 0, 7],
      [2, 0, 6],
      [3, 4, 5],
      [0, 3, 0],
      [9, 0, 20],
    ],
    expectedPath: [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
      [2, 2],
      [1, 2],
      [0, 2],
    ],
    expectedSum: 28,
  };
  const testCase3 = {
    matrix: [
      [1, 0, 7, 0, 0, 0],
      [2, 0, 6, 0, 1, 0],
      [3, 5, 6, 7, 4, 2],
      [4, 3, 1, 0, 2, 0],
      [3, 0, 5, 0, 20, 0],
    ],
    expectedPath: [
      [4, 2],
      [3, 2],
      [3, 1],
      [3, 0],
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
      [2, 4],
      [3, 4],
      [4, 4],
    ],
    expectedSum: 60,
  };
  const testCase4 = {
    matrix: [
      [0, 0, 0],
      [0, 0, 0],
    ],
    expectedPath: [],
    expectedSum: 0,
  };
  const testCase5 = {
    matrix: [[0]],
    expectedPath: [],
    expectedSum: 0,
  };
  const testCases = [testCase1, testCase2, testCase3, testCase4, testCase5];
  it("returns the coordinates of the maximal path", () => {
    testCases.forEach(({ matrix, expectedPath, expectedSum }) => {
      const { maximalPath, maximalSum } = getMaximalPathAndSum(matrix);
      expect(maximalPath).toEqual(expectedPath);
      expect(maximalSum).toBe(expectedSum);
    });
  });
  it("validates input as a matrix", () => {
    expect(inputIsMatrix([])).toBe(true);
    expect(inputIsMatrix([[]])).toBe(true);
    expect(inputIsMatrix([[1]])).toBe(true);
    expect(inputIsMatrix([["a"]])).toBe(false);
    expect(inputIsMatrix([1, 2, 3])).toBe(false);
    expect(inputIsMatrix([[1, 2], [3]])).toBe(true);
    expect(inputIsMatrix([[1], [2], [3]])).toBe(true);
    testCases.forEach(({ matrix }) => {
      expect(inputIsMatrix(matrix)).toBe(true);
    });
  });
}
