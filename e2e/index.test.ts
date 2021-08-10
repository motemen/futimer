jest.setTimeout(5 * 60 * 1000);

describe("fuTimer", () => {
  beforeEach(async () => {
    await page.goto("http://localhost:3232/futimer", {
      waitUntil: "networkidle0",
    });
  });

  it("should render", async () => {
    // await new Promise((resolve) => setTimeout(resolve, 2000 * 10 * 10));
    console.log(1);

    await page.waitForTimeout(2000);

    const title = await page.title();
    console.log(title);

    await expect(page.title()).resolves.toMatch("fuTimer");

    /*
    await page.screenshot({
      fullPage: true,
      path: "index.png",
    });
    */

    await expect(
      page.$eval("[data-testid=scramble]", (el) => el.textContent)
    ).resolves.toMatch(/[UBRLFB' ]+/);

    await page.screenshot({
      fullPage: true,
      path: "index-b.png",
    });

    await page.click("[data-testid=timerButton]", { delay: 500 });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    /*
    await page.screenshot({
      fullPage: true,
      path: "index-2.png",
    });
    */
  });
});
