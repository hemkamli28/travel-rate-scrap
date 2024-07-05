"use client";
import "./table.css";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Link from "next/link";
import { RiFileExcel2Fill } from "react-icons/ri";
import { MdOutlineHistory } from "react-icons/md";
import Loader from "../loader";
import Swal from "sweetalert2";

export default function Table({
  flightData,
  airportData,
  selectedFilters,
  isScrapping,
}) {
  const [flightDataLocal, setFlightDataLocal] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  console.log(flightData);

  useEffect(() => {
    if (flightData?.length > 0) {
      setFilteredData(flightData);
    }
  }, [flightData]);

  console.log(filteredData);

  useEffect(() => {
    if (selectedFilters?.length > 0) {
      const filterData = flightData?.filter((obj) =>
        obj.airline.every((name) => selectedFilters.includes(name))
      );
      console.log("data", filterData);
      setFilteredData(filterData);
    } else {
      setFilteredData(flightData);
    }
  }, [selectedFilters]);

  function formatDate(dateString) {
    const date = new Date(dateString);
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    const formattedDate = `${day} ${months[monthIndex]} ${year}`;

    return formattedDate;
  }

  function getCityNameFromIataCode(iataCode) {
    const airport = airportData.find(
      (airport) => airport.iata_code === iataCode
    );
    return airport ? `${airport.city_name} (${iataCode})` : iataCode; // Return city name if found, otherwise return the IATA code
  }

  const downloadExcel = () => {

    // Function to transform flight data (convert array into string)
    const transformData = (data) => {
      return data?.map((flight) => ({
        ...flight,
        airline: Array.isArray(flight.airline)
          ? flight.airline.join(", ")
          : flight.airline,
        flightNo: Array.isArray(flight.flightNo)
          ? flight.flightNo.join(", ")
          : flight.flightNo,
      }));
    };

    const dataToExport =
      filteredData?.length > 0
        ? transformData(filteredData)
        : transformData(flightDataLocal);
    console.log(dataToExport);
    if (dataToExport) {
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Flight Data");
      XLSX.writeFile(workbook, "flight_data.xlsx");
      Swal.fire({
        title: "Good job!",
        text: "Download Successfully!",
        icon: "success",
      });
    } else {
      Swal.fire({
        title: "Failed!",
        text: "Can't Export!",
        icon: "warning",
      });
    }
  };


  return (
    <div className="main-panel">
      <div className="content-wrapper">
        <div className="row">
          <div className="col-12 grid-margin">
            <div className="card">
              <div className="excel-btn">
                {flightData.length > 0 && (
                  <button className="e-btn" onClick={downloadExcel}>
                    Export <RiFileExcel2Fill className="btn_icon" />
                  </button>
                )}
              </div>
              <div className="card-body">
                <div className="table-wrapper">
                  {isScrapping === true ? (
                    <Loader />
                  ) : filteredData?.length > 0 ? (
                    <table className="table">
                      <thead className="th-data">
                        <tr>
                          <th>Departure Location</th>
                          <th>Departure Date</th>
                          <th>Arrival Location</th>
                          <th>Arrival Date</th>
                          <th>Airline Name</th>
                          <th>Direct</th>
                          <th>Flight No.</th>
                          <th>FairType</th>

                          <th>TBO Publish Price</th>
                          <th>TBO Offer Price</th>

                          <th>FTD Publish Price</th>
                          <th>FTD Offer Price</th>
                          <th>FTD Publish Difference Rate</th>
                          <th>FTD Publish Difference Percentage</th>
                          <th>FTD Offer Difference Rate</th>
                          <th>FTD Offer Difference Percentage</th>

                          <th>MMT Price</th>
                          <th>MMT Difference Rate</th>
                          <th>MMT Difference Percentage</th>

                          <th>IXIGO Price</th>
                          <th>IXIGO Difference Rate</th>
                          <th>IXIGO Difference Percentage</th>

                          <th>EXPEDIA Price</th>
                          <th>EXPEDIA Difference Rate</th>
                          <th>EXPEDIA Difference Percentage</th>

                          <th>QUNAR Offer Price</th>
                          <th>QUNAR Offer Difference Rate</th>
                          <th>QUNAR Offer Difference Percentage</th>

                          <th>Lowest Offer Price</th>
                          <th>Lowest Supplier Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData?.map((flight, index) => {
                          const filteredFlight = Object.entries(flight).filter(
                            ([key]) => key !== "reference_id"
                          );
                          return (
                            <tr key={index}>
                              {filteredFlight.map(([key, value], idx) => (
                                <td key={idx}>
                                  {value === "" ||
                                  value === null ||
                                  value === undefined ? (
                                    "--"
                                  ) : key === "departure_location" ||
                                    key === "arrival_location" ? (
                                    getCityNameFromIataCode(value)
                                  ) : key === "departure_date" ||
                                    key === "arrival_date" ? (
                                    formatDate(value)
                                  ) : key === "flight_no" &&
                                    Array.isArray(value) ? (
                                    <span
                                      dangerouslySetInnerHTML={{
                                        __html: value.join("<br />"),
                                      }}
                                    />
                                  ) : (
                                    value
                                  )}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="logo">
                      <img src="/4873.jpg" className="welcome_logo" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
