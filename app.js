/* eslint-disable prefer-destructuring */
const {
  ApolloServer,

} = require('apollo-server');

const jwt = require('jsonwebtoken');
require('dotenv').config();

const models = require('./models');
// const typeDefs = require('./schema');
const typeDefs = require('./schema/type');
const resolvers = require('./resolvers')


const getUserwithScopes = async (authorization) => {
  let token = null;
  const bearerHeaderLength = 'Bearer '.length;
  if (authorization && authorization.length > bearerHeaderLength) {
    token = authorization.substr(bearerHeaderLength);
    console.log(token)
    try {
      const user   = await jwt.verify(token, process.env.SECRET);
      return user;
    } catch (err) {
      console.log(err);
    }

    // eslint-disable-next-line no-else-return
  }
  return null;
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const { authorization } = req.headers;
    const user = await getUserwithScopes(authorization);

    return { user, models };
  },
});


server.listen().then(({
  url,
}) => {
  console.log(`server ready at ${url}`);

});

models.sequelize.sync().then(() =>{
  console.log('models synced')
});