const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const {User} = require('./../models/user');
const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {todos,  populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    let text = 'First test todo';
    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      }).end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(2);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((err) => done(err));
    });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((err) => done(err));

      });
  });

  describe('Get /todos', () => {
    it('should get a list of todo items', (done) => {
      request(app)
        .get('/todos')
        .expect(200)
        .expect((res) => {
          expect(res.body.todos.length).toBe(2);
        })
        .end(done);
    });
  });

  describe('GET /todos/:id', () =>{
    it('should return todo doc', (done) => {
      request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
    });

    it('should return 404 if todo not found', (done) => {
      let id = new ObjectID();
      request(app)
        .get(`/todos/${id}`)
        .expect(404).end(done);
    });

    it('should return 404 for non-object ids', (done) => {
      request(app)
        .get('/todos/123')
        .expect(404).end(done);
    });

    describe('Delete /todos/:id', () => {
      it('should remove a todo', (done) => {
        let hexId = todos[1]._id.toHexString();
        request(app)
          .delete(`/todos/${hexId}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.todo._id).toBe(hexId);
          }).end((err, res) => {
            if (err) {
              return done(err);
            }
            Todo.findById(hexId).then((todo) => {
              expect(todo).toBeFalsy();
              done();
            }).catch((e) => done(e));
        });
      });

      it('should return 404 if todo not found', (done) => {
        let hexId = new ObjectID().toHexString();
        request(app)
          .delete(`/todos/${hexId}`)
          .expect(404)
          .end(done);
      });

      it('should return 404 if object id is invalid', (done) => {
        request(app)
          .delete('/todos/12d3')
          .expect(404)
          .end(done);
      });
    })
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    let hexId = todos[0]._id.toHexString();
    let text = 'This should be the new text';
    request(app)
      .patch(`/todos/${hexId}`)
      .send({
        text,
        completed: true,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true)
      })
      .end(done);
  });

  it('should clear completedAt when todo is not completed', (done) => {
    let hexId = todos[1]._id.toHexString();
    let text = 'this is second';
    request(app)
      .patch(`/todos/${hexId}`)
      .send({
        text,
        completed: false
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBeFalsy();
      })
      .end(done);
  });
});

describe('Get /user/me', () => {

  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      }).end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      }).end(done);
  });
});

describe('POST /users', () => {

  it('should create a user', (done) => {
    var email = 'example@gmail.com';
    var password = '123mnb22';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.header['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
    }).end((err) => {
      if (err) {
        return done(err);
      }

      User.findOne({email}).then((user) => {
        expect(user).toBeTruthy();
        expect(user.password).not.toBe(password);
        done();
      }).catch((e) => done(e));
    });
  });

  it('should return validation errors if request invalid', (done) => {
    var invalidEmail = 'example.com';
    var password = '123343dd';
    request(app)
      .post('/users')
      .send({ email: invalidEmail, password})
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', (done) => {
    request(app)
      .post('/users')
      .send({email: users[0].email, password: users[0].password})
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({email: users[1].email, password: users[1].password})
      .expect(200)
      .expect((res) => {
        expect(res.header['x-auth']).toBeTruthy();
      }).end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[0].token).toBe(res.header['x-auth']);
          done();
        }).catch((e) => done(e));
    });
  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({email: users[1].email, password: 'invalid email'})
      .expect(400)
      .expect((res) => {
        expect(res.header['x-auth']).toBeFalsy();
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('Delete /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  })
});