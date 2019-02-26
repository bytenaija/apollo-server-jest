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
   }

  extend type Query {
    tasks: [Task]
    task(id: ID!): Task
  }

  extend type Mutation {
    addTask(name: String!, due: String!, completed: Boolean): Task
  }
`;
