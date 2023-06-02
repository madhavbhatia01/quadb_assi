//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const fetch = require("node-fetch");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/newDB", {useNewUrlParser: true, useUnifiedTopology: true});
const dataSchema = {
  name: String,
  last : Number,
  buy : Number,
  sell : Number,
  volume : Number,
  base_unit : String
};

const Data = mongoose.model("Data", dataSchema);

async function func(obj){
  const data = new Data({
    name: obj.name,
    last : obj.last,
    buy : obj.buy,
    sell : obj.sell,
    volume : obj.volume,
    base_unit : obj.base_unit
  });
  try{
    await data.save();
  }catch(error){
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


app.get('/', async (req, res) => {
  try {
    const response = await fetch('https://api.wazirx.com/api/v2/tickers');
    const data = await response.json();

    const results = Object.keys(data).map((symbol) => ({
      name: data[symbol].name,
      last : data[symbol].last,
      buy : data[symbol].buy,
      sell : data[symbol].sell,
      volume : data[symbol].volume,
      base_unit : data[symbol].base_unit
    }));

    for(var i=0 ; i<10 ; i++){
      func(results[i]);
    }
    res.render("home", {top10Result : results.splice(0,10)});

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
