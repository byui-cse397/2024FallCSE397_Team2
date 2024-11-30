require('dotenv').config();

const express = require('express');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for temporary file storage
const upload = multer({ dest: './temp/' });

// GitHub API Configuration
const GITHUB_TOKEN = 'your_github_personal_access_token';
const GITHUB_REPO = 'your_repo_name';
const GITHUB_OWNER = 'your_github_username';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/projects`;

// Helper function to create a GitHub file
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
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading to GitHub:', error.response.data);
    throw error;
  }
};

// POST endpoint to handle project submissions
app.post('/upload-project', upload.single('file'), async (req, res) => {
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

// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
