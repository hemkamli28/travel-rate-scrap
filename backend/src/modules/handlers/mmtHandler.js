import {
  getLatestSearchedResult,
  checkOrCreateTable,
  insertDataSQL,
} from "../../shared/utilities/dbFunctions.js";

import {
  dateClickmmt,
  searchByDiv,
  fetchDetails,
  formatDate,
  getDate,
  getInputAndFill,
  locateAndClick,
  scrollBottom,
  getformatedDate,
} from "../../shared/utilities/handlerFunctions.js";

export const mmtHandler = async ({ page, log }) => {
  log.info(`enqueueing new URLs`);

  const searchedData = await getLatestSearchedResult();
  const date = getformatedDate(searchedData.date);

  await page.waitForTimeout(5000);
  await page.mouse.click(100, 200);
  await page.waitForTimeout(200);
  await page.waitForTimeout(1200);
  await page.mouse.click(100, 200);
  await page.waitForTimeout(900);
  await page.mouse.click(100, 200);

  

  await page.waitForTimeout(1000);
  await locateAndClick(
    page,
    "//html/body/div[1]/div/div[2]/div/div/div/div/div[2]/div[1]/div[1]"
    
  );

  //map input object
  await getInputAndFill(page, searchedData);
  await page.waitForTimeout(1000);

  //get the date to be searched in datepicker
  const searchText = await formatDate(date);
  const day = await getDate(date);
  await page.waitForTimeout(1000);

  //click on next month button until the searchText is matched
  while (
    !(await searchByDiv(
      page,
      searchText,
      "//html/body/div[1]/div/div[2]/div/div/div/div/div[2]/div[1]/div[3]/div[1]/div/div/div/div[2]/div/div[2]/div[1]/div[1]"
    ))
  ) {
    await page
      .locator(
        "//html/body/div[1]/div/div[2]/div/div/div/div/div[2]/div[1]/div[3]/div[1]/div/div/div/div[2]/div/div[1]/span[2]"
      )
      .click();
  }

  //click on inputed date
  await dateClickmmt(page, day, ".dateInnerCell");

  await locateAndClick(
    page,
    "//html/body/div[1]/div/div[2]/div/div/div/div/div[2]/p/a"
  );

  try {
    await page.waitForTimeout(2000);
    await locateAndClick(
      page,
      "//html/body/div[2]/div/div[2]/div[2]/div[2]/div/div/div[3]/button"
    );
  } catch (error) {
    log.info("");
  }
  
  //used for default filter removal
  try {
    await page.locator('//html/body/div[2]/div/div[2]/div[2]/div/div[1]/div[2]/div[1]/p/span').click({ timeout: 3000 });
  } catch (error) {
  }
  // await page.waitForTimeout(2200);
  // try {
  //   await page.locator('//html/body/div[2]/div/div[2]/div[2]/div/div[2]/div[2]/div[2]/div/div[1]/div/div/div[2]').click();
  // } catch (error) {
  // }

  await page.waitForTimeout(2000);
  await scrollBottom(page);
  await page.waitForTimeout(2000);

  //get all the flight details
  const details = await fetchDetails(page);
  //check that table exist or not and create
  await checkOrCreateTable("mmt");
  //insert data into table
  console.log(details[0])
  await insertDataSQL(details, "mmt", searchedData.reference_id);
};
