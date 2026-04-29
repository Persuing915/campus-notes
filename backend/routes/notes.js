const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Note = require('../models/Note');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only PDF, DOC, PPT, TXT, and image files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });

// Upload note
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    const { title, subject, semester, type, year, description } = req.body;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const note = await Note.create({
      title, subject, semester, type, year, description,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
      uploaderName: req.user.name
    });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all notes with filters
router.get('/', protect, async (req, res) => {
  try {
    const { subject, search, semester, type } = req.query;
    let query = {};
    if (subject) query.subject = subject;
    if (semester) query.semester = semester;
    if (type) query.type = type;
    if (search) query.title = { $regex: search, $options: 'i' };
    const notes = await Note.find(query).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Download note
router.get('/download/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.downloads += 1;
    // Add downloader info (avoid duplicates)
    const alreadyDownloaded = note.downloadedBy.some(
      d => d.userId.toString() === req.user._id.toString()
    );
    if (!alreadyDownloaded) {
      note.downloadedBy.push({
        userId: req.user._id,
        name: req.user.name,
        rollNo: req.user.rollNo,
        downloadedAt: new Date()
      });
    }
    await note.save();

    // Track in user's downloaded list
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { downloadedNotes: note._id }
    });

    res.download(path.resolve(note.filePath), note.fileName);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my downloaded notes
router.get('/my-downloads', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('downloadedNotes');
    res.json(user.downloadedNotes.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get contributors (all uploaders with stats)
router.get('/contributors', protect, async (req, res) => {
  try {
    const notes = await Note.find().populate('uploadedBy', 'name rollNo');
    // Group by uploader
    const map = {};
    notes.forEach(note => {
      const id = note.uploadedBy?._id?.toString();
      if (!id) return;
      if (!map[id]) {
        map[id] = {
          uploaderId: id,
          uploaderName: note.uploadedBy.name,
          rollNo: note.uploadedBy.rollNo,
          totalNotes: 0,
          totalDownloads: 0,
          subjects: []
        };
      }
      map[id].totalNotes += 1;
      map[id].totalDownloads += note.downloads || 0;
      if (!map[id].subjects.includes(note.subject)) {
        map[id].subjects.push(note.subject);
      }
    });
    // Sort by total downloads desc
    const result = Object.values(map).sort((a, b) => b.totalDownloads - a.totalDownloads);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get who downloaded my note (only uploader can see)
router.get('/downloaders/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.uploadedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    res.json(note.downloadedBy);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my uploaded notes with downloader info
router.get('/my-uploads', protect, async (req, res) => {
  try {
    const notes = await Note.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete note (only uploader)
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.uploadedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    if (fs.existsSync(note.filePath)) fs.unlinkSync(note.filePath);
    await note.deleteOne();
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
