import axios from "axios";

const http = axios.create({
  baseURL: "https://open.er-api.com/v6/latest",
});

export const getInrFromUsd = async () => {
  try {
    const response = await http.get("/USD");
    const usdPrice = response.data.rates.INR;
    return usdPrice;
  } catch (error) {
    throw error;
  }
};

