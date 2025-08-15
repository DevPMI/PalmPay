/** @format */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const router = require('./routes');
const handleError = require('./middleware/handleError');

const app = express();

const port = process.env.PORT;

app.use(cors());
app.use(express.urlencoded({ extended: true, limit: '3mb' }));
app.use(express.json({ limit: '3mb' }));
app.use(express.static('public'));

app.use('/', router);
app.use(handleError);

app.listen(port, () => console.log(`CONNECT ${port}`));
