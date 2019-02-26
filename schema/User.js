module.exports = `
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!

  }


  extend type Query {
    me: User
  }


  extend type Mutation {
    signup(firstname:String!, lastname:String, email: String!, password:!String): String;
    login(email: String!, password: String!): String
  }
`;
