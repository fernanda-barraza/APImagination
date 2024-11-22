const mongoose = require('mongoose');

const clickedArticleSchema = new mongoose.Schema({
  articleTitle: String,
  articleUrl: String,
  searchTerm: String,
  dateClicked: { type: Date, default: Date.now }
});

const ClickedArticle = mongoose.model('ClickedArticle', clickedArticleSchema);

module.exports = ClickedArticle;


