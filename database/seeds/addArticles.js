/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
 const { faker } = require('@faker-js/faker');


const createFakeArticles = () => ({
  code : faker.datatype.uuid(),
  article : faker.commerce.product(),
  price : faker.finance.amount(),
  status : faker.helpers.arrayElement([0, 1, 2]),
  company_id : 206
})

exports.seed = async function(knex) {
  const fakeArticles = [];
  const deriredFakeArticles = 500;
  for (let i = 0; i < deriredFakeArticles; i++) {
    fakeArticles.push(createFakeArticles())
  }
  await knex("articles").insert(fakeArticles)
};
