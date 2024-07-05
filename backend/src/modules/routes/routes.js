import { Dataset, createPlaywrightRouter } from "crawlee";

import { mmtHandler } from "../handlers/mmtHandler.js";
import { ixigoHandler } from "../handlers/ixigoHandler.js";
import { expediaHandler } from "../handlers/expediaHandler.js";
import { tboHandler } from "../handlers/tboHandler.js";
import { qunarHandler } from "../handlers/qunarHandler.js";
import { ftdHandler } from "../handlers/ftdHandler.js";
import { emtHandler } from "../handlers/emtHandler.js";
export const router = createPlaywrightRouter();

router.addDefaultHandler(async ({ page, log }) => {
  const url = page?.url();
  switch (true) {
    case url.startsWith("https://www.makemytrip.com/"):
      log?.info(`Handling request for MMT `);
      await mmtHandler({ page, log });
      break;
    case url.startsWith("https://www.ixigo.com"):
      log?.info(`Handling request for Ixigo`);
      await ixigoHandler({ page, log });
      break;
    case url.startsWith("https://www.expedia.co.in"):
      log?.info(`Handling request for expedia`);
      await expediaHandler({ page, log });
      break;
    case url.startsWith("https://www.easemytrip.com/"):
      log?.info(`Handling request for easemytrip`);
      await emtHandler({ page, log });
      break;
    case url.startsWith("https://www.travelboutiqueonline.com"):
      log?.info(`Handling request for TBO`);
      await tboHandler({ page, log });
      break;
    case url.startsWith("https://intersite.qunar.com/view/portal/login.html"):
      log?.info(`Handling request for Qunar`);
      await qunarHandler({ page, log });
      break;
    case url.startsWith("https://www.ftd.travel/book/b2b/agent-signin"):
      log?.info(`Handling request for FTD`);
      await ftdHandler({ page, log });
      break;
    default:
      log?.info(`Handling request for other URLs`);
      break;
  }
});
