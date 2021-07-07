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

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if(operation.type === 'credit') {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0)

  return balance;
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

app.post('/withdraw', verifyExistsCustomerCPF, (req, res) => {
  const { amount } = req.body;
  const { customer } = req;
 
  const balance = getBalance(customer.statement)

  if (balance < amount) {
    return res.status(400).json({
      error: 'Insufficient funds!'
    })
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: 'debit'
  }

  customer.statement.push(statementOperation)

  return res.status(201).send();
})

app.get("/statement/date", verifyExistsCustomerCPF, (req, res) => {
  const { customer } = req;
  const { date } = req.query; 

  const dateFormat = new Date(date + " 00:00")

  const statement = customer.statement.filter(operation => operation.created_at.toDateString() === new Date(dateFormat).toDateString())
  
  return res.json(statement)
})

app.put("/account", verifyExistsCustomerCPF, (req, res) => {
  const { name } = req.body;
  const { customer } = req;

  customer.name = name;

  return res.status(201).send();
})

app.get("/account", verifyExistsCustomerCPF, (req, res) => {
  const { customer } = req;

  return res.json(customer)
})

app.delete("/account", verifyExistsCustomerCPF, (req, res) => {
  const { customer } = req;

  customers.splice(customer, 1);

  return res.send();
})

app.get("/balance", verifyExistsCustomerCPF, (req, res) => {
  const { customer } = req;

  const balance = getBalance(customer.statement)

  return res.json({ Balance: balance})
})

app.listen(3333)