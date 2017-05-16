const combinations = require("../../src/task2/task2.js");
const { expect } = require('chai');

/*console.log (combinations([[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
[9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
[5, 4, 3, 2, 1, 0, 1, 2, 3, 4]]
));*/

describe("Combinations tests", () => {
  
    it("none, check shifts length", () => {
      const input = [[1,2,3],
                     [4,5,6],
                     [7,8,9]];
      const output = combinations(input);
      expect(output[0]).to.have.lengthOf(27);
    });
    
    it("horisontal any shift = 1 point)", () => {
      const input = [[1,1,1],
                     [2,5,6],
                     [3,8,9]];
      expect(combinations(input)[1]).to.have.lengthOf(27);
      
    });
    
    it("whole square (any shift = 16 points)", () => {
      const input = [[2,2,2],
                     [2,2,2],
                     [2,2,2]];
      expect(combinations(input)[16]).to.have.lengthOf(27);
      
    });

    it("vertical && diagonal 1point shifts", () => {
      // 3 vert, 2 diag shifts
      const input = [[1,2,3],
                     [4,5,1],
                     [1,8,9]];
      const onePointShifts = [[0, 2, 0], [0,1,1], [2, 1,2], [1,1,0], [1,0,1]];
      
      const onePointCombinations = combinations(input)[1];
      expect(onePointCombinations).to.have.lengthOf(5);
      expect(onePointCombinations).to.deep.include.members(onePointShifts);
    });
    
    it("1 horisontal +  1 vertical", () => {
      const input = [[1,1,1],
                     [1,5,6],
                     [1,8,9]];
      expect(combinations(input)[2]).to.have.lengthOf(15);
      expect(combinations(input)[1]).to.have.lengthOf(12);
      
    });

});