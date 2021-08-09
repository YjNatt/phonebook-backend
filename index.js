const express = require('express');
const app = express();

app.use(express.json());

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
  const person = {
    name: req.body.name,
    number: req.body.number,
    id: generateId(),
  };

  persons.push(person);
  res.send(person);
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

const PORT = 3001
app.listen(PORT, () => {
  console.log(`App listening to port: ${PORT}`);
});