"use client";
import { FaExchangeAlt } from "react-icons/fa";
import "./form.css";
import React, { useState, useEffect } from "react";
import Autosuggest from "react-autosuggest";
import axios from "axios";
import Table from "../Table/table";
import Swal from "sweetalert2";
import airportDumpData from './airport-dump-json';


function Ac({ selectedFilters, setAvailableAirlines }) {
  const [fromValue, setFromValue] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toValue, setToValue] = useState("");
  const [toSuggestions, setToSuggestions] = useState([]);

  const [dateValue, setDateValue] = useState("");
  const [flightData, setFlightData] = useState([]);
  //const [scrapInProgress, setScrapInProgress] = useState(false);
  const [iatacode, setiatacode] = useState([]);
  const [isScrapping, setIsScrapping] = useState(false);

  // useEffect(()=>{
  //   }
  // },[fromValue,toValue])
  // console.log("iatacdode",iatacode);
  const [airportData, setAirportData] = useState();

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
    setToValue(() => newValue);
  };

  const handledatechange = (e) => {
    setDateValue(e.target.value);
  };

  const handleSubmit = async () => {
    // Check if all required fields are filled
    if (
      fromValue !== "" &&
      toValue !== "" &&
      dateValue !== ""
    ) {
      const matchingObjects = airportData.filter(
        (obj) => obj.city_name === fromValue || obj.city_name === toValue
      );
      const matchingIataCode = matchingObjects.map((obj) => obj.iata_code);
      setiatacode(matchingIataCode);

      const fromMatchingCityObj = airportData.filter((obj) => {
        return obj.city_name == fromValue;
      });
      const toMatchingCityObj = airportData.filter((obj) => {
        return obj.city_name == toValue;
      });

      const requestData = {
        source: fromMatchingCityObj[0].iata_code,
        dest: toMatchingCityObj[0].iata_code,
        date: dateValue,

      };

      try {
        const config = {
          headers: {
            "Content-Type": "application/json"
            
          },
        };
        if (requestData.source == requestData.dest) {
          Swal.fire({
            icon: "warning",
            title: "Location Could not be same !",
            showConfirmButton: false,
            timer: 2000,
          });
        } else {
          setIsScrapping(true);

          const response = await axios.post(
            "http://10.0.2.43:5000/scrap/start",
            requestData,
            config
          );
          console.log("Request submitted:", response.data);
          if (response.data.success) {
            setFlightData(response.data.data);

            // Extract unique airlines from the data, converting arrays to strings
            const airlines = [
              ...new Set(
                response?.data?.data?.map((flight) =>
                  Array.isArray(flight.airline) ? flight.airline.join(", ") : flight.airline
                )
              )
            ];
            setAvailableAirlines(airlines);


            setIsScrapping(false);
            const parsedData = JSON.stringify(response.data.data);
            localStorage.setItem("data", parsedData);
            // window.location.reload()
          }
        }
      } catch (error) {
        console.error("Error submitting request:", error);
      }
    } else {
      // If any required field is empty, show an alert or handle it appropriately
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
          const match =
            airport.city_name.toLowerCase().includes(inputLowerCase) ||
            airport.iata_code.toLowerCase().includes(inputLowerCase) ||
            airport.name.toLowerCase().includes(inputLowerCase);
          return match;
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

      console.log("Filtered Data:", data);

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
    // Swap the values
    const temp = fromValue;
    setFromValue(toValue);
    setToValue(temp);
  };

  return (
    <>
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
                  required: true, // Class name for the input
                }}
                theme={{
                  container: "autosuggest-container",
                  suggestionsList: "autosuggest-suggestions", // Add class name for suggestions list
                  suggestion: "autosuggest-suggestion",
                  suggestionHighlighted: "autosuggest-suggestion-active", // Active suggestion styling
                }}
              />

              {fromSuggestions.length > 0 && (
                <div className="autosuggest-dropdown"></div>
              )}
            </div>
            <FaExchangeAlt className={flightData?.length > 0  ? "default_exchange":"exchange"} onClick={handleExchange} />
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
                  className: "autosuggest-input", // Class name for the input
                  required: true,
                }}
                theme={{
                  container: "autosuggest-container",
                  suggestionsList: "autosuggest-suggestions", // Add class name for suggestions list
                  suggestion: "autosuggest-suggestion",
                  suggestionHighlighted: "autosuggest-suggestion-active", // Active suggestion styling
                }}
              />
              {toSuggestions.length > 0 && (
                <div className="autosuggest-dropdown"></div>
              )}
            </div>
            <div>
              <input
                className="date-picker"
                type="date"
                name="dateValue"
                value={dateValue}
                onChange={handledatechange}
                min={new Date().toISOString().split("T")[0]}
                max={
                  new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                    .toISOString()
                    .split("T")[0]
                }
              />
            </div>


            <div>
              <button
                className="btn"
                onClick={handleSubmit}
                disabled={isScrapping ? true : false}
              >
                Scrap
              </button>
            </div>
          </div>
        </div>
      </div>
      <Table
        isScrapping={isScrapping}
        selectedFilters={selectedFilters}
        airportData={airportData}
        flightData={flightData}
      />
    </>
  );
}

export default Ac;
