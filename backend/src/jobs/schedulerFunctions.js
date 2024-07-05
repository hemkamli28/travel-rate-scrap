import { getAllScheduledRoute } from "../shared/utilities/dbFunctions.js";
import { dateLogic } from "../shared/utilities/handlerFunctions.js";
import { scrappingFunction } from "./scrappingFunction.js";

export const schedulerFunctions = async () => {
    try {
      const scheduledRoutes = await getAllScheduledRoute();
      console.log("routes",scheduledRoutes)
      if (scheduledRoutes.length > 0) {
        for (const route of scheduledRoutes) {
          const {
            departure_location,
            arrival_location,
            departure_date,
            departure_days,
          } = route;
  
          let obj = {
            departureLocation: departure_location,
            arrivalLocation: arrival_location,
            departureDate: departure_date,
          };
  
          let response = await scrappingFunction(obj);
          console.log("Initial Response:", response);
  
          for (const day of departure_days) {
            let newDepartureDate = await dateLogic(true, departure_date, day);
            console.log("New Departure Date:", newDepartureDate);
            obj = {
              departureLocation: departure_location,
              arrivalLocation: arrival_location,
              departureDate: newDepartureDate
            };
            response = await scrappingFunction(obj);
            console.log("Adjusted Response:", response);
          }
        }
      }
    } catch (error) {
      console.error('Error in scrapping:', error);
      throw error;
    }
  };
