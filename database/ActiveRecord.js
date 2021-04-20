const db = require('./connection');

class ActiveRecord {
    static table_name = "";
    static fields = [];

    static all() {
        return db.any(`SELECT * FROM ${table_name}`);
    }

    static findBy(field, value) {
        if(!fields.includes(field)) return INVALID_FIELD_ERROR(field);
        return db.oneOrNone(`SELECT * FROM ${table_name} WHERE ${field}=$value`, { value });
    }

    static create(data) {
        const fieldsAndCols = [[], []]
        
        Object.entries(data).forEach(([key, value]) => {
            if (!fields.includes(key)) return INVALID_FIELD_ERROR(key);
            db_data[0].push(key);
            db_data[1].push(value);
        });

        return db.none(`INSERT INTO ${table_name}(${fieldsAndCols[0].join(", ")}) VALUES (${fieldsAndCols[1].join(", ")})`)
    }

    static delete(id) {
        return db.none(`DELETE FROM ${table_name} WHERE id=$id`, { id });
    }

    static INVALID_FIELD_ERROR(field) {
        throw new Error(`${table_name} does not contain the '${field}' field.`);
    }
}

module.exports = ActiveRecord;