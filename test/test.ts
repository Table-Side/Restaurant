import supertest from "supertest";

const server = "../src/server.ts";
const requestWithSupertest = supertest(server);

