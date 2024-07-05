"use client";
import { useEffect, useState ,useContext} from "react";
import Form from "../../components/Form/form";
// import PrivateRoute from "../../components/PrivateRoute/PrivateRoute";
import Sidebar from "@/components/Sidebar/sidebar";
import "./dashboard.module.css";


export default function Dashboard() {
  const [airportData, setAirportData] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [availableAirlines, setAvailableAirlines] = useState([]);
  

  return (
    <>
        <div className="main">
          <div
            className={availableAirlines?.length > 0 ? "side-bar" : "sideBar"}
          >
            {availableAirlines?.length > 0 && (
              <Sidebar
                setSelectedFilters={setSelectedFilters}
                availableAirlines={availableAirlines}
              />
            )}
          </div>
          <div
            className={
              availableAirlines?.length > 0 ? "form-table" : "other-table"
            }
          >
            {/* // "form-table table-fo"  */}
            <Form
              airportData={airportData}
              selectedFilters={selectedFilters}
              setAvailableAirlines={setAvailableAirlines}
            />
          </div>
        </div>
    </>
  );
}
