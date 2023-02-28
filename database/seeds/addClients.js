/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
 const { faker } = require('@faker-js/faker');


const createFakeClients = () => ({
  name : faker.company.bs(),
  address : faker.address.city(),
  email : faker.internet.email(),
  vat : faker.helpers.arrayElement([0,1]),
  telephone : faker.datatype.number({ min : 10000000, max: 99999999 }),
  timbre : faker.helpers.arrayElement([0,1]),
  company_id : 206
})

exports.seed = async function(knex) {
  const fakeClients = [];
  const deriredFakeClients = 500;
  for (let i = 0; i < deriredFakeClients; i++) {
    fakeClients.push(createFakeClients())
  }
  await knex("clients").insert(fakeClients)
};
