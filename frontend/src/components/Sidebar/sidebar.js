'use client'
import React, { useState, useEffect } from "react";
import "./sidebar.css";

function Sidebar({ availableAirlines, setSelectedFilters }) {
  const [selectedAirlinesLocal, setSelectedAirlinesLocal] = useState([]);

  useEffect(() => {
    setSelectedFilters(selectedAirlinesLocal);
  }, [selectedAirlinesLocal, setSelectedFilters]);

  const handleAirlinesChange = (e) => {
    const airline = e.target.value;
    if (e.target.checked) {
      setSelectedAirlinesLocal([...selectedAirlinesLocal, airline]);
    } else {
      setSelectedAirlinesLocal(selectedAirlinesLocal.filter((a) => a !== airline));
    }
  };

  const resetFilters = () => {
    setSelectedAirlinesLocal([]);
    const checkboxes = document.querySelectorAll('.checkboxes input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
  };

  return (
    <div className="flight-filter">
      <div className="all-data">
        <div className="filter-title">
          <h2 className="name">Flight Filter</h2>
        </div>
        <div>
          <div className="filter-section">
            <h3>Popular Airlines</h3>
            <div className="checkboxes">
              {availableAirlines.map((airline) => (
                <label key={airline}>
                  <input
                    type="checkbox"
                    value={airline}
                    onChange={handleAirlinesChange}
                  />{" "}
                  {airline}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div>
          <button className="reset-btn" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
