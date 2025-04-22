const mongoose = require("mongoose");
const User = require("../../models/users");
const express = require("express");
const { fyersQuotesService, fyersService } = require("../../controlers/broker/fyersControler");
const fs = require('fs');
const path = require('path');
const app = express();

mongoose.connect(
  "mongodb+srv://admin:admin@cluster0.wdfuc.mongodb.net/interns?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function updateUsers() {
  try {
    const userEmails = [
      "samruddhiKamble6604@gmail.com",
      "ambargupta281121@gmail.com",
      "khanagwal.varnika@gmail.com",
      "venkatds234@gmail.com",
      "sandeep_ec109@yahoo.co.in",
      "jeeteshchawda@gmail.com",
    ]

    // Update documents where email is in userEmails array
    // const result = await User.updateMany(
    //     { email: { $in: userEmails } },
    //     { $set: { professional: true } }
    // );

    // const result = await User.updateMany(
    //     { email: { $in: userEmails } },
    //     { $set: { role: "USER" } }
    // );

    // const result = await User.updateMany(
    //     { email: { $in: userEmails } },
    //     { $set: { payments: { premiumUser: false, triedFreePremium: false, expiry: (new Date("2024-08-01T04:24:23.777+00:00")) } } }
    // );

    const result = await User.updateMany(
      { email: { $in: userEmails } },
      {
        $set: {
          role: "USER",
          professional: true,
          payments: {
            premiumUser: true,
            triedFreePremium: true,
            expiry: new Date("2025-05-17T18:29:59.777+00:00")
          }
        }
      }
    );

    console.log(`${result.modifiedCount} documents updated`);

  } catch (error) {
    console.error('Error:', error);
  }
}

const fetchCurrentPrices = async () => {
  const symbols = portfolio.map((stock) => stock.symbol);
  try {
    const prices = await getFyersData(symbols.join(","));
    let overall = 0;
    const updatedPortfolioData = portfolio.map((item) => {
      const cp = prices.filter((price) =>
        price.n.includes(item.symbol)
      )[0].v.lp;
      const currentInvested = cp * item.totalquantity;
      overall += currentInvested;
      return {
        ...item,
        totalinvested: item.totalinvested.toFixed(2),
        currentPrice: cp,
        currentInvested: currentInvested.toFixed(2),
        returnPercent: returnPercent.toFixed(2),
      };
    });
  } catch (error) {
    console.error("Error fetching current prices:", error);
  }
};

function getFyersData(...symbols) {
  return symbols.map(symbol => Math.random() * 1000);
}

// async function updatePortfoliosWithCurrentPrices(portfolios) {
//   try {
//     await Promise.all(portfolios.map(async (portfolio) => {
//       try {
//         const symbols = portfolio.topgainers.map(gainer => gainer.symbol);
//         const modifiedSymbols = symbols.map(stock => `NSE:${stock}-EQ`);

//         let totalInvested = 0;
//         portfolio.topgainers.forEach(item => {
//           totalInvested += item.value;
//         });

//         const currentPrices = await fyersQuotesService(modifiedSymbols.join(","));

//         let total = 0;
//         currentPrices.d.forEach(item => {
//           total += item.v.lp;
//         });

//         portfolio.totalInvested = totalInvested;
//         portfolio.currentPortfolio = total;
//       } catch (err) {
//         console.error(`Error processing portfolio ${portfolio.name}:`, err);
//       }
//     }));

//     const csvData = convertToCSV(portfolios);
//     saveToCSVFile(csvData, 'portfolios.csv');
//     console.log('CSV file has been saved.');
//   } catch (err) {
//     console.error('Error updating portfolios:', err);
//   }
// }

async function updatePortfoliosWithCurrentPrices(portfolios) {
  try {
    // Step 1: Gather all unique symbols from all portfolios
    const allSymbols = new Set();
    portfolios.forEach(portfolio => {
      portfolio.topgainers.forEach(gainer => {
        allSymbols.add(gainer.symbol);
      });
    });

    // Convert Set to Array and prepare symbols for API request
    const uniqueSymbols = Array.from(allSymbols);
    const modifiedSymbols = uniqueSymbols.map(stock => `NSE:${stock}-EQ`);

    // Step 2: Fetch current prices for all unique symbols in one request
    const currentPrices = await fyersQuotesService(modifiedSymbols.join(","));

    // Create a map for quick lookup of prices
    const priceMap = {};
    currentPrices.d.forEach(item => {
      const symbol = item.n.split(":")[1].split("-")[0]; // Extract original symbol from API response
      priceMap[symbol] = item.v.lp;
    });

    // Step 3: Update each portfolio with the fetched prices
    portfolios.forEach(portfolio => {
      let total = 0;
      let totalInvested = 0;

      portfolio.topgainers.forEach(gainer => {
        totalInvested += gainer.value;
        const currentPrice = priceMap[gainer.symbol] || 0;
        total += currentPrice;
      });

      portfolio.totalInvested = totalInvested;
      portfolio.currentPortfolio = total;
    });

    console.log(portfolios[2].topgainers);

    // Step 4: Convert to CSV and save
    const csvData = convertToCSV(portfolios);
    saveToCSVFile(csvData, 'portfolios.csv');
    console.log('CSV file has been saved.');
  } catch (err) {
    console.error('Error updating portfolios:', err);
  }
}

function convertToCSV(objArray) {
  const array = Array.isArray(objArray) ? objArray : JSON.parse(objArray);
  if (array.length === 0) return '';

  // Extract headers dynamically, including headers for topgainers
  let headers = [
    'name', 'totalgainer', 'totallosers', 'forecast',
    'portfolio', 'createdAt', 'totalInvested', 'currentPortfolio'
  ];

  // Determine the maximum number of topgainers to set headers
  const maxTopGainers = Math.max(...array.map(item => item.topgainers.length));

  // Add headers for topgainers symbols and values
  for (let i = 1; i <= maxTopGainers; i++) {
    headers.push(`topgainer_symbol_${i}`);
    headers.push(`topgainer_value_${i}`);
  }

  let csvContent = `${headers.join(",")}\r\n`;

  array.forEach(item => {
    let row = [];

    // Add the standard fields
    row.push(item.name || '');
    row.push(item.totalgainer || '');
    row.push(item.totallosers || '');
    row.push(item.forecast || '');
    row.push(item.portfolio || '');
    row.push(item.createdAt ? new Date(item.createdAt['$date']).toISOString() : '');
    row.push(item.totalInvested || '');
    row.push(item.currentPortfolio || '');

    // Add the topgainers symbols and values
    item.topgainers.forEach((gainer, index) => {
      row.push(gainer.symbol || '');
      row.push(gainer.value || '');
    });

    // Fill empty cells for any portfolios with fewer than the max number of topgainers
    for (let i = item.topgainers.length; i < maxTopGainers; i++) {
      row.push('');
      row.push('');
    }

    csvContent += `${row.join(",")}\r\n`;
  });

  return csvContent;
}

function saveToCSVFile(data, filename) {
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, data);
}

app.listen(8081, async () => {
  // await fyersService.fyersAuthUsingRefreshToken();
  try {
  } catch (error) {
    console.error("Error in async process:", error);
  }
  console.log("Server started on port 8080.");
  updateUsers();
  // updatePortfoliosWithCurrentPrices(portfolios);
  // fetchCurrentPrices();
});
