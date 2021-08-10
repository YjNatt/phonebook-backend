require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const Person = require('./models/person');

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
  console.log(Person);
  Person.find({}).then(notes => {
    res.json(notes);
  });
});

app.post('/api/persons', (req, res) => {
  const body = req.body
  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'empty fields' });
  }

  const person = new Person({
    name: body.name.trim(),
    number: body.number.trim(),
  });

  person.save().then(newPerson => {
    res.json(newPerson)
  });
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
  Person.findByIdAndDelete(req.params.id)
        .then(() => {
          res.status(204).end();
        })
        .catch(error => {
          console.log(error);
          res.status(400).end();
        });
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`App listening to port: ${PORT}`);
});