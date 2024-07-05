import {
  checkOrCreateTable,
  getAirlineIataCode,
  getLatestSearchedResult,
  insertDataSQL,
} from "../../shared/utilities/dbFunctions.js";

import {
  dateClickextb,
  dateLogic,
  formatDate,
  getDate,
  getformatedDate,
  searchByExpedia,
} from "../../shared/utilities/handlerFunctions.js";

export const expediaHandler = async ({ page, log }) => {
  await page?.waitForTimeout(1000);

  //fetch searched Dara from DB
  const searchedData = await getLatestSearchedResult();
  const date = getformatedDate(searchedData?.date);

  //formate Date
  const searchText = await formatDate(date);
  const day = await getDate(date);

  await page.waitForTimeout(1000);
  //click on flights
  await page
    ?.locator(
      "//html/body/div[1]/div[1]/div/div[1]/div[2]/div[1]/div[4]/div[1]/div/div/div/div[1]/ul/li[2]/a/span"
    )
    ?.click();
    //click on one-way
  await page
    ?.locator(
      "//html/body/div[1]/div[1]/div/div[1]/div[2]/div[1]/div[4]/div/div[1]/div/div/div[2]/div/div/div[1]/div/div[1]/div/ul/li[2]/a/span"
    )
    ?.click();

  //click on select FROM input
  await page
    ?.locator(
      "//html/body/div[1]/div[1]/div/div[1]/div[2]/div[1]/div[4]/div/div[1]/div/div/div[2]/div/div/div[2]/form/div/div/div[1]/div/div[1]/div/div/div[2]/div[1]/button"
    )
    ?.click();
  await page?.waitForTimeout(1000);
  //enter departure Location
  await page
    ?.getByPlaceholder("Leaving from")
    ?.fill(searchedData?.departure_location);
  await page?.waitForTimeout(1500);
  await page?.keyboard.press("Tab");
  await page?.keyboard.press("Tab");
  await page?.keyboard.press("Enter");
  //click on TO input field
  await page
    ?.locator(
      "//html/body/div[1]/div[1]/div/div[1]/div[2]/div[1]/div[4]/div/div[1]/div/div/div[2]/div/div/div[2]/form/div/div/div[1]/div/div[2]/div/div/div[2]/div[1]/button"
    )
    ?.click();

  //enter arrival Location
  await page?.getByPlaceholder("Going to").fill(searchedData?.arrival_location);
  await page?.waitForTimeout(1000);
  await page?.keyboard.press("Tab");
  await page?.keyboard.press("Tab");
  await page?.keyboard.press("Enter");
  await page?.waitForTimeout(1000);
  //click on date picker
  await page
    ?.locator(
      '//html/body/div[1]/div[1]/div/div[1]/div[2]/div[1]/div[4]/div/div[1]/div/div/div[2]/div/div/div[2]/form/div/div/div[2]/div/div/div/div/button'
    )
    ?.click();
  await page?.waitForTimeout(2000);
  //click on previous month button
  try {
    await page
      ?.locator(
        '//html/body/div[1]/div[1]/div/div[1]/div[2]/div[1]/div[4]/div/div[1]/div/div/div[2]/div/div/div[2]/form/div/div/div[2]/div/section/div[2]/div/div/div[1]/button'
      )
      ?.click({ timeout: 1100 });
  } catch (error) {
    log.info("")
  }
  await page?.waitForTimeout(1000);
  //search for departure Date month until it mathces click on next month button in date picker
  while (
    !(await searchByExpedia(
      page,
      searchText,
      "//html/body/div[1]/div[1]/div/div[1]/div[2]/div[1]/div[4]/div/div[1]/div/div/div[2]/div/div/div[2]/form/div/div/div[2]/div/section/div[2]/div/div/div[3]/div/div[1]"
    ))
  ) {
    await page
      ?.locator(
        '//html/body/div[1]/div[1]/div/div[1]/div[2]/div[1]/div[4]/div/div[1]/div/div/div[2]/div/div/div[2]/form/div/div/div[2]/div/section/div[2]/div/div/div[2]/button'
      )
      ?.click();
  }
  //click on inputed date
  await dateClickextb(
    page,
    day,
    '//html/body/div[1]/div[1]/div/div[1]/div[2]/div[1]/div[4]/div/div[1]/div/div/div[2]/div/div/div[2]/form/div/div/div[2]/div/section/div[2]/div/div/div[3]/div/div[1]/table/tbody'
  );
  await page?.waitForTimeout(1000);
  //click on done button in date picker
  await page?.getByRole("button", { name: "Done" }).click();
  //click on Search button
  await page
    ?.locator(
      "//html/body/div[1]/div[1]/div/div[1]/div[2]/div[1]/div[4]/div/div[1]/div/div/div[2]/div/div/div[2]/form/div/div/button"
    )
    ?.click();
  await page?.waitForTimeout(1000);
  try {
    await page?.waitForTimeout(800);
    await page
      ?.locator(
        '//html/body/div[2]/div[1]/div/div[2]/div[3]/div[1]/div/div[2]/main/div[4]/section/button'
      )
      ?.click();
    await page?.waitForTimeout(5000);
  } catch (e) {
    log.info("No more additional Flights")
}
  await page?.keyboard.press("End");
  await page?.waitForTimeout(1000);

  //get all the dropdown button elements
   
  const price = await page?.$$eval(".uitk-lockup-price", (els) => {
    return els?.map((el) => el?.textContent);
  });

  const timeDurations = await page?.$$eval('[data-test-id="arrival-time"] span:first-child', (els) => {
    return els?.map((el) => el?.textContent);
  });

  const airlineNames = await page?.$$eval('[data-test-id="flight-operated"]', (els) => {
    return els?.map((el) => el?.textContent);
  });


  price?.pop();
  //get iata code from airline name and flight number
  const details = []
  const departureArrivalTime= timeDurations.map(time => {
    const [departureTime, arrivalTime] = time.split(' - ').map(t => t.trim());
    return { departureTime, arrivalTime };
  });
  //push all the details into details array
  for (let i = 0; i < price?.length; i++) {
    details.push({
      departure_time: departureArrivalTime[i].departureTime,
      arrival_time: departureArrivalTime[i].arrivalTime,
      airline: airlineNames[i],
      price: parseFloat(price[i]?.replace(/[^\d.]/g, "")),
    });
  }
  //check that table exist or not and create
  await checkOrCreateTable("expedia");
  //insert data into table
  await insertDataSQL(details, "expedia", searchedData?.reference_id);
};
