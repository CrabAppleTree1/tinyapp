const { assert } = require('chai');

const {
  findByEmail,
} = require('./helpers');

//users db
const testUsers = {
  "user": {
    id: "001",
    email: "r@e.com",
    password: "purp"
  },
  "user2": {
    id: "002",
    email: "2@ex.com",
    password: "dish"
  }
};


describe('finding user by email', function() {
  it('should return a user with valid email', function() {
    const user = findByEmail("r@e.com", testUsers);
    const expectedOutput = "001";
    assert.strictEqual(user.id, expectedOutput);
  });
  it('should return false on a non-existent email', function() {
    const user = findByEmail("20@ex.com", testUsers);
    const expectedOutput = false;
    assert.strictEqual(user, expectedOutput);
  });
});