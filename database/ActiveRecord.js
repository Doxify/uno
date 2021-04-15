import db from './connection';

class ActiveRecord {
    table_name = "";
    fields = [];

    constructor(table_name, fields) {
        this.table_name = table_name;
        this.fields = fields;
    }

    static all() {
        return db.any(`SELECT * FROM ${table_name}`);
    }

    static find(id) {
        return db.oneOrNone(`SELECT * FROM ${table_name} WHERE id=$id`, { id });
    }

    static create(data) {
        const fieldsAndCols = [[], []]
        
        Object.entries(data).forEach(([key, value]) => {
            if (!fields.includes(key)) {
                throw new Error("Data contains invalid field.");
            }
            db_data[0].push(key);
            db_data[1].push(value);
        });

        return db.none(`INSERT INTO ${table_name}(${fieldsAndCols[0].join(", ")}) VALUES (${fieldsAndCols[1].join(", ")})`)
    }

    static delete(id) {
        return db.none(`DELETE FROM ${table_name} WHERE id=$id`, { id });
    }
}

module.exports = ActiveRecord;