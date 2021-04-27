const db = require("./connection");

class ActiveRecord {
  static table_name = "";
  static fields = [];

  // Returns all rows.
  static all() {
    return db.any(`SELECT * FROM "${this.table_name}"`);
  }

  // Returns the first row where the given field matches the given value.
  static findBy(field, value) {
    if (!this.fields.includes(field)) return INVALID_FIELD_ERROR(field);
    return db.oneOrNone(
      `SELECT * FROM "${this.table_name}" WHERE ${field}=$1`,
      value
    );
  }

  // Returns ALL rows where the given field matches the given value.
  static findAllBy(field, value) {
    if (!this.fields.includes(field)) return INVALID_FIELD_ERROR(field);
    return db.manyOrNone(
      `SELECT * FROM "${this.table_name}" WHERE ${field}=$1`,
      value
    );
  }

  // // Returns ALL rows where the given field(s) match the given value(s).
  // static findAllByMany(fields, values) {
  //   fields.forEach(field => {
  //     if (!this.fields.includes(field)) return INVALID_FIELD_ERROR(field);
  //   })

  // }

  // Inserts a row into the table with the given data.
  static create(data) {
    const fieldsAndCols = [[], []];

    Object.entries(data).forEach(([key, value]) => {
      if (!this.fields.includes(key)) return INVALID_FIELD_ERROR(key);
      fieldsAndCols[0].push(key);
      fieldsAndCols[1].push(`'${value}'`);
    });

    return db.oneOrNone(`
            INSERT INTO "${this.table_name}"(${fieldsAndCols[0].join(", ")}) 
            VALUES (${fieldsAndCols[1].join(", ")})
            RETURNING *
        `);
  }

  // Deletes a row from the table by id.
  static delete(id) {
    return db.none(`DELETE FROM "${this.table_name}" WHERE id=$1`, id);
  }

  static INVALID_FIELD_ERROR(field) {
    throw new Error(
      `${this.table_name} does not contain the '${field}' field.`
    );
  }
}

module.exports = ActiveRecord;