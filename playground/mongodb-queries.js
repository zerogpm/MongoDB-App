const {ObjectID} = require('mongodb');
let {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

let id = '5b73afb5d8e111c425555971';

if (!ObjectID.isValid(id)) {
  return console.log('ID not valid');
}

Todo.find({
  _id: id
}).then((todos) => {
  console.log('Todos', todos);
});

Todo.findOne({
  _id: id
}).then((todo) => {
  console.log('Todo', todo)
});

Todo.findById({
  _id: id
}).then((todo) => {
  console.log('Todo', todo)
}).catch((err) => console.log(err));

User.findById({
  _id: id
}).then((user) => console.log('User', user)).catch((err) => console.log(err));

Todo.findOneAndRemove(id).then((todo) => console.log(todo)).catch((err) => console.log(err));

Todo.findOneAndRemove({_id : id}).then((todo) => console.log(todo)).catch((err) => console.log(err));