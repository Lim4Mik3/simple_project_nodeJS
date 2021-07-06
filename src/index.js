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

  const alreadyExistsCPFInUse = customers.some(customer => customer.cpf === cpf)

  if (alreadyExistsCPFInUse) {
    return res.status(400).json({
     error: 'Already exists a user with this CPF' 
    })
  }

  customers.push({
    name,
    cpf,
    id: v4(),
    statement: []
  })


  return res.status(201).send();
});

app.get("/statement/:cpf", (req, res) => {
  const { cpf } = req.params;

  const customer = customers.find(customer => customer.cpf === cpf)

  if(!customer) {
    return res.json({
      error: 'Not found a user with this CPF'
    })
  }

  return res.json(customer.statement)

})

app.listen(3333)