import { checkOrCreateTable, getLatestSearchedResult, insertDataSQL } from "../../shared/utilities/dbFunctions.js";
import { dateClickEmt, formatDate, getDate, getformatedDate, searchByDiv } from "../../shared/utilities/handlerFunctions.js";

export const emtHandler = async ({ page, log }) => {

    await page?.waitForTimeout(1000);

    //fetch searched Dara from DB
    const searchedData = await getLatestSearchedResult();
    const date = getformatedDate(searchedData?.date);

    //formate Date
    const searchText = await formatDate(date);
    const day = await getDate(date);

    //click on departure location select
    await page?.locator('//html/body/form/div[3]/div[3]/div/div[3]/div/div[1]').click();
    //type the departure location
    await page.keyboard.type(searchedData?.departure_location, { delay: 100 });
    // await page?.locator('//html/body/form/div[3]/div[3]/div/div[3]/div/div[1]/div[2]/div[1]/input').fill('amd');
    await page?.waitForTimeout(1000);
    //click on 1st suggestion after search
    await page?.locator('//html/body/form/div[3]/div[3]/div/div[3]/div/div[1]/div[2]/div[2]/ul/li[1]').click();

    await page?.waitForTimeout(1000);
    //click on departure location input field
    await page?.locator('//html/body/form/div[3]/div[3]/div/div[3]/div/div[3]').click();
    await page?.waitForTimeout(1000);

    //type the departure location 
    await page.keyboard.type(searchedData?.arrival_location, { delay: 100 });
    await page?.waitForTimeout(1000);
    await page?.locator('//html/body/form/div[3]/div[3]/div/div[3]/div/div[3]/div[2]/div[2]/ul/li[1]').click();

    const splitedDate = searchText.split(' ')
    const monthName = splitedDate[0].slice(0, 3)
    // const capitalizeMonthName = monthName.toUpperCase()
    const dateToBeSearched = monthName.concat(" ", splitedDate[1])
    await page?.waitForTimeout(1000);
    while (
        !(await searchByDiv(page, dateToBeSearched,
            '//html/body/form/div[3]/div[3]/div/div[3]/div/div[4]/div[2]/div/div[1]/div/div[1]'))
    ) {
        //click on next month button
        await page
            .locator(
                "//html/body/form/div[3]/div[3]/div/div[3]/div/div[4]/div[2]/div/div[2]/div/div[1]/div[3]/img"
            )
            .click();
    }
    await dateClickEmt(page, day);
    //click on search
    await page?.locator('//html/body/form/div[3]/div[3]/div/div[3]/div/div[8]/button').click();
    await page?.waitForTimeout(1000);
    let flightData = []
    try {
        await page?.waitForSelector('.col-md-12.col-sm-12.main-bo-lis.pad-top-bot.ng-scope',  { timeout: 5500 });
    }
    catch (e) {
        console.log("")
    }
    const prices = await page?.$$eval(".col-md-10.col-sm-8.col-xs-9.txt-r6-n.exPrc", (els) => {
        return els?.map((el) => el?.textContent.trim().replace(/,/g, ''));
    });
    if (prices.length > 0) {
        //for domestic flights

        const departureTimes = await page?.$$eval(".col-md-2.col-sm-2.col-xs-4.top5 ", (els) => {
            return els?.map((el) => el?.textContent.trim().slice(0, 5));
        });
        const arrivalTimes = await page?.$$eval(".col-md-2.col-sm-2.col-xs-3.top5.txdir ", (els) => {
            return els?.map((el) => el?.textContent.trim().slice(0, 5));
        });
        for (let i = 0; i < prices.length; i++) {
            flightData.push({
                departure_time: departureTimes[i],
                arrival_time: arrivalTimes[i],
                price: parseFloat(prices[i])
            })
        }
    }
    else {

        //for international flights
        await page?.waitForSelector('.list.divHideShow.intow.ng-scope');
        flightData = await page?.$$eval(
            ".list.divHideShow.intow.ng-scope",
            (flightElements) => {
                const details = [];

                for (const flightElement of flightElements) {

                    const price = flightElement?.querySelector(
                        ".r_txt_k.ng-binding.ng-scope"
                    )?.innerText.replace(/,/g, '');

                    const flightCards = flightElement?.querySelectorAll(".flig.mrg1.fltData.om.ng-scope")
                    for (const flightCard of flightCards) {

                        const departureTime = flightCard?.querySelector(
                            ".flig-sr strong"
                        )?.innerText.trim();
                        const arrivalTime = flightCard?.querySelector(
                            ".flig-sr.txt-r strong"
                        )?.innerText.trim();
                        details.push({
                            departure_time: departureTime,
                            arrival_time: arrivalTime.slice(0, 6),
                            price: parseFloat(price)
                        })
                    }
                }

                return details;
            }
        );
    }

    // //check that table exist or not and create
    await checkOrCreateTable("emt");
    // //insert data into table
    await insertDataSQL(flightData, "emt", searchedData?.reference_id);

    await page.screenshot({ path: 'screenshot.png' });
}