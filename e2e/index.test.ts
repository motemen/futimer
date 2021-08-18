import * as path from "path";

jest.setTimeout(5 * 60 * 1000);

const screenshotPath = process.env["TEST_SCREENSHOT_PATH"];

const maySaveScreenshot = async (filename: string): Promise<void> => {
  if (screenshotPath) {
    await page.screenshot({
      path: path.join(screenshotPath, filename),
      fullPage: true,
    });
  }
};


describe("fuTimer", () => {
  beforeEach(async () => {
    await page.goto("http://localhost:3232/futimer", {
      waitUntil: "networkidle0",
    });
  });

  it("should render", async () => {
    await page.waitForTimeout(2000);

    await expect(page.title()).resolves.toMatch("fuTimer");

    await expect(
      page.$eval("[data-testid=scramble]", (el) => el.textContent)
    ).resolves.toMatch(/[UBRLFB' ]+/);

    await maySaveScreenshot("01-loaded.png");

    await page.click("[data-testid=timerButton]", { delay: 1000 });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    await expect(page.$eval("[data-testid=timerButton]", (el) => parseFloat(el.textContent || ""))).resolves.toBeGreaterThan(2.0);

    await maySaveScreenshot("02-timer-running.png");
  });
});
