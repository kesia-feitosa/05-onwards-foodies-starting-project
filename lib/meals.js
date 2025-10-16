//allow to work with files system
import fs from 'node:fs';

import sql from 'better-sqlite3';
import slugify from 'slugify';
import xss from 'xss';

//database name
const db = sql('meals.db');

export async function getMeals() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  //forces an error to be handled by /meals/error.js
  //throw new Error('Loading meals failed');
  // all means fetch all data. For single row use get
  return db.prepare('SELECT * FROM meals').all();
}

export function getMeal(slug) {
  return db.prepare('SELECT * FROM meals WHERE slug = ?').get(slug);
}

export async function saveMeal(meal) {
  //forces all caracters to be lower case
  meal.slug = slugify (meal.title, { lower: true});
  //clear all caracteres, sanatize instructions
  meal.instructions = xss(meal.instructions);

  //get the extension of image file
  const extension = meal.image.name.split('.').pop();
  //generate a unique name for image
  const fileName = `${meal.slug}.${extension}`;

  const stream = fs.createWriteStream(`public/images/${fileName}`);
  const bufferedImage = await meal.image.arrayBuffer();

  stream.write(Buffer.from(bufferedImage), (error) => {
    if (error) {
      throw new Error('Saving image failed!');
    }
  });

  meal.image = `/images/${fileName}`;

  //save in database
  db.prepare(`
    INSERT INTO meals (
      title, 
      summary,
      instructions,
      creator,
      creator_email,
      image,
      slug)
    VALUES (
      @title,
      @summary,
      @instructions,
      @creator,
      @creator_email,
      @image,
      @slug
    )
    `).run(meal);
}