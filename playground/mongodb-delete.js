//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');

  //deleteMany
  db.collection('Users').deleteMany({
    name : 'chris'
  }).then((result) => {
    console.log(JSON.stringify(result, undefined, 2));
  }, (err) => {
    console.log('Unable to fetch todos', err);
  });

  //deleteOne
  db.collection('Todos').deleteOne({
    text : 'walk the dog'
  }).then((result) => {
    console.log(JSON.stringify(result, undefined, 2));
  }, (err) => {
    console.log('Unable to fetch todos', err);
  });

  //findOneAndDelete
  db.collection('Users').findOneAndDelete({
    _id : new ObjectID('5b732c162b7b0e14b24829f2')
  }).then((result) => {
    console.log(JSON.stringify(result, undefined, 2));
  }, (err) => {
    console.log('Unable to fetch todos', err);
  });

  //db.close();
});