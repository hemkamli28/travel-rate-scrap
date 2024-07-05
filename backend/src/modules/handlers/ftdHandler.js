import {
  checkOrCreateTable,
  getLatestSearchedResult,
  insertDataSQL,
} from "../../shared/utilities/dbFunctions.js";
import {
  checkMonthFtd,
  dateClickextb,
  dateLogic,
  formatDate,
  getDate,
  getDayDifference,
  getformatedDate,
} from "../../shared/utilities/handlerFunctions.js";

export const ftdHandler = async ({ page, log }) => {
  await page?.waitForTimeout(2000);
  await page
    ?.locator("//html/body/div[1]/div/section[2]/div/form/div[1]/input")
    ?.fill("romitarora@gmail.com");
  await page?.waitForTimeout(800);
  await page?.keyboard.press("Tab");
  await page
    ?.locator("//html/body/div[1]/div/section[2]/div/form/div[2]/input")
    ?.fill("Perfect1@");
  await page?.waitForTimeout(800);
  await page?.keyboard.press("Enter");

  const searchedData = await getLatestSearchedResult();
  const date = getformatedDate(searchedData?.date);

  const searchText = await formatDate(date);
  const day = await getDate(date);
  await page?.waitForTimeout(700);
  await page?.waitForTimeout(3000);
  await page?.waitForLoadState("networkidle");
  await page
    ?.locator("//html/body/section[1]/div/div/div[3]/ul/li[1]/div/input")
    ?.click();
  await page
    ?.locator("//html/body/section[1]/div/div/div[3]/ul/li[1]/div/input")
    ?.fill(searchedData.departure_location);
  await page?.waitForTimeout(1300);
  await page?.keyboard?.press("ArrowUp");
  await page?.keyboard?.press("ArrowDown");
  await page?.waitForTimeout(600);
  // await page.locator('//html/body/ul[2]/li[1]').click();
  await page?.keyboard?.press("Enter");
  await page?.waitForTimeout(500);

  await page
    ?.locator("//html/body/section[1]/div/div/div[3]/ul/li[2]/div/input")
    ?.click();
  await page
    ?.locator("//html/body/section[1]/div/div/div[3]/ul/li[2]/div/input")
    ?.fill(searchedData?.arrival_location);
  await page?.waitForTimeout(1300);
  await page?.keyboard?.press("ArrowUp");
  await page?.keyboard?.press("ArrowDown");
  await page?.waitForTimeout(600);
  // await page.locator('//html/body/ul[2]/li[1]').click();
  await page?.keyboard?.press("Enter");

  await page?.waitForTimeout(1000);

  await page
    ?.locator("//html/body/section[1]/div/div/div[3]/ul/li[3]/div/input")
    .click();

  while (!(await checkMonthFtd(page, searchText))) {
    await page?.locator("//html/body/div[1]/div/a[2]")?.click();
  }
  await dateClickextb(page, day, "//html/body/div[1]/table/tbody");

  await page?.locator("//html/body/section[1]/div/div/button")?.click();

  await page?.waitForSelector(".traveller-view.agent-view.ftd-bg-white");
  await page?.waitForTimeout(3000);
  await page.keyboard.press("End");
  await page.waitForTimeout(3000);
  await page.keyboard.press("End");
  await page.waitForTimeout(3000);
  await page.keyboard.press("End");
  await page.waitForTimeout(3000);
  await page.keyboard.press("End");
  await page.waitForTimeout(3000);

  const flightDataCards = await page?.$$eval(
    ".traveller-view.agent-view.ftd-bg-white",
    (flightCards, date) => {
      const flightDetails = [];

      for (const flightElement of flightCards) {
        const airlineArray = [];
        const price = [];
        const airlineName = flightElement?.querySelector(
          ".flight-name-number"
        )?.innerText;
        airlineArray?.push(airlineName);
        const priceCards = flightElement?.querySelectorAll(
          ".price-set.ftd-position-relative"
        );
        let arrival_date = date;
        //Layovers Logic
        let direct;
        const Layover =
          flightElement?.querySelector(".time-arrow  span").innerText;
        if (Layover?.includes("Non")) {
          direct = true;
        } else {
          direct = false;
        }

        //flight Number logic
        const airlineCode = flightElement?.querySelector(
          ".text-left.ftd-display-block"
        )?.innerText;
        const [iataCode, flightCodes] = airlineCode?.split("-");
        const flightCode = flightCodes?.split(",");
        const flight_no = flightCode?.map((e) => {
          return iataCode + e;
        });

        //arrival date logic
        const departureLocationAndDate =
          flightElement?.querySelectorAll(".take-off span ");
        const arrivalLocationAndDate =
          flightElement?.querySelectorAll(".landing span ");

        for (let i = 0; i < priceCards.length; i++) {
          //publishFare extractions
          const publishFareString =
            priceCards[i]?.querySelector(".booking-price")?.innerText;
          const publishFare = parseFloat(publishFareString?.split(",")?.join(""));

          //netFare EXtraction
          const netFareString = priceCards[i]?.querySelector(
            ".netfare.result-b2b"
          )?.innerText;
          const match = netFareString?.match(/\bNet:\s*([\d,]+)\b/);
          const netFare = parseFloat(match[1]?.replace(/,/g, ""));

          //fare_type string cleaning
          const fareTypeString = priceCards[i]
            ?.querySelector(".ftd-font-size-12 span")
            ?.textContent.trim();
          const fare_type = fareTypeString?.replace(/[^a-zA-Z\s]/g, "");
          price?.push({
            id: i + 1,
            type: fare_type,
            publishFare,
            netFare,
          });
        }
        //lowest publish fare
        const lowestNetFare = Math?.min(...price.map((item) => item?.netFare));
        const newFareObject = price[0];
        const newPriceObject = {
          publishFare: parseFloat(newFareObject.publishFare),
          netFare: parseFloat(lowestNetFare),
          fareType: newFareObject.type,
        };

        flightDetails?.push({
          flight_no,
          airline: airlineArray,
          departure_date: departureLocationAndDate[1]?.innerText,
          arrival_date: arrivalLocationAndDate[1]?.innerText,
          price: newPriceObject,
          direct,
        });
      }
      return flightDetails;
    },
    date
  );

  for (let i = 0; i < flightDataCards.length; i++) {
    flightDataCards[i]["departure_location"] = searchedData?.departure_location;
    flightDataCards[i]["arrival_location"] = searchedData?.arrival_location;

    const dateDifference = getDayDifference(
      flightDataCards[i].departure_date,
      flightDataCards[i].arrival_date
    );
    if (dateDifference > 0) {
      flightDataCards[i].arrival_date = await dateLogic(
        true,
        date,
        dateDifference
      );
      flightDataCards[i].departure_date = date;
    } else {
      flightDataCards[i].departure_date = date;
      flightDataCards[i].arrival_date = date;
    }
  }

  const lowestNetFareMap = new Map();

  flightDataCards.forEach(obj => {
      const flightNoKey = JSON.stringify(obj.flight_no);
      const netFare = obj.price.netFare;
  
      if (!lowestNetFareMap.has(flightNoKey) || netFare < lowestNetFareMap.get(flightNoKey).price.netFare) {
          lowestNetFareMap.set(flightNoKey, obj);
      }
  });
  
  
  const resultArray = Array.from(lowestNetFareMap.values());

  //check that table exist or not and create
  await checkOrCreateTable("ftd");
  //insert data into table
  await insertDataSQL(resultArray, "ftd", searchedData?.reference_id);
};
