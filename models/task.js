'use strict';
module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    name: DataTypes.STRING,
    due: DataTypes.DATE,
    userId: DataTypes.INTEGER,
    completed: DataTypes.BOOLEAN
  }, {});
  Task.associate = function(models) {
    Task.belongsTo(models.User, {
      foreignKey: 'userId',
    });
  };
  return Task;
};