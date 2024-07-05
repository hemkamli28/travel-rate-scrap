import {
  checkOrCreateTable,
  getLatestSearchedResult,
  insertDataSQL,
} from "../../shared/utilities/dbFunctions.js";

import {
  dateClickixigo,
  formatDate,
  getDate,
  locateAndClick,
  searchByDivixigo,
  getformatedDate,
  compareArrays,
} from "../../shared/utilities/handlerFunctions.js";

export const ixigoHandler = async ({ page }) => {
  const searchedData = await getLatestSearchedResult();
  const date = getformatedDate(searchedData?.date);

  await locateAndClick(
    page,
    "//html/body/main/div[2]/div[1]/div[3]/div[2]/div[1]/div[1]/div[1]/div"
  );

  await page.keyboard.type(searchedData?.departure_location, { delay: 100 });
  
  // await page
  //   ?.locator(
  //     "//html/body/main/div[2]/div[1]/div[3]/div[2]/div[1]/div[1]/div[2]/div/div/div[2]/input"
  //   )
  //   ?.fill(searchedData?.departure_location);
  await page?.waitForTimeout(1000);
  await locateAndClick(
    page,
    "//html/body/main/div[2]/div[1]/div[3]/div[2]/div[1]/div[1]/div[3]/div[1]"
  );
  await page?.waitForTimeout(1000);
  await page?.mouse?.click(100, 100);
  await page?.waitForTimeout(100);
  await locateAndClick(
    page,
    "//html/body/main/div[2]/div[1]/div[3]/div[2]/div[1]/div[2]/div[1]/div"
  );
  await page?.waitForTimeout(400);
  await page.keyboard.type(searchedData?.arrival_location, { delay: 100 });

  // await page
  //   ?.locator(
  //     "//html/body/main/div[2]/div[1]/div[3]/div[2]/div[1]/div[2]/div[2]/div/div/div[2]/input"
  //   )
  //   ?.fill(searchedData?.arrival_location);
  await page?.waitForTimeout(1000);
  await locateAndClick(
    page,
    "//html/body/main/div[2]/div[1]/div[3]/div[2]/div[1]/div[2]/div[3]/div[1]"
  );

  await page?.waitForTimeout(1000);
  await locateAndClick(
    page,
    "//html/body/main/div[2]/div[1]/div[3]/div[2]/div[2]/div[1]"
  );

  await page?.waitForTimeout(1000);

  const searchText = await formatDate(date);
  const day = await getDate(date);

  await page?.waitForTimeout(1000);
  while (
    !(await searchByDivixigo(
      page,
      searchText,
      "//html/body/main/div[2]/div[1]/div[3]/div[2]/div[2]/div[3]/div/div[1]/div[1]/button[2]"
    ))
  ) {
    await page
      ?.locator(
        "//html/body/main/div[2]/div[1]/div[3]/div[2]/div[2]/div[3]/div/div[1]/div[1]/button[3]"
      )
      ?.click();
  }
  await page?.waitForTimeout(1900);
  await dateClickixigo(page, day, searchText);

  await page?.waitForTimeout(1000);
  //click search button
  await locateAndClick(
    page,
    "//html/body/main/div[2]/div[1]/div[3]/div[2]/button"
  );
  await page?.waitForTimeout(1000);
  await page?.reload()
  
  
  await page?.waitForTimeout(1000);
  await page?.waitForTimeout(1900);
  await page?.waitForSelector(".flex.items-start.w-full");

  await page?.mouse?.click(1, 1);
  let allFlightDetails = [];
  let prevFlightDetails = null;

  for (let i = 0; i < 100; i++) {
    await page?.mouse?.wheel(0, 580);
    await page?.waitForTimeout(580);

    const flightDetails = await page?.$$eval(
      ".flex.items-start.w-full",
      (flightElements) => {
        const details = [];

      

        for (const flightElement of flightElements) {
      
          const flight_no = flightElement?.querySelector(
            ".body-sm.text-secondary"
          )?.innerText;
          const price = flightElement?.querySelector(
            ".flex.items-baseline.gap-1 h5"
          )?.innerText;
     
          details.push({
            flight_no: flight_no?.split(","),
            price: parseFloat(price?.replace(/[^\d.]/g, "")),
          });
        }

        return details;
      }
    );

    if (prevFlightDetails && compareArrays(flightDetails, prevFlightDetails)) {
      break;
    }
    prevFlightDetails = flightDetails;
    allFlightDetails?.push(...flightDetails);
  }

  const removeDuplicates = (array) => {
    const uniqueObjects = [];
    const uniqueKeys = new Set();

    array.forEach((obj) => {
      const key = JSON?.stringify(obj);
      if (!uniqueKeys?.has(key)) {
        uniqueKeys?.add(key);
        uniqueObjects?.push(obj);
      }
    });

    return uniqueObjects;
  };

  const uniqueFlights = removeDuplicates(allFlightDetails);

 
  //check that table exist or not and create  
  await checkOrCreateTable("ixigo");
  //insert data into table
  await insertDataSQL(uniqueFlights, "ixigo", searchedData?.reference_id);
};
