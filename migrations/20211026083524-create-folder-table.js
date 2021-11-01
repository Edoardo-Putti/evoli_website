'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('Folder', {
            fid: {
                type: Sequelize.STRING(32),
                allowNull: false,
                defaultValue: Sequelize.Sequelize.literal('replace(uuid(),"-","")'),
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            uid: {
                type: Sequelize.STRING(32),
                allowNull: true,
                references: {
                    model: 'teacher',
                    key: 'uid'
                }
            }
        }, {
            Sequelize,
            tableName: 'Folder',
            timestamps: false,
            indexes: [{
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "fid" },
                    ]
                },
                {
                    name: "uid",
                    using: "BTREE",
                    fields: [
                        { name: "uid" },
                    ]
                },
            ]
        });
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.dropTable('folder');
    }
};