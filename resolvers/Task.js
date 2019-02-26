const { AuthenticationError } = require('apollo-server');

module.exports = {
  Query: {
    tasks: (parent, args, { user, models }) => {
      if (!user) throw new AuthenticationError('User not authenticated');
      return models.Task.all();
    },
    task: (parent, { id }, { user, models }) => {
      if (!user) throw new AuthenticationError('User not authenticated');
      return models.Task.findById(id);
    },
  },
  Mutation: {
    addTask: async (parent, { name, due, completed }, { user, models }) => {
      if (!user) throw new AuthenticationError('User not authenticated');
      const task = {
        name,
        due,
        completed,
        userId: user.id,
      };
      const result = await models.Task.create(task);
     
      return result;
    },
  },
  Task: {
    user: async (parent, args, {models}) => models.User.findOne({where: {id: parent.userId}})

    }

};
