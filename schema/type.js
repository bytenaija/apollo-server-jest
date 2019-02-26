const {

  gql,
} = require('apollo-server');


module.exports = gql`
  type Task {
    id: ID!
    name: String!
    due: String
    user: User!
    completed: Boolean!
    createdAt: String
    updatedAt: String
  }



  type User {
    id: ID!
      firstname: String!
      lastname: String!
      email: String!
      createdAt: String
      updatedAt: String
      tasks: [Task!]!

  }
  type Query {
    me: User
    tasks(limit: Int, offset: Int): [Task]
    task(id: ID!): Task
  }

    type Mutation {
      signup(firstname: String!, lastname: String!, email: String!, password: String!): String
      login(email: String!, password: String!): String
      addTask(name: String!, due: String!, completed: Boolean): Task
    }
`;