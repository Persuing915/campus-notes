const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  semester: { type: String, required: true, enum: ['SEM3', 'SEM4', 'PYQ'] },
  type: { type: String, required: true, enum: ['Notes', 'Previous Year Paper', 'Assignment', 'Other'] },
  year: { type: String }, // for PYQ e.g. "2023-24"
  description: { type: String },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploaderName: { type: String },
  downloads: { type: Number, default: 0 },
  downloadedBy: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String },
      rollNo: { type: String },
      downloadedAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);
