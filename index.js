const express = require('express');
const app = express();
const morgan = require('morgan');

app.use(express.static('build'));
app.use(express.json());

morgan.token('persons', (req, res) => {
  const name = req.body.name;
  const number = req.body.number;
  return JSON.stringify({ name, number});
});

app.use(morgan((tokens, req, res) => {
  const format = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'),
    tokens['response-time'](req, res), 'ms'
  ];

  if (req.method === "POST") {
    format.push(tokens.persons(req, res))
  }

  return format.join(' ');
}));

const persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
];

app.get('/info', (req, res) => {
  const date = new Date();
  const message = `<p>Phonebook has info for ${persons.length} people<p><p>${date}<p>`;
  res.send(message)
})

app.get('/api/persons', (req, res) => {
  res.send(persons);
});

const generateId= () => {
  return Math.floor(Math.random() * 100);
}

app.post('/api/persons', (req, res) => {
  const name = req.body.name && req.body.name.trim();
  const number = req.body.number && req.body.number.trim();

  let error;
  if (!name) {
    error = 'name is missing';
  } else if (!number) {
    error = 'number is missing';
  } else if (persons.some(person => person.name === name)) {
    error = 'name must be unique';
  }

  if (!error) {
    const person = {
      id: generateId(),
      name,
      number: req.body.number,
    };

    persons.push(person);
    res.send(person);
  } else {
    res.status(404).json({ error });
  }
});

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(person => person.id === id);

  if (person) {
    res.send(person)
  } else {
    res.status(404).end();
  }
});

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = persons.findIndex((person => person.id === id));
  let status;

  if (index > 0) {
    persons.splice(index, 1);
    status = 204;
  } else {
    status = 404;
  }

  res.status(status).end();
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`App listening to port: ${PORT}`);
});