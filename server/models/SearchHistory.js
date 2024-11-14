const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  term: { type: String, required: true },
  date: { type: Date, default: Date.now },
  articles: [
    {
      title: String,
      url: String
    }
  ]
});

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

module.exports = SearchHistory;

