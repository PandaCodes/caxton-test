const { expect } = require('chai');
const Distribution = require('../../src/task1/distribution');


describe("Distribution tests", () => {

  describe("Constructor errors", () => {
    
    it("single", () => {
      expect(() => new Distribution()).to.throw(Error);
    });
    
    it("discrete", () => {
      expect(() => new Distribution({ 
        type: "discrete"
      })).to.throw(Error);
      expect(() => new Distribution({ 
        type: "discrete",
        events: [{value: 1, probability: 200}]
      })).to.throw(Error);
      expect(() => new Distribution({ 
        type: "discrete",
        events: [{value: 1, probability: 0.5}, {value: 2, probability: 0.7}]
      })).to.throw(Error);
    });
    
    it("mixed", () => {
      expect(() => new Distribution({ 
        type: "mixed",
        pieces: [
          {
            probability: 0.2,
            value: 20
          },
          {
            probability: 0.5,
            type: "uniform",
          },
          {
            probability: 0.5,
            type: "exponential"
          }
          ]
      })).to.throw(Error);
      
    });
    
    it("uniform", () => {
      expect(() => new Distribution({ 
        type: "uniform",
        a: 2,
        b: 0,
      })).to.throw(Error);
    });
    
    it("exponential", () => {
      expect(() => new Distribution({ 
        type: "exponential",
        max: -10,
      })).to.throw(Error);
      expect(() => new Distribution({ 
        type: "exponential",
        lambda: -10,
      })).to.throw(Error);
    });
    
    it("normal", () => {
      expect(() => new Distribution({ 
        type: "normal",
        max: -10,
        min: 10,
      })).to.throw(Error);
      expect(() => new Distribution({ 
        type: "normal",
        sigma2: -10,
      })).to.throw(Error);
      
    });
    
    it("other", () => {
       expect(() => new Distribution({ 
        type: "blablabla",
      })).to.throw(Error);
    });
  });

  
  describe("Constructor usage", () => {
    it("mixed (and so every others)", () =>{
      new Distribution({
        type: "mixed",
        pieces: [
          // Single event - may be written without type
          {
            value: 1,
            probability: 0.4
          },
          // Discrete distribution
          // For the events with no probability property it set equally normalized probabilities
          {
            probability: 0.1,
            type: "discrete",
            events: [{value: 2}, {value: 3}, {value: 4, probability: 0.5}]
          },
          // Uniform
          // Parameters: interval [a, b] 
          // default: a = 0, b = 1
          {
            probability: 0.1,
            type: "uniform",
            a: 4,
            b: 7,
          },
          // Exponential
          // Parameters: lambda, max;   
          // default: lamba = 1; max = unefined
          {
            probability: 0.1,
            type: "exponential",
            lambda: 3,
            max: 100,
          },
          // Normal
          // Parameters: m (median), sigma2 (dispersion), max, min;    
          // default: m = 0, sigma2 = 1,  max = min = undefined
          {
            probability: 0.1,
            type: "normal",
            m: 20,
            sigma2: 5,
            min: 0,
            max: 20,
          },
          // Mixed: level 2   (mixed and discrete are the same thing in the core)
          // As for discrete: For the events with no probability property it set equally normalized probabilities
          {
            type: "mixed",
            pieces: [ //and so on...
              { value: 50 }
            ]
          }
        ]
      });
    });
    
  });
  
  describe("Random", () => {
    
    it("uniform", () => {
      const distr = new Distribution({ type: "uniform", a: 200, b: 300 });
      for (var i = 0; i < 200; i++) {
        expect(distr.random()).to.be.within(200, 300);
      }
    });
    
    it("exponential", () => {
      const distr = new Distribution({ type: "exponential", max: 1 });
      for (var i = 0; i < 200; i++) {
        expect(distr.random()).to.be.within(0, 3);
      }
      
    });
    
    it("normal", () => {
      const distr = new Distribution({ type: "normal", min: 15, max: 18, m: 10 });
      for (var i = 0; i < 200; i++) {
        expect(distr.random()).to.be.within(15, 18);
      }
    });
    
    it("discrete", () => {
      const distr = new Distribution({ 
         type: "discrete", 
         events: [{value: 5, probability: 1}, {value: 10}] 
       });
      expect(distr.random()).to.be.equal(5);
    });
  });
  
});