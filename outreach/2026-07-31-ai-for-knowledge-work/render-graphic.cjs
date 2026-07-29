const { chromium } = require("playwright");
const { pathToFileURL } = require("url");
const path = require("path");

async function main() {
  const dir = __dirname;
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 1500 },
    deviceScaleFactor: 1,
  });

  await page.goto(
    pathToFileURL(
      path.join(dir, "ai-for-knowledge-work-email-graphic.html"),
    ).href,
    { waitUntil: "networkidle" },
  );

  await page.screenshot({
    path: path.join(dir, "ai-for-knowledge-work-email-graphic.png"),
    clip: { x: 0, y: 0, width: 1200, height: 1500 },
  });

  const emailPage = await browser.newPage({
    viewport: { width: 760, height: 1200 },
    deviceScaleFactor: 1,
  });

  await emailPage.goto(pathToFileURL(path.join(dir, "email.html")).href, {
    waitUntil: "networkidle",
  });

  await emailPage.screenshot({
    path: path.join(dir, "email-preview.png"),
    fullPage: true,
  });

  const sessionOgPage = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });

  await sessionOgPage.goto(
    pathToFileURL(path.join(dir, "session-og.html")).href,
    { waitUntil: "networkidle" },
  );

  await sessionOgPage.screenshot({
    path: path.join(
      dir,
      "../../public/media/sessions/copilot-cowork-knowledge-work-og.png",
    ),
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
