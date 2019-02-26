const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {
  AuthenticationError,
  ApolloError,
} = require('apollo-server');

module.exports = {
  Query: {
    me: (_, args, { user, models }) => {
      if (!user) throw new AuthenticationError('User not authenticated');
      return models.User.findOne({ where: { id: user.id } });
    },
  },
  Mutation: {
    signup: async (_, {
      firstname, lastname, email, password,
    }, { models }) => {
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await models.User.create({
        firstname, lastname, email, password: hashedPassword,
      });

      const data = await jwt.sign({
        id: user.id,
        email: user.email,
      }, process.env.SECRET);

      return data;
    },

    login: async (_, { email, password }, { models }) => {
      const user = await models.User.find({
        where: {
          email,
        },
      });

      if (!user) {
        throw new AuthenticationError(`User with email address ${email} does not exists.`);
      }
      let isMatch = false;
      try {
        isMatch = await bcrypt.compare(password, user.password);
      } catch (err) {
        throw new ApolloError(err);
      }

      console.log(isMatch);
      if (isMatch) {
        const data = await jwt.sign({ id: user.id, email: user.email }, process.env.SECRET);
        return data;
      }

      throw new AuthenticationError('Incorrect user credentials');
    },

  },
  User: {
    tasks: async (parent, args, { models }) => models.Task.findAll({ where: { userId: parent.id } }),
  },
};
