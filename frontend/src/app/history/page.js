"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { IoIosAirplane } from "react-icons/io";
import styles from "./history.module.css";
import Link from "next/link";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { getCookie } from "cookies-next";

export default function Page() {
  const router = useRouter();
  const [array, setArray] = useState([]);
  const [departureDates, setDepartureDates] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [airportData, setAirportData] = useState([]);
  const [selectedDepartureDate, setSelectedDepartureDate] = useState("");
  const [scrapDates, setScrapDates] = useState([]);
  const [selectedScrapDate, setSelectedScrapDate] = useState("");
  const [filteredDepartureDates, setFilteredDepartureDates] = useState([]);
  const [filteredScrapDates, setFilteredScrapDates] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [selectedRoutes, setSelectedRoutes] = useState("");
  const [token] = useState(getCookie("access-token"));
  useEffect(() => {
    historyData();
    fetchAirportData();
  }, []);

  const handleDownload = async (value) => {
    try {
      const response = await axios.get(
        `http://10.0.2.43:5000/scrap/download/${value.file_name}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );
      console.log(response);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      link.setAttribute("download", value.file_name);

      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
    } catch (error) {
      Swal.fire({ title: "Error", text: error.message, icon: "error" });
      console.error("Download error:", error);
    }
  };
  const historyData = async () => {
    try {
      const response = await axios.get("http://10.0.2.43:5000/scrap/history");
      const updateHistoryArray = response.data.data.map((obj) => {
        const route = obj.departure_location + obj.arrival_location;
        return { ...obj, route };
      });
      const uniqueDepartureDates = [
        ...new Set(updateHistoryArray.map((item) => item.date)),
      ];
      const uniqueScrapDates = [
        ...new Set(updateHistoryArray.map((item) => item.searched_at)),
      ];
      const uniqueRoutes = [
        ...new Set(updateHistoryArray.map((item) => item.route)),
      ];

      setDepartureDates(uniqueDepartureDates);
      setRoutes(uniqueRoutes);
      setScrapDates(uniqueScrapDates);

      setArray(updateHistoryArray);
      console.log(updateHistoryArray);
    } catch (error) {
      console.log("error", error);
    }
  };

  const fetchAirportData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/airportdata");
      setAirportData(response.data);
    } catch (error) {
      console.log("Error fetching airport data:", error);
    }
  };

  useEffect(() => {
    filterResults();
  }, [selectedRoutes, selectedDepartureDate, selectedScrapDate]);

  useEffect(() => {
    matchRouteFilter();
  }, [selectedRoutes, selectedDepartureDate]);

  const matchRouteFilter = () => {
    const filteredByRoute = array.filter((item) => {
      return item.route === selectedRoutes;
    });

    const departureDatesForRoute = [
      ...new Set(filteredByRoute.map((item) => item.date)),
    ];

    const filteredByDepartureDate = filteredByRoute.filter((item) => {
      return item.date === selectedDepartureDate;
    });

    const scrapDatesForRoute = [
      ...new Set(filteredByDepartureDate.map((item) => item.searched_at)),
    ];

    setFilteredDepartureDates(departureDatesForRoute);
    setFilteredScrapDates(scrapDatesForRoute);
  };

  const filterResults = () => {
    const filtered = array.filter((item) => {
      return (
        (!selectedRoutes || item.route === selectedRoutes) &&
        (!selectedDepartureDate || item.date === selectedDepartureDate) &&
        (!selectedScrapDate || item.searchedA_at === selectedScrapDate)
      );
    });
    setFilteredResults(filtered);
  };

  const handleDepartureDateChange = (event) => {
    setSelectedDepartureDate(event.target.value);
  };

  const handleRouteChange = (event) => {
    setSelectedRoutes(event.target.value);
  };

  const handleScrapDateChange = (event) => {
    setSelectedScrapDate(event.target.value);
  };

  const handleClearFilters = () => {
    setSelectedRoutes("");
    setSelectedDepartureDate("");
    setSelectedScrapDate("");
    setFilteredResults(array);
  };

  console.log("ResulteD", array);

  const getCityName = (iata_codes) => {
    const ic1 = iata_codes?.slice(0, 3);
    const ic2 = iata_codes?.slice(3, 6);

    const airport1 = airportData?.find((airport) => airport?.iata_code === ic1);
    const airport2 = airportData?.find((airport) => airport?.iata_code === ic2);

    const cityName1 = airport1 ? airport1?.city_name : "Unknown City";
    const cityName2 = airport2 ? airport2?.city_name : "Unknown City";

    const c1 = `${cityName1} (${ic1})`;
    const c2 = `${cityName2} (${ic2})`;

    return [c1, c2];
  };
  const handleDelete = async (id) => {
    try {
      const confirmResult = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (confirmResult.isConfirmed) {
        await axios.delete(`http://10.0.2.43:5000/scrap/history/${id}`);

        await Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success",
        });

        historyData();
      }
    } catch (error) {
      console.error("Error deleting entry:", error);

      // Show error message
      Swal.fire({
        title: "Error!",
        text: "Failed to delete the entry. Please try again later.",
        icon: "error",
      });
    }
  };

  const handleDeleteAll = async () => {
    try {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          const response = axios.delete(
            `http://10.0.2.43:5000/scrap/history/clear `
          );
          setArray([]);
          if (response?.data?.data === true) {
            Swal.fire({
              title: "Deleted!",
              text: "Your file has been deleted.",
              icon: "success",
            });
          }
        }
      });
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const handleSearch = (event, options, setFilteredOptions) => {
    const query = event.target.value.toLowerCase();
    setFilteredOptions(
      options.filter((option) => option.toLowerCase().includes(query))
    );
  };

  return (
    <div className={styles.maincontainer}>
      <div className={styles.title}>Scrap History</div>
      <div className={styles.dropdown_container}>
        <div className={styles.dropdown}>
          <select
            className={styles.suggestions}
            onChange={handleRouteChange}
            onKeyDown={(e) => handleSearch(e, routes, setFilteredRoutes)}
            value={selectedRoutes}
          >
            <option value="" disabled selected>
              Select Routes
            </option>
            {filteredRoutes.length > 0
              ? filteredRoutes.map((location, index) => {
                  const [c1, c2] = getCityName(location);
                  return (
                    <option key={index} value={location}>
                      {c1} - {c2}
                    </option>
                  );
                })
              : routes.map((location, index) => {
                  const [c1, c2] = getCityName(location);
                  return (
                    <option key={index} value={location}>
                      {c1} - {c2}
                    </option>
                  );
                })}
          </select>
        </div>

        <div className={styles.dropdown}>
          <select
            onChange={handleDepartureDateChange}
            disabled={!selectedRoutes}
            onKeyDown={(e) =>
              handleSearch(e, departureDates, setFilteredDepartureDates)
            }
            value={selectedDepartureDate}
          >
            <option value="" disabled selected>
              Departure Date
            </option>
            {filteredDepartureDates.map((date, index) => (
              <option key={index} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.dropdown}>
          <select
            onChange={handleScrapDateChange}
            disabled={selectedRoutes && selectedDepartureDate ? false : true}
            onKeyDown={(e) =>
              handleSearch(e, scrapDates, setFilteredScrapDates)
            }
            value={selectedScrapDate}
          >
            <option value="" disabled selected>
              Scrap Date
            </option>
            {filteredScrapDates.map((date, index) => (
              <option key={index} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>

        {(selectedRoutes || selectedDepartureDate || selectedScrapDate) && (
          <button className={styles.clearFilters} onClick={handleClearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      <div className={styles.container}>
        <div className={styles.childcontainer}>
          {(filteredResults.length > 0 ? filteredResults : array).map(
            (value, index) => {
              return (
                <div className={styles.cardelement} key={index}>
                  <div className={styles.scrapDate}>
                    <p className={styles.scrap_title}>Scrap Date</p>
                    <p className={styles.display_date}>{value.created_at}</p>
                  </div>
                  <p>
                    {
                      getCityName(
                        value.departure_location + value.arrival_location
                      )[0]
                    }
                  </p>
                  <IoIosAirplane className={styles.planeicon} />
                  <p>
                    {
                      getCityName(
                        value.departure_location + value.arrival_location
                      )[1]
                    }
                  </p>
                  <p className="date">{value.date}</p>
                  <div className={styles.btn}>
                    <button className={styles.linkbtn}>
                      <a  onClick={() => handleDownload(value)}>
                        Download
                      </a>
                    </button>
                  </div>
                  <RiDeleteBin6Line
                    className={styles.delete_icon}
                    onClick={() => handleDelete(value.reference_id)}
                  />
                </div>
              );
            }
          )}
          {filteredResults.length === 0 && array.length === 0 && (
            <img src="notFound.svg" className={styles.not_Found}></img>
          )}
        </div>
      </div>
      <div className={styles.both}>
        <Link href="/" className={styles.back}>
          Go Back
        </Link>
        {array.length > 0 && (
          <button className={styles.clear} onClick={handleDeleteAll}>
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
