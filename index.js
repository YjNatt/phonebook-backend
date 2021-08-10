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

app.get('/info', (req, res, next) => {
  Person.find({})
        .then(persons => {
          const date = new Date();
          const message = `<p>Phonebook has info for ${persons.length} people<p><p>${date}<p>`;
          res.send(message)
        })
        .catch(error => next(error));
})

app.get('/api/persons', (req, res, next) => {
  console.log(Person);
  Person.find({})
        .then(notes => {
          res.json(notes);
        })
        .catch(error => next(error));
});

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'empty fields' });
  }

  const person = new Person({
    name: body.name.trim(),
    number: body.number.trim(),
  });

  person.save()
        .then(newPerson => {
          res.json(newPerson)
        })
        .catch(error => next(error));
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
        .then(person => {
          res.json(person);
        })
        .catch(error => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
  const person = {
    name: req.body.name,
    number: req.body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
        .then(updatedPerson => {
          res.json(updatedPerson);
        })
        .catch(error => next(error));
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
        .then(() => {
          res.status(204).end();
        })
        .catch(error => next(error));
});

const errorHandler = (error, req, res, next) =>{
  console.log(error);

  if (error.name === "CastError") {
    return res.status(400).send({ error: 'malformatted id' });
  } else if (error.name === "ValidationError") {
    return res.status(400).send({ error: 'name must be unique' });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`App listening to port: ${PORT}`);
});