import { PlaywrightCrawler } from "crawlee";
import { firefox, chromium } from "playwright";

import { router } from "../modules/routes/routes.js";
import { checkTboLatestDataAndSearchedData } from "../shared/utilities/dbFunctions.js";

try {
  const startUrls = [
    // "https://www.travelboutiqueonline.com",
    // "https://www.makemytrip.com/",
    "https://intersite.qunar.com/view/portal/login.html",
    // "https://www.expedia.co.in/",
    // 'https://www.easemytrip.com/',
    // "https://www.ftd.travel/book/b2b/agent-signin",
    // "https://www.ixigo.com",
  ];

  for (const url of startUrls) {
    let launcher;
    if (url?.includes("ixigo")) {
      launcher = firefox;
    } else if (url?.includes("makemytrip")) {
      const status = await checkTboLatestDataAndSearchedData();
      if (!status) {
        process.exit(1);
      }
      launcher = chromium;
    } else {
      launcher = chromium;
    }
    const crawler = new PlaywrightCrawler({
      headless: false,
      requestHandler: router,
      requestHandlerTimeoutSecs: 120000,
      retryOnBlocked: true,
      launchContext: {
        launcher,
        useIncognitoPages: true,
        launchOptions: {
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        },
      },
      preNavigationHooks: [
        async ({ page }) => {
          await page.setViewportSize({ width: 1380, height: 740 });
        },
      ],
    });
    await crawler?.run([url]);
  }
  process.exit(0);
} catch (e) {
  throw e;
}
