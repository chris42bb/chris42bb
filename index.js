"use strict";

document.addEventListener("DOMContentLoaded", function() {
  
  const marketRatesBtc = getMarketRates("https://shakepay.github.io/programming-exercise/web/rates_CAD_BTC.json");
  const marketRatesEth = getMarketRates("https://shakepay.github.io/programming-exercise/web/rates_CAD_ETH.json");
  
  const transactionHistory = (function() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://shakepay.github.io/programming-exercise/web/transaction_history.json", false);
    xhr.send();
    return JSON.parse(xhr.responseText);
  })();
  
  const balances = {"CAD": 0, "BTC": 0, "ETH": 0};
  
  let btcMarketRate = marketRatesBtc["2018-01-01"];
  let ethMarketRate = marketRatesBtc["2018-07-13"];

  const netWorthHistory = transactionHistory.reverse().map(function(item) {    
    const newBtcMarketRate = marketRatesBtc[item["createdAt"].substring(0, item["createdAt"].indexOf("T"))];
    if(newBtcMarketRate !== undefined) {
      btcMarketRate = newBtcMarketRate;
    }
    const newEthMarketRate = marketRatesEth[item["createdAt"].substring(0, item["createdAt"].indexOf("T"))];
    if(newEthMarketRate !== undefined) {
      ethMarketRate = newEthMarketRate;
    }
  
    if(item["type"] === "conversion") {
      balances[item["from"]["currency"]] -= item["from"]["amount"];
      balances[item["to"]["currency"]] += item["to"]["amount"];
    } else {
      if(item["direction"] === "credit") {
        balances[item["currency"]] += item["amount"];
      } else if(item["direction"] === "debit") {
        balances[item["currency"]] += item["amount"];
      }
    }
  
    return {"x":item["createdAt"] , "y": balances["CAD"] + (balances["BTC"] * btcMarketRate) + (balances["ETH"] * ethMarketRate)};
  });

  const chart = new Chart(document.getElementById("canvas").getContext("2d"), {
    "type": "line",
    "data": {
      "datasets": [{
        "label": "Net Worth",
        "data": netWorthHistory
      }]
    },
    "options": {
      "scales": {"xAxes": [{"type": "time"}]},
      "plugins": {"zoom": {"zoom": {"enabled": true,"mode": "y"}, "pan": {"enabled": true, "mode": "xy"}}}
    }
  });
  
  function getMarketRates(url) {
    const result = {};
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send();
    JSON.parse(xhr.responseText).map(function(item) {
      result[item["createdAt"].substring(0, item["createdAt"].indexOf("T"))] = item["midMarketRate"];
    });
    return result;
  } 
});
