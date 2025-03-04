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
    // const userEmails = [
    //     'nimshagupta36@gmail.com',
    //     'kartiksehgalofficial@gmail.com',
    //     'venu.dunde@gmail.com',
    //     'samad.ali6664@gmail.com',
    //     'varshikri17012000@gmail.com',
    //     'japjot.22351@sscbs.du.ac.in',
    //     'chandani.sps@gmail.com',
    //     'dishari.isms@gmail.com',
    //     'hanaanmuhammed2001@gmail.com',
    //     'badal.samal23.isms@gmail.com',
    //     'solankiayushi5578@gmail.com',
    //     'nithinarisetty@gmail.com',
    //     'rohitpurkait001@gmail.com',
    //     'anindon.official@gmail.com',
    //     'shekhar.chaudhary.pgdm25@iilm.edu',
    //     'jainaditijain131@gmail.com',
    //     'sarthakambekar7@gmail.com',
    //     'sriramabhishekmani@gmail.com',
    //     'pragya.soni.3386@gmail.com',
    //     'vedantgosaviriim2325@gmail.com',
    //     'mohankrishnamaddu@gmail.com',
    //     'ishanagrawal836@gmail.com',
    //     'gumbervarshit21@gmail.com',
    //     'gandhamnarendrakumar@gmail.com',
    //     'gagandeepu22@gmail.com',
    //     'reddyssukruth@gmail.com',
    //     'veerabhadrast02@gmail.com',
    //     'p.bhuin2001@gmail.com',
    //     'saiganesh6420@gmail.com',
    //     'ishagupta9027@gmail.com',
    //     'smmegha414@gmail.com',
    //     'ayushipatodi77@gmail.com',
    //     'shrey.th@gmail.com'
    // ];

    const userEmails = [
      // 'rudraneel.debnath@gmail.com',
      // 'ranveerchawla086@gmail.com',
      // 'sagila.kkl@gmail.com',
      // 'KALRACHIRAG0088@GMAIL.COM',
      // 'yamikant54321@gmail.com',
      // 'avinabashishdas@gmail.com',
      // 'baharkaurchhatwal@gmail.com',
      // 'pritichauhan075@gmail.com',
      // 'atifj0809@gmail.com',
      // 'rsjune2002@gmail.com',
      // 'madhurpasrija@gmail.com',
      // 'anupama0104mish@gmail.com',
      // 'shaheensirajudeen@gmail.com',
      // 'chaitanyasabharwal72003@gmail.com',
      // 'devikasatheesh875@gmail.com',
      // 'tusharnimbark7@gmail.com',
      // 'devshekhar08@gmail.com',
      // 'yamikant54321@gmail.com',
      // 'shefaligarg3378@gmail.com',
      // 'aanchalpinky1109@gmail.com',
      // 'shefaligarg3378@gmail.com',
      // 'sagar.arora126@gmail.com',
      // 'goyalaakash2022@gmail.com',
      // 'durgagupta1808@gmail.com',
      // 'komaljaiswal261002@gmail.com',
      // 'vermanamrata13@gmail.com',
      // 'amarpratap2503@gmail.com',
      // 'sakshikanunga111@gmail.com',
      // 'sakshikanunga111@gmail.com',
      // 'agrwalnikhil73@gmail.com',
      // 'bhartimt389@gmail.com',
      // 'nishikasahani30@gmail.com',
      // 'nishikasahani25@gmail.com',
      // 'vanshikajobanputra9@gmail.com',
      // 'hyandavi414@gmail.com',
      // 'bhavya242005jain@gmail.com',
      // 'brajeshbdo@gmail.com',
      // 'dhanrajpatil2426@gmail.com',
      // 'komalkumari.crj0@gmail.com',
      // 'komalkumari.crj0@gmail.com',
      // 'maulekhiharshita066@gmail.com',
      // 'ajiths9390@gmail.com',
      // 'sjha44698@gmail.com',
      // 'vishalshindeu1@gmail.com',
      // 'zeeshanali0248@gmail.com',
      // 'hyandavi414@gmail.com',
      // 'diwansamarth4321@gmail.com',
      // 'shefaligarg3378@gmail.com',
      // 'udaypratap1204@gmail.com',
      // 'bhardwajkartik45@gmail.com',
      // 'rishirajvadher@gmail.com',
      // 'Sanjanakashyap052315@gmail.com',
      // 'dhairyagupta2412@gmail.com',
      // 'farwa3.20bba036@bnbwu.edu.pk',
      // 'aanchalpinky1109@gmail.com',
      // 'shefaligarg3378@gmail.com',
      // 'hyandavi414@gmail.com',
      // 'suhaib.akhtar841@gmail.com',
      // 'mohamedfareeth71@gmail.com',
      // 'jbhavyaoff@gmail.com',
      // 'shefaligarg3378@gmail.com',
      // 'komalkumari.crj0@gmail.com',
      // 'amarpratap2503@gmail.com',
      // 'nachiketthite15@gmail.com',
      // 'anchalbisht9876@gmail.com',
      // 'sakshikanunga111@gmail.com',
      // 'geetanshiverma73@gmail.com',
      // 'janviallawadhi@gmail.com',
      // 'akshatgoel63@gmail.com',
      // 'vanshikajobanputra9@gmail.com',
      // 'vanshikajobanputra9@gmail.com',
      // 'mandalarpita9212@gmail.com',
      // 'manojayattiyavar@gmail.com',
      // 'Kanhaiyakr9923@gmail.com',
      // 'dimpleojha2813@gmail.com',
      // 'maliqueumar123@gmail.com',
      // 'kalrachirag0088@gmail.com',
      // 'sarkarrohonankur@gmail.com',
      // 'gumbervarshit21@gmail.com',
      'riteshk11345@gmail.com'
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
            expiry: new Date("2025-01-12T18:29:59.777+00:00")
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
