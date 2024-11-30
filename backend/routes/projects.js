const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Configure multer for temporary file storage
const upload = multer({ dest: path.join(__dirname, '../temp/') });

// GitHub API Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Load from .env file
const GITHUB_REPO = 'your_repo_name';
const GITHUB_OWNER = 'your_github_username';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/projects`;

// Helper function to upload to GitHub
const uploadToGitHub = async (filePath, content, message) => {
  const fileName = path.basename(filePath);
  const base64Content = Buffer.from(content).toString('base64');

  try {
    const response = await axios.put(
      `${GITHUB_API_URL}/${fileName}`,
      {
        message: message,
        content: base64Content,
      },
      {
        headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading to GitHub:', error.response.data);
    throw error;
  }
};

// POST route for project submissions
router.post('/upload', upload.single('file'), async (req, res) => {
  const { title, description, year, type } = req.body;
  const file = req.file;

  try {
    // Prepare metadata JSON
    const metadata = {
      title,
      description,
      year,
      type,
      file: file ? file.originalname : null,
    };

    // Upload metadata to GitHub
    await uploadToGitHub(
      `${title}-metadata.json`,
      JSON.stringify(metadata, null, 2),
      `Add metadata for project: ${title}`
    );

    // Upload file to GitHub (if exists)
    if (file) {
      const fileContent = fs.readFileSync(file.path);
      await uploadToGitHub(
        `${title}-${file.originalname}`,
        fileContent,
        `Add file for project: ${title}`
      );
    }

    // Cleanup temporary files
    if (file) fs.unlinkSync(file.path);

    res.json({ message: 'Project uploaded successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Error uploading project', details: error.message });
  }
});

module.exports = router;
