let express = require('express');
let bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

let {mongoose} = require('./db/mongoose');
let {Todo} = require('./models/todo');
let {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

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

//POST Delete /todos/:id
app.delete('/todos/:id', (req,res) => {
  let id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({status:'not valid ID'});
  }
  Todo.findByIdAndRemove(id).then((todo) => {
    if (!todo) {
      return res.status(404).send({status:'Could not find this ID'});
    }
    res.send({todo});
  }).catch((err) => res.status(400).send({status: 'fail'}));
});

//Post Update /todos/edit/:id
app.patch('/todos/:id', (req, res) => {
  let id = req.params.id;
  let body = _.pick(req.body, ['text', 'completed']);
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({status:'not valid ID'});
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      return res.status(404).send({status:'Could not find this ID'});
    }
    res.send({todo});
  }).catch((e) => res.status(400).send({status:'Failed at the end'}));
});

app.get('/todos', (req, res) => {

  Todo.find().then((todos) => {
    res.send({todos});
  }, (err) => {
    res.status(400).send(err);
  });
});

//GET /todos/:id
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

// POST /users
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

if(!module.parent){
  app.listen(3000, () => {
    console.log('Started on port 3000');
  });
}

module.exports = {app};