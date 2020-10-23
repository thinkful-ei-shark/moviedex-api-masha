/* eslint-disable no-console */
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const { NODE_ENV, API_KEY, PORT } = process.env;

const data = require('./movies-data.json');

require('dotenv').config();

const app = express();
const morganOptions = NODE_ENV === 'production' ? 'tiny' : 'dev';

app.use(morgan(morganOptions));
app.use(helmet());
app.use(cors());

const FILTERS = {
  genre: (list, string) =>
    list.filter(item =>
      item.genre.toLowerCase().includes(string.toLowerCase())),
  country: (list, string) =>
    list.filter(item =>
      item.country.toLowerCase().includes(string.toLowerCase())),
  avg_vote: (list, num) =>
    list.filter(item =>
      item.avg_vote >= num)
};

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
  const queryKeys = Object.keys(req.query);
  // check that query has at least one key
  if (queryKeys.length < 1)
    return res
      .status(400)
      .json({ message: 'At least one query key required' });
  // check that query keys are valid
  queryKeys.forEach(key => {
    if (!Object.keys(FILTERS).includes(key))
      return res
        .status(400)
        .json(
          {
            message:
              'Filter keys must be at least one of "genre", "country", "avg_vote"'
          }
        );
  });
  next();
}
// eslint-disable-next-line no-unused-vars
function handleMovie(req, res, next) {
  const query = req.query;

  const results = Object.keys(query)
    .reduce((list, key) =>
      FILTERS[key](list, query[key]), data);

  return res
    .json(results);
}

app.get('/movie', validateQuery, handleMovie);

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: 'server error' };
  } else {
    console.error(error);
    response = { message: error.message };
  }
  res.status(500).json(response);
});

app.listen(PORT, () => console.log('Server on 8080'));