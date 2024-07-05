"use client";
import { FaExchangeAlt } from "react-icons/fa";
import "./page.css";
import React, { useState, useEffect } from "react";
import Autosuggest from "react-autosuggest";
import axios from "axios";
import Swal from "sweetalert2";
import airportDumpData from "@/components/Form/airport-dump-json";
import { getCookie} from "cookies-next";

import CollapsibleTable from "@/components/DataTable/datatable";

function Ac({ selectedFilters, setAvailableAirlines }) {
  const [fromValue, setFromValue] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toValue, setToValue] = useState("");
  const [toSuggestions, setToSuggestions] = useState([]);
  const [dateValue, setDateValue] = useState("");
  const [flightData, setFlightData] = useState([]);
  const [iatacode, setIataCode] = useState([]);
  const [isScraping, setIsScraping] = useState(false);
  const [airportData, setAirportData] = useState([]);
  const [accessToken, setAccessToken] = useState(getCookie("access-token"));


  useEffect(() => {
    const fetchData = async () => {
      const data = await airportDumpData;
      setAirportData(data?.airport);
    };

    fetchData();
  }, []);

  const onFromChange = (event, { newValue }) => {
    setFromValue(newValue);
  };

  const onToChange = (event, { newValue }) => {
    setToValue(newValue);
  };

  const handleDateChange = (e) => {
    setDateValue(e.target.value);
  };

  const handleSubmit = async () => {
    if (fromValue && toValue && dateValue) {
      const fromMatchingCityObj = airportData.find(
        (obj) => obj.city_name === fromValue
      );
      const toMatchingCityObj = airportData.find(
        (obj) => obj.city_name === toValue
      );

      if (!fromMatchingCityObj || !toMatchingCityObj) {
        Swal.fire({
          title: "Error",
          text: "Invalid city name",
          icon: "error",
        });
        return;
      }

      const requestData = {
        source: fromMatchingCityObj.iata_code,
        dest: toMatchingCityObj.iata_code,
        date: dateValue,
      };

      if (requestData.source === requestData.dest) {
        Swal.fire({
          icon: "warning",
          title: "Location Could not be the same!",
          showConfirmButton: false,
          timer: 2000,
        });
        return;
      }

      try {
        setIsScraping(true);
        const response = await axios.post("http://10.0.2.43:5000/scrap/schedule", requestData, {
          headers: { "Content-Type": "application/json" },
          Authorization: `Bearer ${accessToken}`,
        });

        if (response.data.success) {
          setFlightData(response.data.data);
          const airlines = [
            ...new Set(
              response.data.data.map((flight) =>
                Array.isArray(flight.airline)
                  ? flight.airline.join(", ")
                  : flight.airline
              )
            ),
          ];
          setAvailableAirlines(airlines);
          setIsScraping(false);
          localStorage.setItem("data", JSON.stringify(response.data.data));
        }
      } catch (error) {
        console.error("Error submitting request:", error);
        setIsScraping(false);
      }
    } else {
      Swal.fire({
        title: "Required",
        text: "All Fields Are Required!!",
        icon: "warning",
      });
    }
  };

  const getSuggestions = async (value, setter) => {
    const inputValue = value.trim().toLowerCase();

    try {
      const data = airportData
        .filter((airport) => {
          const inputLowerCase = inputValue.toLowerCase();
          return (
            airport.city_name.toLowerCase().includes(inputLowerCase) ||
            airport.iata_code.toLowerCase().includes(inputLowerCase) ||
            airport.name.toLowerCase().includes(inputLowerCase)
          );
        })
        .sort((a, b) => {
          const inputLowerCase = inputValue.toLowerCase();
          const aScore =
            (a.city_name.toLowerCase() === inputLowerCase ? 3 : 0) +
            (a.iata_code.toLowerCase() === inputLowerCase ? 2 : 0) +
            (a.name.toLowerCase() === inputLowerCase ? 1 : 0);
          const bScore =
            (b.city_name.toLowerCase() === inputLowerCase ? 3 : 0) +
            (b.iata_code.toLowerCase() === inputLowerCase ? 2 : 0) +
            (b.name.toLowerCase() === inputLowerCase ? 1 : 0);

          return bScore - aScore;
        });

      setter(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const getSuggestionValue = (suggestion) => suggestion.city_name;

  const renderSuggestion = (suggestion) => (
    <div className="autosuggest-suggestion">
      <div className="suggestion-iata">{suggestion.iata_code}</div>
      <div className="suggestion-details">
        <div className="suggestion-city">{suggestion.city_name}</div>
        <div className="suggestion-airport">{suggestion.name}</div>
      </div>
    </div>
  );

  const handleExchange = () => {
    setFromValue(toValue);
    setToValue(fromValue);
  };

  return (
    <>
    {console.log('ttt',accessToken)}
      <div className="form-container">
        <div className="autosuggest-container">
          <div className="inputFields">
            <div className="from-data">
              <Autosuggest
                suggestions={fromSuggestions}
                onSuggestionsFetchRequested={({ value }) =>
                  getSuggestions(value, setFromSuggestions)
                }
                onSuggestionsClearRequested={() => setFromSuggestions([])}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                inputProps={{
                  placeholder: "From",
                  value: fromValue,
                  onChange: onFromChange,
                  className: "autosuggest-input",
                  required: true,
                }}
                theme={{
                  container: "autosuggest-container",
                  suggestionsList: "autosuggest-suggestions",
                  suggestion: "autosuggest-suggestion",
                  suggestionHighlighted: "autosuggest-suggestion-active",
                }}
              />
            </div>
            <FaExchangeAlt
              className={flightData?.length > 0 ? "default_exchange" : "exchange"}
              onClick={handleExchange}
            />
            <div className="to-data">
              <Autosuggest
                suggestions={toSuggestions}
                onSuggestionsFetchRequested={({ value }) =>
                  getSuggestions(value, setToSuggestions)
                }
                onSuggestionsClearRequested={() => setToSuggestions([])}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                inputProps={{
                  placeholder: "To",
                  value: toValue,
                  onChange: onToChange,
                  className: "autosuggest-input",
                  required: true,
                }}
                theme={{
                  container: "autosuggest-container",
                  suggestionsList: "autosuggest-suggestions",
                  suggestion: "autosuggest-suggestion",
                  suggestionHighlighted: "autosuggest-suggestion-active",
                }}
              />
            </div>
            <div>
              <input
                className="date-picker"
                type="date"
                name="dateValue"
                value={dateValue}
                onChange={handleDateChange}
                min={new Date().toISOString().split("T")[0]}
                max={
                  new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                    .toISOString()
                    .split("T")[0]
                }
              />
            </div>
            <div className="days-select">
              <div className="day-option">
                <input type="checkbox" id="3day" name="3day" value="3day" />
                <label htmlFor="3day">+3 days</label>
              </div>
              <div className="day-option">
                <input type="checkbox" id="day5" name="day5" value="5day" />
                <label htmlFor="day5">+5 days</label>
              </div>
              <div className="day-option">
                <input type="checkbox" id="day7" name="day7" value="7day" />
                <label htmlFor="day7">+7 days</label>
              </div>
              <div className="day-option">
                <input
                  type="checkbox"
                  id="day10"
                  name="day10"
                  value="10day"
                />
                <label htmlFor="day10">+10 days</label>
              </div>
            </div>
            <div>
              <button
                className="btn"
                onClick={handleSubmit}
                disabled={isScraping}
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
      <CollapsibleTable />
    </>
  );
}

export default Ac;