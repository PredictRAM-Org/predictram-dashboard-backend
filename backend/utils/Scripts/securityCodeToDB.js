const fs = require("fs");
const csvParser = require("csv-parser");
const stockSecurityId = require("../../models/stockSecurityId");

module.exports = securityCodeToDB = () => {
  // Parse CSV and add data to MongoDB
  const csvFilePath = "bse_security_master.csv";

  fs.createReadStream(csvFilePath)
    .pipe(csvParser())
    .on("data", async (row) => {
      let data;
      try {
        const { security_id, symbol, name, instrument_type, exchange } = row;
        if (instrument_type.includes("ES")) {
          data = await stockSecurityId.findOneAndUpdate(
            { symbol },
            {
              $setOnInsert: {
                symbol,
                security_id,
                name,
                exchange,
              },
            },
            { upsert: true, new: true }
          );
          console.log(`Added: ${data?.symbol}:${data?.exchange}`);
        }
      } catch (error) {
        console.error(`Error adding data: ${error.message},${data?.symbol}`);
      }
    })
    .on("end", () => {
      console.log("CSV parsing completed");
    });
};
