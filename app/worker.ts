export type MatrixType = number[][];

self.onmessage = function (e: MessageEvent<{ matrix: MatrixType }>) {
  const { matrix } = e.data;
  const result = getMaximalPathAndSum(matrix);
  self.postMessage(result);
};

interface MaximalPathAndSum {
  maximalPath: [number, number][];
  maximalSum: number;
}
const getMaximalPathAndSum = (grid: MatrixType): MaximalPathAndSum => {
  let maximalPath: [number, number][] = [];
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
}
