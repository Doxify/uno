const db = require('./connection');

class ActiveRecord {
    static table_name = "";
    static fields = [];

    static all() {
        return db.any(`SELECT * FROM "${this.table_name}"`);
    }

    static findBy(field, value) {
        if(!this.fields.includes(field)) return INVALID_FIELD_ERROR(field);
        return db.oneOrNone(`SELECT * FROM "${this.table_name}" WHERE ${field}=$1`, value);
    }

    static create(data) {
        const fieldsAndCols = [[], []]
        
        Object.entries(data).forEach(([key, value]) => {
            if (!this.fields.includes(key)) return INVALID_FIELD_ERROR(key);
            db_data[0].push(key);
            db_data[1].push(value);
        });

        return db.none(`INSERT INTO "${this.table_name}"(${fieldsAndCols[0].join(", ")}) VALUES (${fieldsAndCols[1].join(", ")})`)
    }

    static delete(id) {
        return db.none(`DELETE FROM ${this.table_name} WHERE id=$1`, id);
    }

    static INVALID_FIELD_ERROR(field) {
        throw new Error(`${this.table_name} does not contain the '${field}' field.`);
    }
}

module.exports = ActiveRecord;