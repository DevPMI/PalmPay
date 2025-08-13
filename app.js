/** @format */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const router = require('./routes');
const handleError = require('./middleware/handleError');

const app = express();

const port = process.env.PORT;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', router);
app.use(handleError);

app.listen(port, () => console.log(`CONNECT ${port}`));
