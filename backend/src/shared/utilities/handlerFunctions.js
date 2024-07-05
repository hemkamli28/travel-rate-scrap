export const locateAndClick = async (page, xpath) => {
  try {
    await page?.locator(xpath)?.click();
  } catch (error) {
    throw error;
  }
};

export const compareArrays = (arr1, arr2) => {
  if (arr1?.length !== arr2?.length) {
    return false;
  }

  const sortedArr1 = arr1?.slice().sort();
  const sortedArr2 = arr2?.slice().sort();

  for (let i = 0; i < sortedArr1?.length; i++) {
    const sortedObj1 = Object?.keys(sortedArr1[i])
      ?.sort()
      ?.reduce((obj, key) => {
        obj[key] = sortedArr1[i][key];
        return obj;
      }, {});

    const sortedObj2 = Object?.keys(sortedArr2[i])
      ?.sort()
      ?.reduce((obj, key) => {
        obj[key] = sortedArr2[i][key];
        return obj;
      }, {});

    const str1 = JSON?.stringify(sortedObj1);
    const str2 = JSON?.stringify(sortedObj2);

    if (str1 !== str2) {
      return false;
    }
  }

  return true;
};

export const waitForRender = async (page, selector) => {
  try {
    await page?.waitForSelector(selector, { timeout: 4500 });
  } catch (error) {
    throw error;
  }
};

export const getInputAndFill = async (page, searchedData) => {
  try {
    await page
      ?.getByPlaceholder("From")
      ?.fill(searchedData?.departure_location);
    await page?.waitForTimeout(1000);

    await page?.keyboard.press("ArrowDown");
    await page?.keyboard.press("Enter");
    await page?.waitForTimeout(1000);
    await page
      ?.locator(
        "//html/body/div[1]/div/div[2]/div/div/div/div/div[2]/div[1]/div[2]"
      )
      .click();
    await page?.waitForTimeout(700);

    await page?.getByPlaceholder("To").fill(searchedData.arrival_location);
    await page?.waitForTimeout(1000);

    await page?.keyboard.press("ArrowDown");
    await page?.keyboard.press("Enter");
  } catch (error) {
    throw error;
  }
};

export const scrollBottom = async (page) => {
  try {
    for (let i = 0; i < 12; i++) {
      await page?.keyboard?.press("End");
    }
  } catch (error) {
    throw error;
  }
};

export const fetchDetails = async (page) => {
  try {

    const price1 = await page?.$$eval(".clusterViewPrice", (els) => {
      return els?.map((el) => el?.textContent.slice(0, -9));
    });
    const price2 = await page?.$$eval(".clusterSmViewPrice", (els) => {
      return els?.map((el) => el?.textContent);
    });
    const price = price1?.concat(price2);

    const flightCode = await page?.$$eval(".fliCode", (els) => {
      return els?.map((el) => el?.textContent);
    });


    let details = [];



    for (let i = 0; i < flightCode?.length; i++) {
      details?.push({
        flight_no: flightCode[i]
          ?.split(", ")
          ?.map((part) => part?.replace(/\s/g, "")),
        price: parseFloat(price[i]?.replace(/[^\d.]/g, "")),
      });
    }

    return details;
  } catch (error) {
    throw error;
  }
};

export const checkMonthTbo = async (page, searchText) => {
  const monthYear = await page?.$$eval(
    "//html/body/div[5]/div[1]/div/div",
    (divs, searchText) => {
      let innerDate = "";
      for (const span of divs) {
        const spans = span?.querySelectorAll("span");
        for (const s of spans) {
          innerDate = innerDate + s?.textContent;
        }
      }
      if (innerDate === searchText?.replace(" ", "")) {
        return true;
      }
      return false;
    },
    searchText
  );

  return monthYear;
};

export const formatDate = async (date) => {
  try {
    const monthNumber = date?.slice(5, 7);
    const year = date?.slice(0, 4);
    let monthName;
    switch (monthNumber) {
      case "01":
        monthName = "January ";
        break;
      case "02":
        monthName = "February ";
        break;
      case "03":
        monthName = "March ";
        break;
      case "04":
        monthName = "April ";
        break;
      case "05":
        monthName = "May ";
        break;
      case "06":
        monthName = "June ";
        break;
      case "07":
        monthName = "July ";
        break;
      case "08":
        monthName = "August ";
        break;
      case "09":
        monthName = "September ";
        break;
      case "10":
        monthName = "October ";
        break;
      case "11":
        monthName = "November ";
        break;
      case "12":
        monthName = "December ";
        break;
      default:
        monthName = "Invalid month number";
    }
    const obj = monthName?.concat(year);
    return obj;
  } catch (error) {
    console.error(error);
  }
};

export const searchByDiv = async (page, searchText, parentDivSelector) => {
  try {
    const divWithText = await page?.$eval(
      parentDivSelector,
      (parentDiv, searchText) => {
        const divs = parentDiv?.querySelectorAll("div");
        for (const div of divs) {
          if (div?.textContent.includes(searchText)) {
            return div.outerHTML;
          }
        }
        return null;
      },
      searchText
    );

    if (divWithText) {
      return true;
    }
    return false;
  } catch (error) {
    throw error;
  }
};

export const searchByDivixigo = async (page, searchText, parentDivSelector) => {
  try {
    const divWithText = await page?.$eval(
      parentDivSelector,
      (parentDiv, searchText) => {
        const divs = parentDiv?.querySelectorAll("span:first-child");
        for (const div of divs) {
          if (div?.textContent.includes(searchText)) {
            return div?.outerHTML;
          }
        }
        return null;
      },
      searchText
    );

    if (divWithText) {
      return true;
    }
    return false;
  } catch (error) {
    throw error;
  }
};
export const searchByExpedia = async (page, searchText, parentDivSelector) => {
  try {
    const divWithText = await page?.$eval(
      parentDivSelector,
      (parentDiv, searchText) => {
        const divs = parentDiv?.querySelectorAll("span:first-child");
        for (const div of divs) {
          if (div?.textContent.includes(searchText)) {
            return div?.outerHTML;
          }
        }
        return null;
      },
      searchText
    );

    if (divWithText) {
      return true;
    }
    return false;
  } catch (error) {
    throw error;
  }
};

export const getDate = async (date) => {
  try {
    const parts = date?.split("-");

    parts[2] = parseFloat(parts[2], 10)?.toString();
    return parts[2];
  } catch (error) {
    throw error;
  }
};

// export const dateClickixigo = async (page, day, classdiv) => {
//   try {
//     await page?.waitForTimeout(2000);
//     const divsWithText = await page?.$$(classdiv);
//     for (const divWithText of divsWithText) {
//       const innerTextField = await divWithText?.$eval(
//         "abbr",
//         (element) => element.textContent
//       );
//       console.log(innerTextField);
//       if (innerTextField == day) {
//         await divWithText.click();
//       }
//     }
//     return true;
//   } catch (error) {
//     throw error;
//   }
// };


export const dateClickixigo = async (page, dateToClick, searchText) => {
  try {
    const splitSearchText = searchText.split(' ');
    const dateCheck = splitSearchText[0].concat(' ',dateToClick, ', ' , splitSearchText[1])

    const mainDiv = await page.evaluate(async (dateCheck) => {
      const allDivs = document.querySelectorAll('.react-calendar__month-view__days');
      for (const oneDiv of allDivs) {
        const allDaysInMonth = oneDiv.querySelectorAll('.react-calendar__tile.react-calendar__month-view__days__day abbr');
        for (const oneDay of allDaysInMonth) {
         
          if (oneDay.ariaLabel == dateCheck) {
            await oneDay.click();
            return true;
          }
        }
      }
      return false;
    }, dateCheck);
  } catch (error) {
    console.error(error);
  }
};

export const dateClickextb = async (page, day, classdiv) => {
  try {
    const divsWithText = await page?.$$(classdiv);

    for (const divWithText of divsWithText) {
      const tdElements = await divWithText?.$$("td");
      for (const tdElement of tdElements) {
        const innerText = await tdElement?.evaluate((element) =>
          element?.textContent.trim()
        );
        if (innerText === day) {
          await tdElement?.click();
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    throw error;
  }
};

export const dateClickEmt = async (page, dateToClick) => {
  try {
    const mainDiv = await page.evaluate((dateToClick) => {
      const allDivs = document.querySelectorAll('.box');
      for (const oneDiv of allDivs) {
        const allDaysInMonth = oneDiv.querySelectorAll('.days ul li');
        for (const oneDay of allDaysInMonth) {
          const index = oneDay.textContent.indexOf('₹');
          const dateCheck = oneDay.textContent.slice(0, index)
          if (dateCheck == dateToClick) {
            oneDay.click();
            return true;
          }
        }
      }
      return false;
    }, dateToClick);
  } catch (error) {
    console.error(error);
  }
};


export const dateClickmmt = async (page, day, classdiv) => {
  try {
    const divsWithText = await page?.$$(classdiv);

    for (const divWithText of divsWithText) {
      const innerText = await divWithText.$eval(
        "p:first-child",
        (element) => element?.textContent
      );
      if (innerText === day) {
        await divWithText?.click();
        break;
      }
    }
    return true;
  } catch (error) {
    console.error(error);
  }
};


export const dateLogic = async (value, date, daysToAdd) => {
  try {
    let [year, month, day] = date?.split("-")?.map((num) => parseFloat(num));

    // Function to check if it's a leap year
    const isLeapYear = (year) =>
      (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

    // Function to calculate days in a month
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
    throw error;
  }
};

export const getformatedDate = (isoDateString) => {
  // Create a Date object from the ISO date string
  const date = new Date(isoDateString);

  // Get the year, month, and day components
  const year = date?.getFullYear();
  const month = String(date?.getMonth() + 1)?.padStart(2, "0");
  const day = String(date?.getDate())?.padStart(2, "0");

  // Format the date as 'YYYY-MM-DD'
  const formattedDate = `${year}-${month}-${day}`;

  return formattedDate;
};

export const checkMonthFtd = async (page, searchText) => {
  const monthYear = await page?.$$eval(
    "//html/body/div[1]/div/div",
    (divs, searchText) => {
      let innerDate = "";
      for (const span of divs) {
        const spans = span?.querySelectorAll("span");
        for (const s of spans) {
          innerDate = innerDate + s?.textContent;
        }
      }
      if (innerDate === searchText?.replace(" ", "")) {
        return true;
      }
      return false;
    },
    searchText
  );

  return monthYear;
};

const getDateFromString = (dateStr) => {
  const [day, monthName] = dateStr?.split(" ");
  const currentDate = new Date();
  const currentYear = currentDate?.getFullYear();
  const date = new Date(currentYear, getMonthIndex(monthName), parseFloat(day));

  if (date < currentDate) {
    date?.setFullYear(currentYear + 1);
  }

  return date;
};

const getMonthIndex = (monthName) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return months?.indexOf(monthName);
};

export const getDayDifference = (dateStr1, dateStr2) => {
  try {
    const date1 = getDateFromString(dateStr1);
    const date2 = getDateFromString(dateStr2);

    const differenceMs = date2 - date1;
    const differenceDays = Math?.ceil(differenceMs / (1000 * 60 * 60 * 24));

    return differenceDays;
  } catch (error) {
    throw error;
  }
};
