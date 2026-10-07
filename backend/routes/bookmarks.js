import express from 'express';
import Bookmark from '../models/Bookmark.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to ALL bookmark endpoints
router.use(authenticateUser);

/**
 * @route   GET /api/bookmarks
 * @desc    Get all bookmarked articles for the logged-in user
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(bookmarks);
  } catch (err) {
    console.error('Error fetching bookmarks:', err);
    res.status(500).json({ error: 'Server error fetching bookmarks.' });
  }
});

/**
 * @route   POST /api/bookmarks
 * @desc    Add an article to bookmarks for the logged-in user
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const { articleId, title, description, url, image, source, category, publishedAt } = req.body;

    if (!articleId || !title || !url) {
      return res.status(400).json({ error: 'articleId, title, and url are required.' });
    }

    // Check if article is already bookmarked by this user
    const existingBookmark = await Bookmark.findOne({
      userId: req.user.id,
      articleId
    });

    if (existingBookmark) {
      return res.status(400).json({ error: 'Article is already bookmarked.' });
    }

    const bookmark = new Bookmark({
      userId: req.user.id,
      articleId,
      title,
      description: description || '',
      url,
      image: image || null,
      source: source || 'Unknown',
      category: category || 'top-stories',
      publishedAt: publishedAt ? new Date(publishedAt) : new Date()
    });

    await bookmark.save();
    res.status(201).json(bookmark);

  } catch (err) {
    // Catch duplicate key error if race condition occurs
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Article is already bookmarked.' });
    }
    console.error('Error saving bookmark:', err);
    res.status(500).json({ error: 'Server error saving bookmark.' });
  }
});

/**
 * @route   GET /api/bookmarks/:articleId
 * @desc    Check if a specific article is bookmarked by the logged-in user
 * @access  Private
 */
router.get('/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    const bookmark = await Bookmark.findOne({
      userId: req.user.id,
      $or: [{ articleId }, { _id: articleId.match(/^[0-9a-fA-F]{24}$/) ? articleId : null }]
    });

    res.json({
      isBookmarked: !!bookmark,
      bookmark: bookmark || null
    });
  } catch (err) {
    console.error('Error checking bookmark status:', err);
    res.status(500).json({ error: 'Server error checking bookmark status.' });
  }
});

/**
 * @route   DELETE /api/bookmarks/:articleId
 * @desc    Remove an article from bookmarks
 * @access  Private
 */
router.delete('/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;

    // Delete matching user's bookmark by articleId or mongo _id
    const deleted = await Bookmark.findOneAndDelete({
      userId: req.user.id,
      $or: [
        { articleId },
        { _id: articleId.match(/^[0-9a-fA-F]{24}$/) ? articleId : null }
      ]
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Bookmark not found or unauthorized.' });
    }

    res.json({ message: 'Bookmark removed successfully', articleId });

  } catch (err) {
    console.error('Error deleting bookmark:', err);
    res.status(500).json({ error: 'Server error removing bookmark.' });
  }
});

export default router;
