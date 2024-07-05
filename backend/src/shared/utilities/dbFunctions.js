import { connection } from "../../config/db.js";
import ExcelJS from "exceljs";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import moment from "moment";

import bcrypt from "bcryptjs";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from "./errorClasses.js";

export const getAirlineIataCode = async (airline) => {
  try {
    const [rows] = await connection
      ?.promise()
      ?.query(
        `SELECT iata FROM airlineIata where airline LIKE '%${airline}%' LIMIT 1;`
      );
    return rows;
  } catch (error) {
    throw error;
  }
};

export const checkOrCreateTable = async (tableName) => {
  try {
    let createTableQuery;
    if (tableName == "tbo") {
      createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        reference_id VARCHAR(255), 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        arrival_date DATE,
        departure_time VARCHAR(10),
        arrival_time VARCHAR(10),
        flight_no JSON,
        airline JSON,
        price JSON,
        direct BOOLEAN
    );
      `;
    } else {
      createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reference_id VARCHAR(255),
        ${
          tableName == "expedia" || tableName == "emt"
            ? "departure_time VARCHAR(10) , arrival_time VARCHAR(10)"
            : "flight_no JSON"
        },
        price ${tableName == "ftd" ? "JSON" : "DECIMAL(10, 2)"}
    );
      `;
    }
    await connection?.promise().query(createTableQuery);
  } catch (error) {
    throw error;
  }
};

export const insertDataSQL = async (data, tableName, refId) => {
  try {
    for (const item of data) {
      const {
        arrival_date,
        flight_no,
        departure_time,
        arrival_time,
        airline,
        price,
        direct,
      } = item;

      let sql;
      let values;

      if (tableName === "tbo") {
        sql = `INSERT INTO \`${tableName}\` (reference_id, arrival_date, departure_time ,arrival_time ,flight_no, airline, price, direct) VALUES (?,?,?,?,?,?,?,?)`;
        values = [
          refId,
          arrival_date,
          departure_time,
          arrival_time,
          flight_no,
          airline,
          price,
          direct,
        ];
      } else {
        if (tableName === "expedia" || tableName === "emt") {
          sql = `INSERT INTO \`${tableName}\` (reference_id, departure_time, arrival_time, price) VALUES (?,?,?,?)`;
          values = [refId, departure_time, arrival_time, price];
        } else {
          sql = `INSERT INTO \`${tableName}\` (reference_id, flight_no, price) VALUES (?,?,?)`;
          values = [refId, flight_no, price];
        }
      }

      await connection?.promise().execute(sql, values);
    }
  } catch (error) {
    throw error;
  }
};

export const createComparisonResultsTable = async () => {
  try {
    const createTableQuery = `
            CREATE TABLE IF NOT EXISTS result(
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          reference_id VARCHAR(255),
          departure_location VARCHAR(255),
          departure_date DATE,
          departure_time VARCHAR(5),
          arrival_location VARCHAR(255),
          arrival_date DATE,
          arrival_time VARCHAR(5),
          airline JSON,
          direct BOOLEAN,
          flight_no JSON,
          fare_type VARCHAR(50),
          tbo_publish_price DECIMAL(10, 2),
          tbo_offer_price DECIMAL(10, 2),
          tbo_difference_rate DECIMAL(10,2),
          tbo_difference_percentage DECIMAL(5, 2),
          ftd_offer_price DECIMAL(10, 2),
          ftd_offer_difference_rate DECIMAL(10, 2),
          ftd_offer_difference_percentage DECIMAL(5, 2),
          qunar_offer_price DECIMAL(10, 2),
          qunar_offer_difference_rate DECIMAL(10, 2),
          qunar_offer_difference_percentage DECIMAL(5, 2),
          mmt DECIMAL(10, 2),
          mmt_difference_rate DECIMAL(10, 2),
          mmt_difference_percentage DECIMAL(5, 2),
          emt DECIMAL(10, 2),
          emt_difference_rate DECIMAL(10, 2),
          emt_difference_percentage DECIMAL(5, 2),
          ixigo DECIMAL(10, 2),
          ixigo_difference_rate DECIMAL(10, 2),
          ixigo_difference_percentage DECIMAL(5, 2),
          expedia DECIMAL(10, 2),
          expedia_difference_rate DECIMAL(10, 2),
          expedia_difference_percentage DECIMAL(5, 2),
          lowest_offer_price DECIMAL(10, 2),
          supplier_max_percentage DECIMAL(5, 2),
          lowest_offer_supplier VARCHAR(15)
        )
        `;

    await connection?.promise().query(createTableQuery);
  } catch (error) {
    throw error;
  }
};

export const compareDataAndJoin = async (refId) => {
  try {
    const joinQuery = `
    WITH CalculatedPrices AS (
       SELECT
         search_history.reference_id,
         search_history.departure_location,
         search_history.date AS departure_date,
         search_history.arrival_location,
         tbo.arrival_date,
         tbo.airline,
         tbo.flight_no,
         tbo.departure_time,
         tbo.arrival_time,
         tbo.direct,
         JSON_EXTRACT(tbo.price, '$.fareType') AS fare_type,
         JSON_EXTRACT(tbo.price, '$.publishPrice') AS tbo_publish_price,
         JSON_EXTRACT(tbo.price, '$.offerPrice') AS tbo_offer_price,
         JSON_EXTRACT(tbo.price, '$.publishPrice') - JSON_EXTRACT(tbo.price, '$.offerPrice') AS tbo_difference_rate,
         ROUND((JSON_EXTRACT(tbo.price, '$.publishPrice') - JSON_EXTRACT(tbo.price, '$.offerPrice')) / JSON_EXTRACT(tbo.price, '$.publishPrice') * 100, 2) AS tbo_difference_percentage,
         JSON_EXTRACT(ftd.price, '$.netFare') AS ftd_offer_price,
         JSON_EXTRACT(tbo.price, '$.publishPrice') - JSON_EXTRACT(ftd.price, '$.netFare') AS ftd_offer_difference_rate,
         ROUND((JSON_EXTRACT(tbo.price, '$.publishPrice') - JSON_EXTRACT(ftd.price, '$.netFare')) / JSON_EXTRACT(tbo.price, '$.publishPrice') * 100, 2) AS ftd_offer_difference_percentage,
         qunar.price AS qunar_offer_price,
         qunar.price - JSON_EXTRACT(tbo.price, '$.offerPrice') AS qunar_offer_difference_rate,
         ROUND((JSON_EXTRACT(tbo.price, '$.publishPrice') - qunar.price ) / JSON_EXTRACT(tbo.price, '$.publishPrice') * 100, 2) AS qunar_offer_difference_percentage,
         mmt.price AS mmt,
         mmt.price - JSON_EXTRACT(tbo.price, '$.publishPrice') AS mmt_difference_rate,
         ROUND((mmt.price - JSON_EXTRACT(tbo.price, '$.publishPrice')) / mmt.price * 100, 2) AS mmt_difference_percentage,
         emt.price AS emt,
         emt.price - JSON_EXTRACT(tbo.price, '$.publishPrice') AS emt_difference_rate,
         ROUND((emt.price - JSON_EXTRACT(tbo.price, '$.publishPrice')) / emt.price * 100, 2) AS emt_difference_percentage,
         ixigo.price AS ixigo,
         ixigo.price - JSON_EXTRACT(tbo.price, '$.publishPrice') AS ixigo_difference_rate,
         ROUND((ixigo.price - JSON_EXTRACT(tbo.price, '$.publishPrice')) / ixigo.price * 100, 2) AS ixigo_difference_percentage,
         expedia.price AS expedia,
         expedia.price - JSON_EXTRACT(tbo.price, '$.publishPrice') AS expedia_difference_rate,
         ROUND((expedia.price - JSON_EXTRACT(tbo.price, '$.publishPrice')) / expedia.price * 100, 2) AS expedia_difference_percentage
       FROM
         tbo
         LEFT JOIN mmt ON tbo.flight_no = mmt.flight_no
         AND mmt.reference_id = '${refId}'
         LEFT JOIN search_history ON tbo.reference_id = search_history.reference_id
       LEFT JOIN ixigo ON tbo.flight_no = ixigo.flight_no
         AND ixigo.reference_id = '${refId}'
       LEFT JOIN expedia ON tbo.departure_time = expedia.departure_time AND tbo.arrival_time = expedia.arrival_time
         AND expedia.reference_id = '${refId}'
       LEFT JOIN emt ON tbo.departure_time = emt.departure_time AND tbo.arrival_time = emt.arrival_time
         AND emt.reference_id = '${refId}'
       LEFT JOIN qunar ON tbo.flight_no = qunar.flight_no
         AND qunar.reference_id = '${refId}'
       LEFT JOIN ftd ON tbo.flight_no = ftd.flight_no
         AND ftd.reference_id = '${refId}'
       where tbo.reference_id = '${refId}'
     )
     SELECT *,
       LEAST(
         COALESCE(tbo_offer_price, 999999999),
         COALESCE(ftd_offer_price, 999999999),
         COALESCE(qunar_offer_price, 999999999)
       ) AS lowest_offer_price,
       CASE
         WHEN LEAST(COALESCE(tbo_offer_price, 999999999), COALESCE(ftd_offer_price, 999999999), COALESCE(qunar_offer_price, 999999999)) = COALESCE(tbo_offer_price, 99999999) THEN 'tbo'
         WHEN LEAST(COALESCE(tbo_offer_price, 999999999), COALESCE(ftd_offer_price, 999999999), COALESCE(qunar_offer_price, 999999999)) = COALESCE(ftd_offer_price, 99999999) THEN 'ftd'
         WHEN LEAST(COALESCE(tbo_offer_price, 999999999), COALESCE(ftd_offer_price, 999999999), COALESCE(qunar_offer_price, 999999999)) = COALESCE(qunar_offer_price, 99999999) THEN 'qunar'
       END AS lowest_offer_supplier,
           GREATEST(
         COALESCE(tbo_difference_percentage, -999999999),
         COALESCE(ftd_offer_difference_percentage, -999999999),
         COALESCE(qunar_offer_difference_percentage, -999999999)
       ) AS supplier_max_percentage
     
     FROM CalculatedPrices;
`;
    const [comparedData] = await connection?.promise().query(joinQuery);
    const values = comparedData.map((row) => [
      row?.reference_id,
      row?.departure_location,
      row?.departure_date,
      row?.departure_time,
      row?.arrival_location,
      row?.arrival_date,
      row?.arrival_time,
      JSON?.stringify(row?.airline),
      row?.direct,
      JSON?.stringify(row?.flight_no),
      row?.fare_type,
      row?.tbo_publish_price,
      row?.tbo_offer_price,
      row?.tbo_difference_rate,
      row?.tbo_difference_percentage,
      row?.ftd_offer_price,
      row?.ftd_offer_difference_rate,
      row?.ftd_offer_difference_percentage,
      row?.qunar_offer_price,
      row?.qunar_offer_difference_rate,
      row?.qunar_offer_difference_percentage,
      row?.mmt,
      row?.mmt_difference_rate,
      row?.mmt_difference_percentage,
      row?.emt,
      row?.emt_difference_rate,
      row?.emt_difference_percentage,
      row?.ixigo,
      row?.ixigo_difference_rate,
      row?.ixigo_difference_percentage,
      row?.expedia,
      row?.expedia_difference_rate,
      row?.expedia_difference_percentage,
      row?.lowest_offer_price,
      row?.supplier_max_percentage,
      row?.lowest_offer_supplier,
    ]);

    const insertQuery = `
      INSERT INTO result(
        reference_id, 
        departure_location, 
        departure_date, 
        departure_time,
        arrival_location, 
        arrival_date, 
        arrival_time,
        airline, 
        direct, 
        flight_no, 
        fare_type, 
        tbo_publish_price, 
        tbo_offer_price, 
        tbo_difference_rate,
        tbo_difference_percentage, 
        ftd_offer_price, 
        ftd_offer_difference_rate, 
        ftd_offer_difference_percentage, 
        qunar_offer_price, 
        qunar_offer_difference_rate, 
        qunar_offer_difference_percentage, 
        mmt, 
        mmt_difference_rate, 
        mmt_difference_percentage, 
        emt, 
        emt_difference_rate, 
        emt_difference_percentage, 
        ixigo, 
        ixigo_difference_rate, 
        ixigo_difference_percentage, 
        expedia, 
        expedia_difference_rate, 
        expedia_difference_percentage, 
        lowest_offer_price, 
        supplier_max_percentage,
        lowest_offer_supplier
        ) 
      VALUES ?
    `;

    await connection?.promise().query(insertQuery, [values]);
    return comparedData;
  } catch (error) {
    throw error;
  }
};
export const storeToCsv = async (
  flightsData,
  departureLocation,
  arrivalLocation
) => {
  try {
    const timeDateString = moment().format("YYYYMMDD_HHmmss");

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook?.addWorksheet("flightData");

    sheet.columns = [
      { header: "Departure Location", key: "departure_location", width: 16 },
      { header: "Departure Date", key: "departure_date", width: 16 },
      { header: "Arrival Location", key: "arrival_location", width: 16 },
      { header: "Arrival Date", key: "arrival_date", width: 16 },
      { header: "Airline", key: "airline", width: 16 },
      { header: "Direct", key: "direct", width: 16 },
      { header: "Flight No", key: "flight_no", width: 16 },
      { header: "Fare Type", key: "fare_type", width: 16 },
      { header: "TBO Publish Price", key: "tbo_publish_price", width: 16 },
      { header: "TBO Offer Price", key: "tbo_offer_price", width: 16 },

      { header: "TBO Difference Rate", key: "tbo_difference_rate", width: 16 },
      {
        header: "TBO Difference Percentage",
        key: "tbo_difference_percentage",
        width: 16,
      },
      { header: "FTD Offer Price", key: "ftd_offer_price", width: 16 },
      {
        header: "FTD Offer Difference Rate",
        key: "ftd_offer_difference_rate",
        width: 16,
      },
      {
        header: "FTD Offer Difference Percentage",
        key: "ftd_offer_difference_percentage",
        width: 16,
      },
      { header: "QUNAR", key: "qunar_offer_price", width: 16 },
      {
        header: "QUNAR Difference Rate",
        key: "qunar_offer_difference_rate",
        width: 16,
      },
      {
        header: "QUNAR Difference Percentage",
        key: "qunar_offer_difference_percentage",
        width: 16,
      },
      { header: "MMT", key: "mmt", width: 16 },
      { header: "MMT Difference Rate", key: "mmt_difference_rate", width: 16 },
      {
        header: "MMT Difference Percentage",
        key: "mmt_difference_percentage",
        width: 16,
      },
      { header: "EMT", key: "emt", width: 16 },
      { header: "EMT Difference Rate", key: "emt_difference_rate", width: 16 },
      {
        header: "EMT Difference Percentage",
        key: "emt_difference_percentage",
        width: 16,
      },
      { header: "IXIGO", key: "ixigo", width: 16 },
      {
        header: "IXIGO Difference Rate",
        key: "ixigo_difference_rate",
        width: 16,
      },
      {
        header: "IXIGO Difference Percentage",
        key: "ixigo_difference_percentage",
        width: 16,
      },
      { header: "EXPEDIA", key: "expedia", width: 16 },
      {
        header: "EXPEDIA Difference Rate",
        key: "expedia_difference_rate",
        width: 16,
      },
      {
        header: "EXPEDIA Difference Percentage",
        key: "expedia_difference_percentage",
        width: 16,
      },
      { header: "Lowest Offer Price", key: "lowest_offer_price", width: 16 },
      {
        header: "Supplier Max Percentage",
        key: "supplier_max_percentage",
        width: 16,
      },
      {
        header: "Lowest Offer Supplier",
        key: "lowest_offer_supplier",
        width: 16,
      },
    ];

    flightsData?.forEach((element) => {
      const flight_no = element?.flight_no.join(", ");
      const airline = element?.airline.join(", ");
      sheet.addRow({
        departure_location: element?.departure_location,
        departure_date: element?.departure_date,
        arrival_location: element?.arrival_location,
        arrival_date: element?.arrival_date,
        airline: airline,
        direct: element?.direct,
        flight_no: flight_no,
        fare_type: element?.fare_type,
        tbo_publish_price: element?.tbo_publish_price,
        tbo_offer_price: element?.tbo_offer_price,
        tbo_difference_rate: element?.tbo_difference_rate,
        tbo_difference_percentage: element?.tbo_difference_percentage,

        ftd_offer_price: element?.ftd_offer_price,
        ftd_offer_difference_rate: element?.ftd_offer_difference_rate,
        ftd_offer_difference_percentage:
          element?.ftd_offer_difference_percentage,
        qunar_offer_price: element?.qunar_offer_price,
        qunar_offer_difference_rate: element?.qunar_offer_difference_rate,
        qunar_offer_difference_percentage:
          element?.qunar_offer_difference_percentage,

        mmt: element?.mmt,
        mmt_difference_rate: element?.mmt_difference_rate,
        mmt_difference_percentage: element?.mmt_difference_percentage,
        emt: element?.emt,
        emt_difference_rate: element?.emt_difference_rate,
        emt_difference_percentage: element?.emt_difference_percentage,
        ixigo: element?.ixigo,
        ixigo_difference_rate: element?.ixigo_difference_rate,
        ixigo_difference_percentage: element?.ixigo_difference_percentage,
        expedia: element?.expedia,
        expedia_difference_rate: element?.expedia_difference_rate,
        expedia_difference_percentage: element?.expedia_difference_percentage,
        lowest_offer_price: element?.lowest_offer_price,
        supplier_max_percentage: element?.supplier_max_percentage,
        lowest_offer_supplier: element?.lowest_offer_supplier,
      });
    });
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path?.dirname(__filename);
    const downloadFolder = path?.join(
      __dirname,
      "../../../assets/",
      "downloads"
    );
    if (!fs.existsSync(downloadFolder)) {
      fs.mkdirSync(downloadFolder);
    }
    const filename = `${departureLocation}_${arrivalLocation}flightData${timeDateString}.xlsx`;
    const filepath = path?.join(downloadFolder, filename);
    await workbook.xlsx.writeFile(filepath);
    return filename;
  } catch (error) {
    throw error;
  }
};

export const storeFileName = async (fileName) => {
  try {
    const sql = `
    UPDATE search_history AS sh
      JOIN(
        SELECT created_at
      FROM search_history
      ORDER BY created_at DESC
      LIMIT 1
      ) AS last_row
    ON sh.created_at= last_row.created_at
    SET sh.file_name = ?
        `;

    const [updateResult] = await connection?.promise().query(sql, [fileName]);
    return updateResult;
  } catch (error) {
    throw error;
  }
};

export const insertSearchHistoryTable = async (obj, refId) => {
  try {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS search_history(
          reference_id VARCHAR(255) PRIMARY KEY ,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          departure_location VARCHAR(255) NOT NULL,
          arrival_location VARCHAR(255) NOT NULL,
          date DATE NOT NULL,
          file_name VARCHAR(100)
        )
        `;
    await new Promise((resolve, reject) => {
      connection?.query(createTableQuery, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    const insertQuery = `
        INSERT INTO search_history(reference_id, departure_location, arrival_location, date)
      VALUES(?,?, ?, ?)
      `;

    await new Promise((resolve, reject) => {
      connection?.query(
        insertQuery,
        [refId, obj?.departureLocation, obj?.arrivalLocation, obj?.departureDate],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  } catch (error) {
    throw error;
  }
};

export const getLatestSearchedResult = async () => {
  try {
    const sql = `
     SELECT reference_id, departure_location, arrival_location, date
      FROM search_history
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const [result] = await connection?.promise().query(sql);
    return result[0];
  } catch (error) {
    throw error;
  }
};

export const getSearchedHistory = async () => {
  try {
    const sql = `SELECT reference_id, created_at, departure_location, arrival_location, date, file_name FROM search_history order by created_at desc`;

    const [result] = await connection?.promise().query(sql);
    if (result.length > 0) {
      return result;
    }
  } catch (error) {
    throw error;
  }
};

export const checkTboLatestDataAndSearchedData = async () => {
  try {
    const sql = `SELECT reference_id FROM tbo ORDER BY created_at DESC LIMIT 1`;
    const sql2 = `SELECT reference_id FROM search_history ORDER BY created_at DESC LIMIT 1`;

    const [tboResult] = await connection?.promise().query(sql);
    const [searchResult] = await connection?.promise().query(sql2);
    if (tboResult[0].reference_id == searchResult[0].reference_id) {
      return true;
    }
    return false;
  } catch (error) {
    throw error;
  }
};

export const deleteHistoryItem = async (refId) => {
  try {
    const sql = `
      DELETE FROM search_history
      WHERE reference_id = ?
        `;
    const [result] = await connection?.promise().query(sql, [refId]);
    if (result.affectedRows > 0) {
      return true;
    }
  } catch (error) {
    throw error;
  }
};

export const deleteHistoryAllItems = async () => {
  try {
    const sql = `
      TRUNCATE Table search_history;
      `;
    const [result] = await connection?.promise().query(sql);
    if (result.affectedRows > 0) {
      return true;
    }
    return false;
  } catch (error) {
    throw error;
  }
};

// user functions
export const getAllUsers = async () => {
  try {
  } catch (error) {
    throw error;
  }
};
export const addNewUser = async (username, email, password) => {
  try {
    const createTableQuery = `CREATE TABLE IF NOT EXISTS user (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      user_name VARCHAR(255) UNIQUE, 
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255)
    );`;
    await connection.promise().query(createTableQuery);

    const [existingUsers] = await connection
      .promise()
      .query("SELECT id FROM user WHERE email = ? OR user_name = ?", [
        email,
        username,
      ]);

    if (existingUsers.length > 0) {
      throw new ConflictException("User already exists!");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const insertQuery = `INSERT INTO user(user_name, email, password) VALUES(?,?,?)`;
    const values = [username, email, hash];
    const [result] = await connection.promise().execute(insertQuery, values);

    if (result.affectedRows > 0) {
      const [user] = await connection
        .promise()
        .query("SELECT id, user_name, email FROM user WHERE id = ?", [
          result.insertId,
        ]);
      return user[0];
    } else {
      throw new UnprocessableEntityException("User creation failed");
    }
  } catch (error) {
    throw error;
  }
};

export const checkUserLogin = async (identifier, password) => {
  try {
    const [userRows] = await connection
      ?.promise()
      .query(
        "SELECT id, user_name, email, password FROM user WHERE email = ? OR user_name = ?",
        [identifier, identifier]
      );
    if (userRows.length === 0) {
      throw new NotFoundException("User not found");
    }

    const foundUser = userRows[0];

    const isPasswordMatch = await bcrypt.compare(password, foundUser.password);

    if (!isPasswordMatch) {
      throw new UnauthorizedException("Invalid password");
    }
    const { password: userPassword, ...user } = foundUser;

    return user;
  } catch (error) {
    throw error;
  }
};

export const getUserEmail = async (email) => {
  try {
    const [userRows] = await connection
      ?.promise()
      .query("SELECT user_name, email FROM user where email = ?", [email]);
    if (userRows.length === 0) {
      throw new NotFoundException("User not found");
    }
    return userRows[0];
  } catch (error) {
    throw error;
  }
};

export const generateOtp = async (email) => {
  try {
    const randomNum = Math.random() * 9000;
    const otp = Math.floor(1000 + randomNum);

    const createOtpTableQuery = `CREATE TABLE IF NOT EXISTS otp (
      id INT PRIMARY KEY AUTO_INCREMENT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      email VARCHAR(255) UNIQUE, 
      otp INT(4),
      is_expired BOOLEAN DEFAULT FALSE
    );`;

    await connection.promise().query(createOtpTableQuery);

    const selectEmailQuery = `SELECT email FROM otp WHERE email = ?;`;
    const [rows] = await connection
      .promise()
      .execute(selectEmailQuery, [email]);

    const isEmailExist = rows.length > 0;

    if (isEmailExist) {
      const updateOtpQuery = `UPDATE otp SET otp = ?, is_expired = FALSE, updated_at = CURRENT_TIMESTAMP WHERE email = ?;`;
      const updateValues = [otp, email];
      await connection.promise().execute(updateOtpQuery, updateValues);
    } else {
      const insertOtpQuery = `INSERT INTO otp(email, otp) VALUES(?,?)`;
      const insertValues = [email, otp];
      const [result] = await connection
        .promise()
        .execute(insertOtpQuery, insertValues);

      if (result.affectedRows === 0) {
        throw new Error("Failed to Generate OTP");
      }
    }

    return otp;
  } catch (error) {
    throw error;
  }
};

export const validateOtp = async (email, enteredOtp) => {
  try {
    const selectOtpQuery = `SELECT otp, is_expired, created_at, updated_at FROM otp WHERE email = ?`;
    const [rows] = await connection.promise().execute(selectOtpQuery, [email]);

    if (rows.length === 0) {
      throw new NotFoundException("Email Not found");
    }
    const { otp, updated_at, is_expired } = rows[0];

    const currentTime = moment();
    const otpCreationTime = moment(updated_at, "YYYY-MM-DD HH:mm:ss");
    const timeDifference = currentTime.diff(otpCreationTime, "minutes");

    if (is_expired || timeDifference > 5) {
      const updateOtpQuery = `UPDATE otp SET is_expired = TRUE, updated_at = CURRENT_TIMESTAMP WHERE email = ?`;
      await connection.promise().execute(updateOtpQuery, [email]);
      throw new BadRequestException("OTP has expired");
    }

    if (otp == enteredOtp) {
      const updateOtpQuery = `UPDATE otp SET is_expired = TRUE, updated_at = CURRENT_TIMESTAMP WHERE email = ?`;
      await connection.promise().execute(updateOtpQuery, [email]);
      return true;
    } else {
      throw new BadRequestException("Invalid OTP");
    }
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (email, password) => {
  try {
    const salt = await bcrypt?.genSalt(10);
    const hash = await bcrypt?.hash(password, salt);

    const updatePasswordQuery = `UPDATE user SET password =? WHERE email =?`;
    const updateValues = [hash, email];
    const [result] = await connection
      ?.promise()
      .execute(updatePasswordQuery, updateValues);

    if (result?.affectedRows > 0) {
      return true;
    } else {
      throw new Error("Password Failed to reset");
    }
  } catch (error) {
    throw error;
  }
};

//Cron job db functions

export const checkAndInsertSchedule = async (
  departureLocation,
  departureDate,
  arrivalLocation,
  departureDays,
) => {
  try {
    const createScheuleTableQuery = `
      CREATE TABLE IF NOT EXISTS scheduled_route(
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        departure_location VARCHAR(255) NOT NULL,
        arrival_location VARCHAR(255) NOT NULL,
        departure_date DATE NOT NULL,
        departure_days JSON
    );
      `;
    await connection.promise().query(createScheuleTableQuery);
    const insertScheduledQuery = `INSERT INTO scheduled_route(departure_location, arrival_location, departure_date, departure_days)
      VALUES(?,?, ?, ?)`;

    const result = await new Promise((resolve, reject) => {
      connection.query(
        insertScheduledQuery,
        [
          departureLocation,
          arrivalLocation,
          departureDate,
          JSON.stringify(departureDays),
        ],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
    console.log("cjecscheidleJOB", result);
    if (result.affectedRows > 0) {
      return true;
    }
  } catch (error) {
    throw error;
  }
};

export const deleteScheduledRoute = async (refId) => {
  try {
    const sql = `
      DELETE FROM scheduled_route
      WHERE reference_id = ?
        `;
    const [result] = await connection?.promise().query(sql, [refId]);
    if (result.affectedRows > 0) {
      return true;
    }
  } catch (error) {
    throw error;
  }
};
export const deleteAllScheduledRoute = async () => {
  try {
    const countQuery = "SELECT COUNT(*) as count FROM scheduled_route";
    const [countResult] = await connection.promise().query(countQuery);
    const rowCount = countResult[0].count;

    if (rowCount < 1) {
      return false;
    }

    const truncateQuery = "TRUNCATE TABLE scheduled_route";
    await connection.promise().query(truncateQuery);
    return true;
  } catch (error) {
    throw error;
  }
};

export const getAllScheduledRoute = async () => {
  try {
    const sql = `SELECT departure_location, arrival_location, departure_date, departure_days FROM scheduled_route`;

    const [result] = await connection?.promise().query(sql);
    if (result.length > 0) {
      return result;
    }
    return false;
  } catch (error) {
    throw error;
  }
};
