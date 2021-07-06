const { response } = require('express');
const express = require('express')
const { v4 } = require('uuid')

const app = express();

app.use(express.json())

const customers = [];

/**
 * cpf - string
 * name - string,
 * id - uuid
 * statment - []
 */

app.post("/account", (req, res) => {
  const { name, cpf  } = req.body;

  customers.push({
    name,
    cpf,
    id: v4(),
    statement: []
  })


  return res.status(201).send();
});

app.listen(3333)