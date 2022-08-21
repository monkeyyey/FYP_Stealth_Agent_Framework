// hi boi how are ohou
// freefuieiuefeer
const express = require("express");
const app = express();

// Importing cors for cross origin resource sharing
const cors = require("cors");
app.use(cors());

// Content parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static content
app.use('/css', express.static('public/css'));
app.use('/js', express.static('public/js'));
app.use('/img', express.static('public/images'));
app.use('/downloads', express.static('downloads'))

// Controller for serving web pages
app.use(require('./controllers/view'));

// Map api
app.use('/api/agents', require('./controllers/agents'))
app.use('/api/auth', require('./controllers/auth'))
app.use('/api/analytics', require('./controllers/analytics'))
app.use('/api/users', require('./controllers/users'))
app.use('/api/intrusion', require('./controllers/intrusion'))
app.use('/api/perm', require('./controllers/filepermission'))
app.use('/api/extractfile', require('./controllers/extractfile'))
app.use('/api/VT', require('./controllers/VirusTotal'))
app.use('/api/RA', require('./controllers/custom'))

module.exports = app;