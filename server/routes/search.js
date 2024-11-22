const express = require('express');
const axios = require('axios');
const SearchHistory = require('../models/SearchHistory');
const router = express.Router();

/**
 * Route to search news based on a location (or term).
 * Fetches data from NewsAPI, saves the search term and articles to the database, and returns the articles to the frontend.
 */
router.get('/search', (req, res) => {
  const { location } = req.query;
  console.log('New search term:', location); // Log search term

  axios.get(`https://newsapi.org/v2/everything?q=${location}&apiKey=a9f7e8b4010745bda7478b2516b4b0ae`)
    .then(async (response) => {
      const articles = response.data.articles;

      // Check if the search term already exists
      let searchHistory = await SearchHistory.findOne({ term: location });

      if (!searchHistory) {
        searchHistory = new SearchHistory({
          term: location,
          articles: articles.map(article => ({
            title: article.title,
            url: article.url
          }))
        });

        await searchHistory.save(); // Save new search term to database
        console.log('Search saved:', searchHistory); // Log saved search
      }

      res.json(articles); // Return articles to frontend
    })
    .catch(error => {
      console.error('Error fetching news:', error);
      res.status(500).json({ error: 'Failed to fetch news' });
    });
});



/**
 * Route to save clicked articles (tracks user interactions with articles).
 */
const ClickedArticle = require('./models/ClickedArticle'); // Assuming you've created the ClickedArticle model

router.post('/click-article', async (req, res) => {
  const { articleTitle, articleUrl, searchTerm } = req.body;
  console.log('Received article click data:', req.body); // Log incoming data
  
  if (!articleTitle || !articleUrl || !searchTerm) {
    return res.status(400).json({ error: 'Missing required fields: articleTitle, articleUrl, or searchTerm' });
  }

  try {
    // Find the SearchHistory by search term (but not storing clicks directly here anymore)
    const searchHistory = await SearchHistory.findOne({ term: searchTerm });

    console.log('Found search history:', searchHistory); // Log search history found

    if (searchHistory) {
      // If the search history exists, you can log the clicked article separately in ClickedArticle collection
      const newClick = new ClickedArticle({
        articleTitle,
        articleUrl,
        searchTerm
      });

      await newClick.save(); // Save the clicked article
      res.status(200).json({ message: 'Article click saved successfully.' });
    } else {
      res.status(404).json({ error: 'Search term not found in history.' });
    }
  } catch (error) {
    console.error('Error saving clicked article:', error.message);
    res.status(500).json({ error: 'Failed to save clicked article. Please try again later.' });
  }
});





/**
 * Route to fetch the search history (limited to the latest 5 searches).
 */
router.get('/search-history', async (req, res) => {
  try {
    const history = await SearchHistory.find()
      .sort({ date: -1 }) // Sort by most recent
      .limit(5); // Limit to 5 latest searches

    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching search history:', error.message);
    res.status(500).json({ error: 'Failed to fetch search history. Please try again later.' });
  }
});



module.exports = router;
