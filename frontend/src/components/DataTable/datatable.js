import React, { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import axios from "axios";
import $ from "jquery";
import DataTable from "datatables.net";

const CollapsibleTable = () => {
  const [accessToken, setAccessToken] = useState(getCookie("access-token"));
  const [scheduleData, setScheduleData] = useState([]);

  useEffect(() => {
    // Ensure jQuery is available globally
    window.$ = $;
    window.jQuery = $;

    // Initialize DataTable
    const table = $('#myTable').DataTable({
      responsive: true,
    });

    const fetchDataAndDisplay = async () => {
      try {
        const response = await axios.get("http://10.0.2.43:5000/scrap/scheduled", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.data.success) {
          // Update state with the retrieved data
          setScheduleData(response.data.data);

          // Clear existing table data and add new rows
          table.clear();
          table.rows.add(response.data.data).draw();
        } else {
          console.error("Failed to fetch schedule data:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching schedule data:", error);
      }
    };

    fetchDataAndDisplay();

    // Cleanup function to destroy DataTable on component unmount
    return () => {
      table.destroy();
    };
  }, [accessToken]);

  return (
    <table id="myTable" className="display responsive nowrap">
      <thead>
        <tr>
          <th>From</th>
          <th>To</th>
          <th>Departure Date</th>
        </tr>
      </thead>
      <tbody>
        {/* Map through scheduleData to render rows */}
        {scheduleData.map((item, index) => (
          <tr key={index}>
            <td>{item.departure_location}</td>
            <td>{item.arrival_location}</td>
            <td>{item.departure_date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CollapsibleTable;
