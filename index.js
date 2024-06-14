const express = require("express");
const cors = require("cors");
const xlsx = require("xlsx");
const app = express();
const port = 3001;

app.use(cors());

app.get("/api/population", (req, res) => {
  try {
    console.log("req...", req.query.year);
    const year = req.query.year;
    console.log("Reading Excel file...");
    const workbook = xlsx.readFile("population-and-demography.csv");
    const sheet_name_list = workbook.SheetNames;
    const sheet = workbook.Sheets[sheet_name_list[0]];

    console.log("Converting sheet to JSON...");
    const jsonData = xlsx.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
    });

    console.log("Removing header row...");
    const dataWithoutHeader = jsonData.slice(1);

    const formattedData = dataWithoutHeader.map((row) => ({
      country: row[0],
      year: row[1],
      population: row[2],
    }));

    const filteredData = formattedData.filter((entry) => entry.year == year);

    console.log("filteredData Data...", filteredData);
    let uniqueCountries = {};
    filteredData.forEach((entry) => {
      let country = entry["country"];
      if (!uniqueCountries[country]) {
        uniqueCountries[country] = entry;
      }
    });

    console.log("uniqueCountries", uniqueCountries);
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

    console.log(selectedCountriesArray);
    res.json(selectedCountriesArray);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send("Error processing request");
  }
});

app.get("/api/year-filters", (req, res) => {
  try {
    console.log("Reading Excel file...");
    const workbook = xlsx.readFile("population-and-demography.csv");

    const sheet_name_list = workbook.SheetNames;
    const sheet = workbook.Sheets[sheet_name_list[0]];

    console.log("Converting sheet to JSON...");
    const jsonData = xlsx.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
    });

    console.log("Removing header row...");
    const dataWithoutHeader = jsonData.slice(1);

    const formattedData = dataWithoutHeader.map((row) => ({
      country: row[0],
      year: row[1],
      population: row[2],
    }));

    console.log("filteredData Data...", formattedData);

    let uniqueYears = [];
    formattedData.forEach((entry) => {
      let year = entry["year"];
      if (!uniqueYears[year]) {
        uniqueYears.push(entry.year);
      }
    });

    console.log("uniqueYears", uniqueYears);
    const uniqueYearOptions = [...new Set(uniqueYears.map(Number))];
    res.json(uniqueYearOptions);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send("Error processing request");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
