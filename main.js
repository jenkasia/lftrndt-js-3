const BASE_URL = "https://api.open-meteo.com/v1/forecast";
const LATITUDE = 40.71;
const LONGITUDE = -74.01;
const TIMEZONE = "America/New_York";
const DAILY = "temperature_2m_max,temperature_2m_min";

let chart;
let boundedHmlHandler;
let boundedChartHandler;

async function getWeatherData(startDate, endDate) {
  const params = new URLSearchParams({
    latitude: LATITUDE,
    longitude: LONGITUDE,
    timezone: TIMEZONE,
    daily: DAILY,
    start_date: startDate,
    end_date: endDate,
  });

  try {
    const response = await fetch(`${BASE_URL}?${params.toString()}`);

    const data = await response.json();

    if (data.daily.time.length > 0) {
      createXMLButton(data);
      createChartButton(data);
      const table = generateTable(data.daily);
      document.getElementById("table-container").innerHTML = table;
    } else {
      document.getElementById("table-container").innerHTML =
        "No data available for the selected week.";
    }
  } catch (error) {
    document.getElementById(
      "table-container"
    ).innerHTML = `<div class='error'><p>An error occurred.</p></div>`;

    console.error(error);
  }
}

function generateTable(data) {
  let table =
    "<table>\n<thead>\n<tr>\n<th>Day</th>\n<th>Date</th>\n<th>Min Temperature</th>\n<th>Max Temperature</th>\n</tr>\n</thead>\n<tbody>\n";
  const { time, temperature_2m_min, temperature_2m_max } = data;

  time.forEach((date, index) => {
    const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });
    const formattedDate = new Date(date).toLocaleDateString("en-US");
    const minTemp = temperature_2m_min[index];
    const maxTemp = temperature_2m_max[index];
    table += `<tr>\n<td>${dayOfWeek}</td>\n<td>${formattedDate}</td>\n<td>${minTemp} &deg;C</td>\n<td>${maxTemp} &deg;C</td>\n</tr>\n`;
  });

  table += "</tbody>\n</table>";
  return table;
}

function getStartDateOfWeek(week) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysSinceMonday = (7 + firstDayOfMonth.getDay() - 1) % 7;

  const startDate = new Date(
    currentYear,
    currentMonth,
    1 + (week - 1) * 7 - daysSinceMonday
  );
  return formatDate(startDate);
}

function getEndDateOfWeek(week) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysOffset =
    firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;
  const endDate = new Date(currentYear, currentMonth, week * 7 - daysOffset);
  return endDate.toISOString().slice(0, 10);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateXML(data) {
  const { time, temperature_2m_min, temperature_2m_max } = data;
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<temperatures>\n';
  time.forEach((date, index) => {
    const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });
    const formattedDate = new Date(date).toLocaleDateString("en-US");
    const minTemp = temperature_2m_min[index];
    const maxTemp = temperature_2m_max[index];
    xml += `\t<temperature>\n\t\t<day>${dayOfWeek}</day>\n\t\t<date>\n\t\t\t<dateValue>${formattedDate}</dateValue>\n\t\t\t<dateFormat>YYYY-MM-DD</dateFormat>\n\t\t</date>\n\t\t<min>${minTemp}</min>\n\t\t<max>${maxTemp}</max>\n\t</temperature>\n`;
  });
  xml += "</temperatures>";
  return xml;
}

function downloadXML(xml) {
  const filename = "temperature_data.xml";
  const blob = new Blob([xml], { type: "text/xml;charset=utf-8" });
  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

function createXMLButton(data) {
  let xmlButton = document.getElementById("generate-xml");
  if (!xmlButton) {
    xmlButton =
      document.getElementById("generate-xml") ||
      document.createElement("button");
    xmlButton.id = "generate-xml";
    xmlButton.textContent = "Generate XML";
    document.getElementById("button-container").appendChild(xmlButton);
  } else {
    xmlButton.removeEventListener("click", boundedHmlHandler);
  }

  boundedHmlHandler = handleXMLButtonClick.bind(null, data);
  xmlButton.addEventListener("click", boundedHmlHandler);
}

function createChartButton(data) {
  let chartButton = document.getElementById("display-chart");
  if (!chartButton) {
    chartButton =
      document.getElementById("display-chart") ||
      document.createElement("button");
    chartButton.id = "display-chart";
    chartButton.textContent = "Display Chart";
    document.getElementById("button-container").appendChild(chartButton);
  } else {
    chartButton.removeEventListener("click", boundedChartHandler);
  }

  boundedChartHandler = generateChart.bind(null, data);
  chartButton.addEventListener("click", boundedChartHandler);
}

function generateChart(data) {
  const categories = [];
  const maxTempData = [];
  const minTempData = [];
  const parser = new DOMParser();
  const xmlString = generateXML(data.daily);

  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  const temperatureNodes = xmlDoc.getElementsByTagName("temperature");
  for (let i = 0; i < temperatureNodes.length; i++) {
    const day = temperatureNodes[i].getElementsByTagName("day")[0].textContent;
    const maxTemp = parseFloat(
      temperatureNodes[i].getElementsByTagName("max")[0].textContent
    );
    const minTemp = parseFloat(
      temperatureNodes[i].getElementsByTagName("min")[0].textContent
    );

    categories.push(day);
    maxTempData.push(maxTemp);
    minTempData.push(minTemp);
  }

  const options = {
    series: [
      {
        name: "Max Temperature",
        data: maxTempData,
      },
      {
        name: "Min Temperature",
        data: minTempData,
      },
    ],
    chart: {
      height: 350,
      type: "bar",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: categories,
      title: {
        text: "Day",
      },
    },
    yaxis: {
      title: {
        text: "Temperature C",
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + "&deg;C";
        },
      },
    },
  };

  destroyChart();
  chart = new ApexCharts(document.querySelector("#chart-container"), options);

  chart.render();
}

function destroyChart() {
  if (chart) {
    chart.destroy();
  }
}

function removeChartButton() {
  const chartButton = document.getElementById("display-chart");
  if (chartButton) {
    chartButton.remove();
  }
}

function removeChartButtonListener() {
  const chartButton = document.getElementById("display-chart");
  if (chartButton) {
    chartButton.removeEventListener("click", boundedHmlHandler);
  }
}

function removeXmlButton() {
  const xmlButton = document.getElementById("generate-xml");
  if (xmlButton) {
    xmlButton.remove();
  }
}

function removeXmlButtonListener() {
  const xmlButton = document.getElementById("generate-xml");
  if (xmlButton) {
    xmlButton.removeEventListener("click", boundedHmlHandler);
  }
}

function clearTable() {
  document.getElementById("table-container").innerHTML = "";
}

function handleXMLButtonClick(data) {
  const xml = generateXML(data.daily);
  downloadXML(xml);
}

function main() {
  document.getElementById("start-tracking").addEventListener("click", () => {
    const week = document.getElementById("week-select").value;
    const startDate = getStartDateOfWeek(week);
    const endDate = getEndDateOfWeek(week);
    removeXmlButtonListener();
    getWeatherData(startDate, endDate);
  });

  document.getElementById("week-select").addEventListener("change", (event) => {
    removeXmlButton();
    removeChartButton();
    destroyChart();
    clearTable();
  });
}

main();
