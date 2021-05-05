const db = require('./connection');

class ActiveRecord {
    static table_name = "";
    static fields = [];

    static all() {
        return db.any(`SELECT * FROM "${this.table_name}"`);
    }

    // Similar to findBy(field, value), but this method returns all rows
    static findAll(field, value) {
        if(!this.fields.includes(field)) return this.INVALID_FIELD_ERROR(field);
        return db.any(`SELECT * FROM "${this.table_name}" WHERE ${field}=$1`, value);
    }

    static findOne(field, value, asscending) {
        // TODO:
    }

    static findBy(field, value) {
        if(!this.fields.includes(field)) return INVALID_FIELD_ERROR(field);
        return db.oneOrNone(`SELECT * FROM "${this.table_name}" WHERE ${field}=$1`, value);
    }

    static update(data) {
        // TODO:
    }

    static create(data) {
        const fieldsAndCols = [[], []]
        
        Object.entries(data).forEach(([key, value]) => {
            if (!this.fields.includes(key)) return INVALID_FIELD_ERROR(key);
            fieldsAndCols[0].push(key);
            fieldsAndCols[1].push(`'${value}'`);
        });

        return db.oneOrNone(`
            INSERT INTO "${this.table_name}"(${fieldsAndCols[0].map(col => `"${col}"`).join(", ")}) 
            VALUES (${fieldsAndCols[1].join(", ")})
            RETURNING *
    `);
    }

    // Used for database tables where all columns have default values, returns the inserted row
    static createDefault() {
        return db.oneOrNone(`
            INSERT INTO "${this.table_name}" DEFAULT VALUES RETURNING *
        `);
    }

    static delete(id) {
        return db.none(`DELETE FROM "${this.table_name}" WHERE id=$1`, id);
    }

    static INVALID_FIELD_ERROR(field) {
        throw new Error(`${this.table_name} does not contain the '${field}' field.`);
    }
}

module.exports = ActiveRecord;