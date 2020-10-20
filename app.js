/* eslint-disable no-console */
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const data = require('./movies-data-small.json');

require('dotenv').config();

const app = express();
app.use(morgan('dev'));
app.use(cors());

const API_KEY = process.env.API_KEY;
const FILTER_KEYS = ['genre', 'country', 'avg_vote'];

const requireToken = (req, res, next) => {
  const token = req.get('Authorization') || '';
  if (!token)
    return res
      .status(401)
      .json({ message: 'Authorization token missing' });
  if (!token.startsWith('Bearer '))
    return res
      .status(401)
      .json({ message: 'Bearer authorization required' });
  if (token.split(' ')[1] !== API_KEY)
    return res
      .status(401)
      .json({ message: 'Invalid credentials' });
  next();
};

app.use(requireToken);

function validateQuery(req, res, next) {
  next();
}
function handleMovie(req, res, next) {
  return res
    .json(data);
}

app.get('/movie', handleMovie);

app.listen(8080, console.log('Server on 8080'));