const db = require('./connection');

class ActiveRecord {
    static table_name = "";
    static fields = [];

    static INVALID_FIELD_ERROR(field) {
        throw new Error(`${this.table_name} does not contain the '${field}' field.`);
    }

    static all() {
        return db.any(`SELECT * FROM "${this.table_name}"`);
    }

    // Similar to findBy(field, value), but this method returns all rows
    static findAll(field, value) {
        if(!this.fields.includes(field)) return this.INVALID_FIELD_ERROR(field);
        return db.any(`SELECT * FROM "${this.table_name}" WHERE "${field}"=$1`, value);
    }

    static findOne(conditions, comparator, ascending, orderByField) {
        var whereClause = '';
        Object.entries(conditions).forEach(([key, value], index) => {
            if(!this.fields.includes(key)) return this.INVALID_FIELD_ERROR(key);

            // Append condition with comparator
            whereClause += `"${key}" ${comparator[index]} '${value}'`;

            if(index < Object.keys(conditions).length-1) {
                whereClause += ' AND ';
            }
        })

        return db.oneOrNone(`SELECT * FROM "${this.table_name}" WHERE ${whereClause} ORDER BY "${orderByField}" ${ascending ? "ASC" : "DESC"} LIMIT 1`);
    }

    static findMany(conditions, comparator, ascending, orderByField, limit) {
        var whereClause = '';
        Object.entries(conditions).forEach(([key, value], index) => {
            if(!this.fields.includes(key)) return this.INVALID_FIELD_ERROR(key);

            // Append condition with comparator
            whereClause += `"${key}" ${comparator[index]} '${value}'`;

            if(index < Object.keys(conditions).length-1) {
                whereClause += ' AND ';
            }
        })
        return db.any(`SELECT * FROM "${this.table_name}" WHERE ${whereClause} ORDER BY "${orderByField}" ${ascending ? "ASC" : "DESC"} ${limit > 0 ? `LIMIT ${limit}` : ""}`);
    }

    static findBy(field, value) {
        if(!this.fields.includes(field)) return this.INVALID_FIELD_ERROR(field);
        return db.oneOrNone(`SELECT * FROM "${this.table_name}" WHERE ${field}=$1`, value);
    }

    // Updates a record in the database that match a set of conditions.
    // 
    // Parameters:
    //  - conditions: Object where the key is a column name and the value is 
    //                the value of said column.
    //                  ex: { user: 'user_uuid', game: 'game_uuid'}
    //  - data:       Same as conditions, but these represent updates to be made
    //                to all rows which match the conditions.
    static update(conditions, data) {
        // Validate conditions and prepare them for query.
        var whereClause = '';
        Object.entries(conditions).forEach(([key, value], index) => {
            if (!this.fields.includes(key)) return this.INVALID_FIELD_ERROR(key);
            // Append condition.
            whereClause += `"${key}" = '${value}'`;

            // Append AND if not last condition.
            if(index < Object.keys(conditions).length-1) {
                whereClause += ' AND ';
            }
        });

        // Validate data and prepare it for query.
        const fieldsAndCols = [[], []];
        Object.entries(data).forEach(([key, value]) => {
            if (!this.fields.includes(key)) return this.INVALID_FIELD_ERROR(key);
            fieldsAndCols[0].push(`"${key}"`);
            
            if (value != null) {
                fieldsAndCols[1].push(`'${value}'`);
            } else {
                fieldsAndCols[1].push(`${value}`);
            }
        });

        // Build SET values section
        const numValuesUpdating = fieldsAndCols[0].length;
        var setSQLSection = '';
        for(let i = 0; i < numValuesUpdating; i++) {
            setSQLSection += `${fieldsAndCols[0][i]} = ${fieldsAndCols[1][i]}`;

            if(i + 1 < numValuesUpdating) {
                setSQLSection += ', ';
            }
        }

        return db.any(`
            UPDATE "${this.table_name}"
            SET ${setSQLSection}
            WHERE ${whereClause}
            RETURNING *
        `);
    }

    static create(data) {
        const fieldsAndCols = [[], []];
        
        Object.entries(data).forEach(([key, value]) => {
            if (!this.fields.includes(key)) return INVALID_FIELD_ERROR(key);
            fieldsAndCols[0].push(key);

            if (value != null) {
                fieldsAndCols[1].push(`'${value}'`);
            } else {
                fieldsAndCols[1].push(`${value}`);
            }
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
}

module.exports = ActiveRecord;