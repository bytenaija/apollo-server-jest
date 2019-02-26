/* eslint-disable comma-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const {
  graphql,
} = require('graphql');
const {
  makeExecutableSchema,
} = require('graphql-tools');
const chai = require('chai');
const jwt = require('jsonwebtoken');
const typeDefs = require('../schema/type');
const resolvers = require('../resolvers');
const models = require('../models');
require('dotenv').config();


// eslint-disable-next-line no-undef
describe('Tesing graphql server', () => {
  global.jestExpect = global.expect;
  global.expect = chai.expect;
  let user;
  const OLD_ENV = process.env;
  beforeAll(async () => {
    await models.Task.destroy({
      where: {},
    });
    await models.User.destroy({
      where: {},
    });
  });
  beforeEach(async () => {
    jest.resetModules(); // this is important
    process.env = {
      ...OLD_ENV,
    };
    delete process.env.NODE_ENV;
    await models.sequelize.sync();
  });

  afterEach(async () => {
    process.env = OLD_ENV;
  });

  afterAll(async () => {
    await models.Task.destroy({
      where: {},
    });
    await models.User.destroy({
      where: {},
    });

    await models.sequelize.close();
  });


  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });
  it('should be null when user is not logged in', async () => {
    process.env.NODE_ENV = 'test';
    const query = `
    query {
        me {
          id
        }

    }
  `;

    const rootValue = {};
    const context = {
      models,
    };

    const result = await graphql(schema, query, rootValue, context);

    const {
      data,
    } = result;

    expect(data.me).to.be.null;
  });

  it('should signup a new user and return a token', async () => {
    process.env.NODE_ENV = 'test';
    const rootValue = {};
    const context = {
      models,
    };
    const query = `
    mutation {
      signup(firstname: "Everistus", lastname: "Olumese", email:"everistusolumese@gmail.com", password: "skywalk")
    }
  `;

    const result = await graphql(schema, query, rootValue, context);


    const {
      data,
    } = result;

    expect(data.signup).to.be.ok;
    const {
      email,
    } = await jwt.verify(data.signup, process.env.SECRET);
    expect(email).to.equal('everistusolumese@gmail.com');
  });

  it('should login a user and return a token', async () => {
    process.env.NODE_ENV = 'test';
    const rootValue = {};
    const context = {
      models,
    };
    const query = `
    mutation {
      login(email:"everistusolumese@gmail.com", password: "skywalk")
    }
  `;

    const result = await graphql(schema, query, rootValue, context);


    const {
      data,
    } = result;


    expect(data.login).to.be.ok;

    user = await jwt.verify(data.login, process.env.SECRET);

    const {
      email,
    } = user;
    expect(email).to.equal('everistusolumese@gmail.com');
  });

  it('should throw an error when wrong credentials are used to attempt login', async () => {
    process.env.NODE_ENV = 'test';
    const rootValue = {};
    const context = {
      models,
    };
    const query = `
    mutation {
      login(email:"johne@gmail.com", password: "skywalk")
    }
  `;

    const result = await graphql(schema, query, rootValue, context);


    const {
      data,
    } = result;


    expect(data.login).to.be.null;

    expect(result.errors).to.be.ok;
  });


  it('should throw an error when user not logged in and attempt to get tasks', async () => {
    process.env.NODE_ENV = 'test';
    const rootValue = {};
    const context = {
      models,
    };
    const query = `
    query {
      tasks{
        id
        name
        due
      }
    }
  `;

    const result = await graphql(schema, query, rootValue, context);


    const {
      data,
    } = result;

    expect(data.tasks).to.be.null;
    expect(result.errors).to.be.ok;
  });

  it('should retrieve an empty array when logged in and no data in the tasks table', async () => {
    process.env.NODE_ENV = 'test';
    const rootValue = {};
    const context = {
      models,
      user,
    };
    const query = `
    query {
      tasks{
        id
        name
        due
      }
    }
  `;

    const result = await graphql(schema, query, rootValue, context);

    console.log(result);

    const {
      data,
    } = result;

    expect(data.tasks).to.be.empty;
    expect(result.errors).to.be.undefined;
  });

  it('should should be able to add task to the database when logged in', async () => {
    process.env.NODE_ENV = 'test';
    const rootValue = {};
    const context = {
      models,
      user,
    };
    const query = `
    mutation {
     addTask(name: "Learn to test GraphQL", due: "2019-02-25", completed: false) {
       name
       completed
       due
     }
    }
  `;

    const result = await graphql(schema, query, rootValue, context);



    const {
      data,
    } = result;

    const expected = {
      name: 'Learn to test GraphQL',
      completed: false,
      due: '1551052800000',
    };

    expect(data.addTask).to.deep.equal(expected);
    expect(result.errors).to.not.be.ok;
  });

  it('should be able to add task to the database when logged in along with the user', async () => {
    process.env.NODE_ENV = 'test';
    const rootValue = {};
    const context = {
      models,
      user,
    };
    const query = `
    mutation {
     addTask(name: "Learn to test GraphQL", due: "2019-02-25", completed: false) {
       name
       completed
       due
       user{
         firstname,
         lastname
       }
     }
    }
  `;

    const result = await graphql(schema, query, rootValue, context);


    const {
      data,
    } = result;

    const expected = {
      name: 'Learn to test GraphQL',
      completed: false,
      due: '1551052800000',
      user: {
        firstname: 'Everistus',
        lastname: 'Olumese'
      }
    };

    expect(data.addTask).to.deep.equal(expected);
    expect(result.errors).to.not.be.ok;
  });

  it('should be able to get all tasks when user logged in', async () => {
    process.env.NODE_ENV = 'test';
    const rootValue = {};
    const context = {
      models,
      user,
    };
    const query = `
    query {
      tasks{
        id
        name
        due
      }
    }
  `;

    const result = await graphql(schema, query, rootValue, context);


    const {
      data,
    } = result;

    expect(data.tasks.length).to.be.equal(2);
    expect(result.errors).to.be.undefined;
  });
});
