import sql from 'better-sqlite3';

//database name
const db = sql('meals.db');

export async function getMeals() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  //forces an error to be handled by /meals/error.js
  //throw new Error('Loading meals failed');
  // all means fetch all data. For single row use get
  return db.prepare('SELECT * FROM meals').all();
}