const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

require('dotenv').config();

const app = express();
app.use(morgan('dev'));
app.use(cors());

const API_KEY = process.env.API_KEY

console.log(API_KEY);