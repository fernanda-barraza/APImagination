const express = require('express');
const axios = require('axios');
const SearchHistory = require('../models/SearchHistory');
const router = express.Router();

// Define the route to search news
router.get('/search', (req, res) => {
  const { location } = req.query;  // Get the location (search term) from the query string

  // Fetch data from NewsAPI
  axios.get(`https://newsapi.org/v2/everything?q=${location}&apiKey=a9f7e8b4010745bda7478b2516b4b0ae`)
    .then(async (response) => {
      const articles = response.data.articles;

      // Save the search term and articles to the database
      const newSearch = new SearchHistory({
        term: location,
        articles: articles.map(article => ({
          title: article.title,
          url: article.url
        }))
      });
      await newSearch.save();

      // Return the news articles to the frontend
      res.json(articles);
    })
    .catch(error => {
      console.error('Error fetching news:', error);
      res.status(500).json({ error: 'Failed to fetch news' });
    });
});

// Route to track clicked articles
router.post('/click-article', async (req, res) => {
  const { articleTitle, articleUrl, searchTerm } = req.body;

  try {
    const searchHistory = await SearchHistory.findOne({ term: searchTerm });

    if (searchHistory) {
      searchHistory.clickedArticles.push({
        title: articleTitle,
        url: articleUrl
      });

      await searchHistory.save();
      res.status(200).json({ message: 'Article clicked saved successfully' });
    } else {
      res.status(404).json({ message: 'Search history not found' });
    }
  } catch (error) {
    console.error('Error saving clicked article:', error);
    res.status(500).json({ message: 'Error saving clicked article' });
  }
});

// Route to fetch clicked articles (Search History)
router.get('/search-history', (req, res) => {
  SearchHistory.find().sort({ date: -1 }).limit(5)  // Get the latest 5 searches
    .then(history => {
      res.json(history);
    })
    .catch(error => {
      console.error('Error fetching search history:', error);
      res.status(500).json({ error: 'Failed to fetch search history' });
    });
});

module.exports = router;
