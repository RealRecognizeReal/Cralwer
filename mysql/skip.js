let instanceId = '';

for(let i = 0 ; i < 10 ; i++) {
    let rand = Math.floor(Math.random()*36);


}

module.exports = function (sequelize, DataTypes) {

    var Skip = sequelize.define('skip', {
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

    return Skip;
};
