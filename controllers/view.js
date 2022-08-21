const express = require('express');
const router = express.Router();
var bodyParser = require('body-parser');
var cors = require('cors');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

router.options('*', cors());
router.use(cors());
router.use(bodyParser.json());
router.use(urlencodedParser);

// Login page
router.get("/", (req, res) => {
    res.sendFile("login.html", {root: `${__dirname}/../public/html`});
});
router.get("/login", (req, res) => {
    res.sendFile("login.html", {root: `${__dirname}/../public/html`});
});

// Register page
router.get("/register", (req, res) => {
    res.sendFile("register.html", {root: `${__dirname}/../public/html`});
});

// Home page
router.get("/home", (req, res) => {
    res.sendFile("home.html", {root: `${__dirname}/../public/html`});
});

// Security Analytics
router.get("/security_analytics", (req, res) => {
    res.sendFile("analytics.html", {root: `${__dirname}/../public/html`});
});

// Intrusion Detection
router.get("/intrusion_detection", (req, res) => {
    res.sendFile("intrusion.html", {root: `${__dirname}/../public/html`});
});

// File permission monitoring
router.get("/file_permission", (req, res) => {
    res.sendFile("permission.html", {root: `${__dirname}/../public/html`});
});

// File Integrity
router.get("/file_integrity", (req, res) => {
    res.sendFile("integrity.html", {root: `${__dirname}/../public/html`});
});

// Profiles page
router.get("/profiles", (req, res) => {
    res.sendFile("profiles.html", {root: `${__dirname}/../public/html`});
});

// Custom features
router.get("/custom", (req, res) => {
    res.sendFile("custom.html", {root: `${__dirname}/../public/html`});
});

// Agent create and delete page
router.get("/agents", (req, res) => {
    res.sendFile("agents.html", {root: `${__dirname}/../public/html`});
});

//Scan a file
router.get("/virustotal", (req, res) => {
    res.sendFile("virustotal.html", {root: `${__dirname}/../public/html`});
});

module.exports = router;