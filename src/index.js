const { response } = require('express');
const express = require('express')
const { v4 } = require('uuid')

const app = express();

app.use(express.json())

const customers = [];

// Middlewares
function verifyExistsCustomerCPF(req, res, next) {
  const { cpf } = req.headers;

  const customer = customers.find(customer => customer.cpf === cpf)

  if(!customer) {
    return res.status(400).json({
      error: 'Not found customer with this CPF'
    })
  }

  req.customer = customer;

  next();
}

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

app.get("/statement", verifyExistsCustomerCPF, (req, res) => {
  const { customer } = req;

  return res.json(customer.statement)
})

app.post('/deposit', verifyExistsCustomerCPF, (req, res) => {
  const { description, amount } = req.body;
  const { customer } = req;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit'
  }

  customer.statement.push(statementOperation);

  return res.status(201).send();
})

app.listen(3333)