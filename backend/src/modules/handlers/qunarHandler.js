import { getInrFromUsd } from "../../shared/utilities/currencyCall.js";
import {
  checkOrCreateTable,
  getLatestSearchedResult,
  insertDataSQL,
} from "../../shared/utilities/dbFunctions.js";
import { getformatedDate } from "../../shared/utilities/handlerFunctions.js";

export const qunarHandler = async ({ page, log }) => {
  const searchedData = await getLatestSearchedResult();
  const date = getformatedDate(searchedData?.date);
  //enter email
  await page
    ?.locator("//html/body/div[2]/form/input[1]")
    ?.fill("romitarora@itoneclick.com");
  await page?.waitForTimeout(200);
  //enter password
  await page?.locator("//html/body/div[2]/form/input[2]")?.fill("Oneclick1@");
  await page?.waitForTimeout(200);
  //click on login button
  await page?.locator("//html/body/div[2]/form/input[3]")?.click();
  await page?.waitForTimeout(200);
  //click on flight Search
  await page?.locator("//html/body/div[1]/div/nav/div/ul/li[1]")?.click();
  await page?.waitForTimeout(750);

  //click on departure location input field
  await page?.locator("//html/body/div[1]/div/main/div[1]/form/div/div/div[1]/input").click();
  await page?.keyboard.press("Control+A");
  await page?.keyboard.press("Backspace");

  await page?.keyboard.type(searchedData?.departure_location, { delay: 100 });
  await page?.waitForTimeout(500);
  await page?.keyboard.press("Tab");
  await page?.keyboard.press("Control+A");
  await page?.keyboard.press("Backspace");
  await page?.keyboard.type(searchedData?.arrival_location, { delay: 100 });
  await page?.waitForTimeout(800);

  await page
    ?.locator("//html/body/div[1]/div/main/div[1]/form/div/div/div[7]/input")
    ?.fill(date);
  await page
    ?.locator("//html/body/div[1]/div/main/div[1]/form/div/div/div[9]/button")
    ?.click();
  await page?.waitForTimeout(3000);
  await page?.waitForSelector(
    "//html/body/div[1]/div/main/div[3]/main/table/tbody/tr/td[1]/table/tbody/tr[2]"
  );
  await page?.waitForTimeout(1800);
  const details = [];
  const convertionRate = await getInrFromUsd();
  for (let i = 2; i < 500; i++) {
    let data = [];
    const arr = [3, 6, 7, 8, 10];

    const flightDetails = {};
    for (let j = 0; j < arr?.length; j++) {
      const xpath = `//html/body/div[1]/div/main/div[3]/main/table/tbody/tr/td[1]/table/tbody/tr[${i}]/td[${arr[j]}]`;
      data = await page?.$$eval(xpath, (els) => els?.map((el) => el?.innerText));

      if (data?.length === 0) {
        break;
      }
      if (arr[j] == 3) {
          const flightNoString = data[0];
          flightDetails.flight_no = flightNoString?.split("\n");
      }
      else{
          const UsdPrice = parseFloat(data[0]?.match(/\d+(\.\d+)?/));
          const price = convertionRate * UsdPrice;
          flightDetails.price = parseFloat(price);
      }
    }
    if (Object.keys(flightDetails).length > 0) {
      details.push(flightDetails);
    }

    if (data.length === 0) {
      break;
    }
  }

  //check that table exist or not and create
  await checkOrCreateTable("qunar");
  //insert data into table
  await insertDataSQL(details, "qunar", searchedData?.reference_id);
};
