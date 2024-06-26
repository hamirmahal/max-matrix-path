import { expect, test } from "@playwright/test";

test("the page is responsive after starting to process large input", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/");
  const input_textarea = page.getByPlaceholder("[[1,0,7,0,0,0],[2,0,6,0,1,0");
  await input_textarea.fill(
    "[[8, 3, 1, 9, 5, 4, 6, 0, 2, 7], [4, 2, 8, 6, 0, 7, 3, 1, 9, 5], [7, 6, 0, 2, 8, 1, 5, 9, 4, 3], [1, 5, 9, 3, 7, 6, 8, 2, 0, 4], [6, 0, 4, 5, 3, 9, 7, 8, 1, 2], [9, 1, 5, 4, 2, 0, 3, 7, 6, 8], [2, 7, 3, 8, 4, 5, 9, 6, 0, 1], [3, 9, 2, 0, 1, 8, 4, 5, 7, 6], [5, 4, 6, 7, 9, 2, 1, 3, 8, 0], [0, 8, 7, 1, 6, 3, 2, 4, 5, 9]]",
    {
      timeout: 1000,
    },
  );
  await expect(input_textarea).toBeEditable();
  await input_textarea.fill("[[0]]");
});
