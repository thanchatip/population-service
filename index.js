// api/server.js
const express = require("express");
const cors = require("cors");
const xlsx = require("xlsx");
const serverless = require("serverless-http");
const path = require("path");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://your-production-domain.com",
];

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173", // Update to the port your frontend is running on
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.get("/api/population", (req, res) => {
  try {
    const year = req.query.year;
    const workbook = xlsx.readFile(
      path.resolve(__dirname, "../data/population-and-demography.csv")
    );

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: false });
    const dataWithoutHeader = jsonData.slice(1);
    const formattedData = dataWithoutHeader.map((row) => ({
      country: row[0],
      year: row[1],
      population: row[2],
    }));
    const filteredData = formattedData.filter((entry) => entry.year == year);
    let uniqueCountries = {};
    filteredData.forEach((entry) => {
      let country = entry["country"];
      if (!uniqueCountries[country]) {
        uniqueCountries[country] = entry;
      }
    });
    let groupedCountries = {};
    Object.values(uniqueCountries).forEach((countryObj) => {
      let firstLetter = countryObj["country"][0].toUpperCase();
      if (!groupedCountries[firstLetter]) {
        groupedCountries[firstLetter] = [];
      }
      groupedCountries[firstLetter].push(countryObj);
    });
    let selectedCountriesArray = [];
    for (let letter in groupedCountries) {
      selectedCountriesArray.push(groupedCountries[letter][0]);
    }
    res.json(selectedCountriesArray);
  } catch (error) {
    console.error("Error processing /api/population request:", error);
    res.status(500).send("Error processing request");
  }
});

app.get("/api/year-filters", (req, res) => {
  try {
    const workbook = xlsx.readFile(
      path.resolve(__dirname, "../data/population-and-demography.csv")
    );

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: false });
    const dataWithoutHeader = jsonData.slice(1);
    const formattedData = dataWithoutHeader.map((row) => ({
      country: row[0],
      year: row[1],
      population: row[2],
    }));
    let uniqueYears = [];
    formattedData.forEach((entry) => {
      let year = entry["year"];
      if (!uniqueYears.includes(year)) {
        uniqueYears.push(year);
      }
    });
    const uniqueYearOptions = [...new Set(uniqueYears.map(Number))];
    res.json(uniqueYearOptions);
  } catch (error) {
    console.error("Error processing /api/year-filters request:", error);
    res.status(500).send("Error processing request");
  }
});

module.exports = app;
module.exports.handler = serverless(app);
