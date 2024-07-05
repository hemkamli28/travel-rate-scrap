import {
  checkOrCreateTable,
  getLatestSearchedResult,
  insertDataSQL,
} from "../../shared/utilities/dbFunctions.js";
import {
  checkMonthTbo,
  dateClickextb,
  formatDate,
  getDate,
  getformatedDate,
} from "../../shared/utilities/handlerFunctions.js";
import { getEmails } from "../../shared/utilities/email/readEmail.js";

export const tboHandler = async ({ page, log }) => {
  await page
    ?.locator(
      "//html/body/header/div/div[2]/div/div[2]/form/div[3]/div[3]/div[1]/input[1]"
    )
    ?.fill("juhi@AMDO009");
  await page?.keyboard?.press("Tab");
  await page
    ?.locator(
      "//html/body/header/div/div[2]/div/div[2]/form/div[3]/div[3]/div[1]/input[2]"
    )
    ?.fill("Oneclick9@");
  await page?.keyboard?.press("Enter");

  const searchedData = await getLatestSearchedResult();
  const date = getformatedDate(searchedData?.date);
  console.log(searchedData)
  const searchText = await formatDate(date);
  const day = await getDate(date);
  await page?.waitForTimeout(2000);

  const otp = await getEmails();

  await page?.getByPlaceholder("OTP")?.fill(otp);

  await page?.waitForTimeout(300);
  await page?.keyboard?.press("Enter");
  await page?.waitForTimeout(1300);

  await page?.waitForSelector("//html/body/article/div[2]/div[1]/div[3]/a[2]");
  await page?.locator("//html/body/article/div[2]/div[1]/div[3]/a[2]")?.click();
  await page?.waitForTimeout(400);
  await page?.locator("//html/body/header/div[2]/nav/ul/li[1]/a")?.click();

  await page?.waitForTimeout(3000);

  await page
    ?.locator(
      "//html/body/form/div[1]/div[2]/div/div[2]/div[1]/div[2]/div/div/div[2]/div/div[1]/div/div[1]/div/input"
    )
    ?.click();
  await page
    ?.locator(
      "//html/body/form/div[1]/div[2]/div/div[2]/div[1]/div[2]/div/div/div[2]/div/div[1]/div/div[1]/div/input"
    )
    ?.fill(searchedData.departure_location);
  await page?.waitForTimeout(1000);
  await page?.keyboard?.press("ArrowUp");
  await page?.keyboard?.press("ArrowDown");
  await page?.locator("//html/body/ul/li[1]/a")?.click();

  await page
    ?.locator(
      "//html/body/form/div[1]/div[2]/div/div[2]/div[1]/div[2]/div/div/div[2]/div/div[1]/div/div[2]/input"
    )
    ?.fill(searchedData.arrival_location);
  await page?.waitForTimeout(1000);
  await page?.keyboard?.press("ArrowUp");
  await page?.keyboard?.press("ArrowDown");
  await page?.locator("//html/body/ul[2]/li[1]/a")?.click();
  await page?.waitForTimeout(200);

  while (!(await checkMonthTbo(page, searchText))) {
    await page?.locator("//html/body/div[5]/div[2]/div/a")?.click();
  }
  await dateClickextb(page, day, "//html/body/div[5]/div[1]/table/tbody");
  await page
    ?.locator(
      "//html/body/form/div[1]/div[2]/div/div[2]/div[1]/div[2]/div/div/div[4]/div/div[2]/div/div[2]/button"
    )
    .click();
  await page?.waitForTimeout(4000);

  const flightDataCards = await page?.$$eval(
    ".flightresult_grid_inner",
    (flightCards, date) => {
      const flightDetails = [];
      let direct = true;

      for (const flightElement of flightCards) {
        const airlineName =
          flightElement?.querySelector(".mobile_not").innerText;
        const airlineCodes = flightElement?.querySelectorAll(
          ".airlinecode .fleft "
        );

        const dateLogic = (value, date, daysToAdd) => {
          try {
            let [year, month, day] = date
              ?.split("-")
              ?.map((num) => parseFloat(num));

            const isLeapYear = (year) =>
              (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

            const daysInMonth = (year, month) => {
              const daysPerMonth = [
                31,
                isLeapYear(year) ? 29 : 28,
                31,
                30,
                31,
                30,
                31,
                31,
                30,
                31,
                30,
                31,
              ];
              return daysPerMonth[month - 1];
            };

            if (value) {
              day += daysToAdd;
              while (day > daysInMonth(year, month)) {
                day -= daysInMonth(year, month);
                month++;
                if (month > 12) {
                  month = 1;
                  year++;
                }
              }
            }

            month = month < 10 ? `0${month}` : month;
            day = day < 10 ? `0${day}` : day;

            return `${year}-${month}-${day}`;
          } catch (error) {
            return date;
          }
        };

        const flightNos = [];

        for (const airCode of airlineCodes) {
          const [iataCode, numberString] = airCode?.innerText?.split(" - ");
          const flightNumber = numberString?.replace(/[^\d]/g, "");
          flightNos?.push(iataCode + flightNumber);
        }

        const directOrNot = flightElement?.querySelector(".stopbx")?.innerText; //1 stop via Name
        if (directOrNot?.includes("Stop")) {
          direct = false;
        }

        const durationDivs = flightElement?.querySelectorAll(".dur_time");
        let arrival_date = date;

        for (const div of durationDivs) {
          const span = div?.querySelector("span");
          if (span) {
            const spanNumber = parseFloat(span?.textContent.trim().slice(2, 3));
            arrival_date = dateLogic(true, date, spanNumber);
          }
        }
        
        const prices = [];
        const priceContents = flightElement?.querySelectorAll(".flmiddlecnt");

        for (const ele of priceContents) {
          const pubpricebx = ele?.querySelectorAll(".pubpricebx");
          const offerpricebx = ele?.querySelectorAll(".flofferbx");
          const priceTagDiv = ele?.querySelectorAll(".pricebx_tag");

          for (let i = 0; i < pubpricebx?.length; i++) {
            const pubprice = pubpricebx[i]?.innerText
              .match(/\d+/g)
              ?.join("")
              ?.slice(0, -2);
            const offprice = offerpricebx[i]?.innerText
              .match(/\d+/g)
              ?.join("")
              ?.slice(0, -2);
            const ptag = priceTagDiv[i]?.innerText?.trim();
            //to remove duplicates
            const typeExists = prices?.some(
              (priceObj) => priceObj?.type === ptag
            );

            if (!typeExists) {
              const priceObj = {
                id: prices?.length + 1,
                pubPrice: parseFloat(pubprice),
                offPrice: parseFloat(offprice),
                type: ptag,
              };

              prices?.push(priceObj);
            }

            // for(const price of prices)
            // {
            //   if(price.type == 'Publish')
            //   {
            //     price.pubPrice
            //   }
            // }
          }
        }

        const departureTime = flightElement.querySelector('.fdepbx tt:nth-of-type(2)').innerText;
        const arrivalTime = flightElement.querySelector('.farrbx tt:nth-of-type(2)').innerText;
        // const flightTime = page.$eval('.fdepbx ', el => el.textContent);

        // const priceObject = prices.find(item =>( item.type == 'Publish' || item.type == 'Saver'))?? prices[0] ;
        const priceObject =
          prices.find(
            (item) => item.type == "Publish" || item.type == "Saver"
          ) ?? prices[0];

        const offerPrice = Math.min(...prices.map((item) => item.offPrice));

        const newObject = {
          fareType: priceObject.type,
          publishPrice: priceObject.pubPrice,
          offerPrice: offerPrice,
        };

        const airlineArray = [];

        airlineArray?.push(airlineName);
        flightDetails?.push({
          flight_no: flightNos,
          departure_time : departureTime,
          arrival_time : arrivalTime,
          airline: airlineArray,
          departure_date: date,
          arrival_date,
          price: newObject,
          direct,
        });
      }
      return flightDetails;
    },
    date
  );
  

  await checkOrCreateTable("tbo");
  await insertDataSQL(flightDataCards, "tbo", searchedData?.reference_id);
};
