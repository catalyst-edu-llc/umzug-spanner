"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequelizeStorage = void 0;
class SequelizeStorage {
    /**
    Constructs Sequelize based storage. Migrations will be stored in a SequelizeMeta table using the given instance of Sequelize.

    If a model is given, it will be used directly as the model for the SequelizeMeta table. Otherwise, it will be created automatically according to the given options.

    If the table does not exist it will be created automatically upon the logging of the first migration.
    */
    constructor(options) {
        var _a, _b, _c, _d, _e, _f;
        if (!options || (!options.model && !options.sequelize)) {
            throw new Error('One of "sequelize" or "model" storage option is required');
        }
        this.sequelize = (_a = options.sequelize) !== null && _a !== void 0 ? _a : options.model.sequelize;
        this.columnType = (_b = options.columnType) !== null && _b !== void 0 ? _b : this.sequelize.constructor.STRING;
        this.columnName = (_c = options.columnName) !== null && _c !== void 0 ? _c : 'name';
        this.timestamps = (_d = options.timestamps) !== null && _d !== void 0 ? _d : false;
        this.modelName = (_e = options.modelName) !== null && _e !== void 0 ? _e : 'SequelizeMeta';
        this.tableName = options.tableName;
        this.schema = options.schema;
        this.model = (_f = options.model) !== null && _f !== void 0 ? _f : this.getModel();
        this.ignoreModelSync = options.ignoreModelSync || false;
    }
    getModel() {
        if (this.sequelize.isDefined(this.modelName)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return this.sequelize.model(this.modelName);
        }
        return this.sequelize.define(this.modelName, {
            [this.columnName]: {
                type: this.columnType,
                allowNull: false,
                primaryKey: true,
                autoIncrement: false,
            },
        }, {
            tableName: this.tableName,
            schema: this.schema,
            timestamps: this.timestamps,
            charset: 'utf8',
            collate: 'utf8_unicode_ci',
        });
    }
    async syncModel() {
        if (!this.ignoreModelSync) {
            await this.model.sync();
        }
    }
    async logMigration({ name: migrationName }) {
        await this.syncModel();
        await this.model.create({
            [this.columnName]: migrationName,
        });
    }
    async unlogMigration({ name: migrationName }) {
        await this.syncModel();
        await this.model.destroy({
            where: {
                [this.columnName]: migrationName,
            },
        });
    }
    async executed() {
        await this.syncModel();
        const migrations = await this.model.findAll({ order: [[this.columnName, 'ASC']] });
        return migrations.map(migration => {
            const name = migration[this.columnName];
            if (typeof name !== 'string') {
                throw new TypeError(`Unexpected migration name type: expected string, got ${typeof name}`);
            }
            return name;
        });
    }
    // TODO remove this
    _model() {
        return this.model;
    }
}
exports.SequelizeStorage = SequelizeStorage;
//# sourceMappingURL=sequelize.js.map