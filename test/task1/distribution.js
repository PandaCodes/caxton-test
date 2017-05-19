const { expect } = require('chai');
const Distribution = require('../../src/task1/distribution');


describe("Distribution tests", () => {

  describe("Constructor errors", () => {
    
    it("single: no value", () => {
      expect(() => new Distribution()).to.throw(Error);
    });
    
    it("discrete: no events", () => {
      expect(() => new Distribution({ 
        type: "discrete"
      })).to.throw(Error);
    });
    it("discrete: probability > 1", () => {
      expect(() => new Distribution({ 
        type: "discrete",
        events: [{value: 1, probability: 200}]
      })).to.throw(Error);
     });
    it("discrete: probability < 0 (summ is ok)", () => {
      expect(() => new Distribution({ 
        type: "discrete",
        events: [{value: 1, probability: -0.5}, {value: 2, probability: 0.7}, { value:3 }]
      })).to.throw(Error);
    });
    
    it("mixed: probability summ > 1", () => {
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
    
    it("uniform: wrong interval", () => {
      expect(() => new Distribution({ 
        type: "uniform",
        a: 2,
        b: 0,
      })).to.throw(Error);
    });
    
    it("exponential: wrong maximum", () => {
      expect(() => new Distribution({ 
        type: "exponential",
        max: -10,
      })).to.throw(Error);
    });
    it("exponential: wrong lambda", () => {
      expect(() => new Distribution({ 
        type: "exponential",
        lambda: -10,
      })).to.throw(Error);
    });
    
    it("normal: wrong interval", () => {
      expect(() => new Distribution({ 
        type: "normal",
        max: -10,
        min: 10,
      })).to.throw(Error);
    });
    it("normal: wrong dispersion", () => {
      expect(() => new Distribution({ 
        type: "normal",
        sigma2: -10,
      })).to.throw(Error);
      
    });
    
    it("Wrong type", () => {
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
    
    it("uniform: value in range", () => {
      const distr = new Distribution({ type: "uniform", a: 200, b: 300 });
      for (var i = 0; i < 200; i++) {
        expect(distr.random()).to.be.within(200, 300);
      }
    });
    
    it("exponential: value in range", () => {
      const distr = new Distribution({ type: "exponential", max: 1 });
      for (var i = 0; i < 200; i++) {
        expect(distr.random()).to.be.within(0, 3);
      }
      
    });
    
    it("normal: value in range", () => {
      const distr = new Distribution({ type: "normal", min: 15, max: 18, m: 10 });
      for (var i = 0; i < 200; i++) {
        expect(distr.random()).to.be.within(15, 18);
      }
    });
    
    it("discrete: value with P = 1", () => {
      const distr = new Distribution({ 
         type: "discrete", 
         events: [{value: 5, probability: 1}, {value: 10}] 
       });
      expect(distr.random()).to.be.equal(5);
    });
    
    
    
  });
  
});