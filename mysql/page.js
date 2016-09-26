module.exports = function (sequelize, DataTypes) {

    var Page = sequelize.define('page', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        url: DataTypes.STRING,
        status: DataTypes.ENUM('grey', 'black')
    },{
        indexes: [
            {unique: true, fields: ['url']}
        ]
    });

    return Page;
};
