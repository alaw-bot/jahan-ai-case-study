function sum(a, b) {
  return a + b;
}

describe("sum()", () => {
  test("adds two numbers", () => {
    expect(sum(2, 3)).toBe(5);
  });
});


