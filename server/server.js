let express = require('express');
let bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

let {mongoose} = require('./db/mongoose');
let {Todo} = require('./models/todo');
let {User} = require('./models/user');

var app = express();
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  let todo = new Todo({
    text: req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (err) => {
    res.status(400).send(err);
  });
});

app.get('/todos', (req, res) => {

  Todo.find().then((todos) => {
    res.send({todos});
  }, (err) => {
    res.status(400).send(err);
  });
});

//GET /todos/id
app.get('/todos/:id', (req, res) => {
  let id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({status:'not valid ID'});
  }
  Todo.findById(id).then((todo) => {
    if (!todo) {
      return res.status(404).send({status:'Could not find this ID'});
    }
    res.send({todo});
  }).catch((err) => res.status(400).send({status: 'fail'}));
});


if(!module.parent){
  app.listen(3000, () => {
    console.log('Started on port 3000');
  });
}

module.exports = {app};