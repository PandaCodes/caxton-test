const gaussian = require('gaussian');

/**
 * class Distribution
 * @type one of 'discrete', 'uniform', 'exponential', 'normal', 'mixed', 'single' (undefined = single)
 * @value for 'single' type
 * @pieces for 'mixed' type; array of objects. 
 *  Each shoul contain 'probability' property and subdistribution parameters.
 *  Summ of probabilities must be 1.
 *  If some probabilities are not given, they set equally in the way that whole summ becomes 1.
 * @events for 'discrete' type.
 *  In fact, 'moxed' and 'discrete' types are the same. This parameter is only the alias
 * @lambda lambda parameter for 'exponential' type.
 *  Default: 1
 * @m median parameter for 'normal' type
 *  Default: 0
 * @sigma2 dispersion parameter for 'normal' type
 *  Default: 0
 * @a, @b  interval parameters for 'uniform' type
 *  Default: [0, 1]
 * @max limiting parameter for 'normal' and 'exponential' types
 * @min limiting parameter for 'normal' type
 * @truncate boolean parameter for  'normal' and 'exponential' types that defines how to calculate the sample
 **/
class Distribution {
  constructor({
    type, 
    value, 
    pieces, 
    events, 
    lambda, 
    m, 
    sigma2, 
    a, 
    b, 
    min, 
    max, 
    truncate=false 
  }) {
    this.truncate = truncate;
    this.type = type;
    switch (type) {
      case undefined:
      case "single":
        if (!value)
          throw new Error("No value found for the single event");
        this.value = value;
        this.type = "single";
        break;
        
        
      case "discrete":
      case "mixed":
        // Check probability summ <= 1
        // Set equaly probabilities for 'pieces' which doesn't have them
        pieces = pieces || events;
        if (!pieces || pieces.length === 0)
          throw Error(`No pieces/events set in ${type} distribution`);
          
        let probabilitySumm = 0;
        let unsettedProbabilityCount = 0;
        pieces.map(p => {
          if (p.probability && (p.probability < 0 || p.probability > 1))
            throw Error(`Wrong probability value '${p.probability}' in ${type} distribution data`);
          probabilitySumm += p.probability || 0;
          unsettedProbabilityCount += p.probability ? 0 : 1;
        });
        
        if (probabilitySumm > 1 || (unsettedProbabilityCount === 0 && probabilitySumm < 0.9999))
          throw Error(`Wrong probability summ in ${type} distribution data`);
          
        const equalProbability = (1 - probabilitySumm)/unsettedProbabilityCount;
        this.pieces = pieces.map(p => 
          Object.assign(
            new Distribution(p), 
            {probability: p.probability || equalProbability}
          )
        );
        break;
        
        
      case "uniform":
        this.a = a || 0;
        this.b = b || 1;
        if (!(this.a <= this.b)) 
          throw new Error(`Invalid interval parameters '${a}', '${b}' for uniform distribution`);
        break;
        
        
      case "exponential":
        this.lambda = lambda || 1;
        this.max = max;
        if (max && max < 0)
          throw new Error(`Invalid maximum ${max} for exponential distribution`);
        if (lambda <= 0)
          throw new Error(`Invalid lambda parameter ${lambda} for exponential distribution`);
        break;
        
        
      case "normal":
        if (min && max && min >= max)
          throw new Error(`Invalid interval parameters [${min}, ${max}] for normal distribution`);
        if (sigma2 <= 0)
          throw new Error(`Invalid dispersion ${sigma2} for normal distribution`);
        this.m = m || 0;
        this.sigma2 = sigma2 || 1;
        this.min = min;
        this.max = max;
        break;
        
        
      default:
        throw new Error("Wrong distribution type. Use one of these: 'discrete', 'uniform', 'exponential', 'normal', 'mixed' or none for the single event.");
    }
  }
  
  random() {
     switch (this.type) {
      case "single":
        return this.value;
        
        
      case "mixed":
      case "discrete":
        // Choose one of parts and return it's sample
        const rndPercent = Math.random();
        let current = 0;
        let done = false;
        let sample;
        this.pieces.map((p) => {
          current += p.probability;
          if (!done && current > rndPercent) {
            sample = p.random();
            done = true;
          }
        });
        return sample;
        
        
      case "uniform":
        // No comment
        return this.a + Math.random()*(this.b-this.a);
        
        
      case "exponential":
        if (this.truncate) {
          // Truncate tail:
          return this.max ? Math.min(this.max, rndExp) : rndExp;
        
        }
        
        // Using inverse function
        // Returns the sample from normalized Exponential distribution cutted by max value
        // max is not included 
        const uniformRndMin = this.max ? Math.exp(-this.max * this.lambda) : 0;
        const uniformRnd = uniformRndMin + (1 - uniformRndMin)*Math.random();
        const rndExp = -1/this.lambda * Math.log(uniformRnd);
        
        return rndExp;
        
        
      case "normal":
        if (this.truncate) {
          // Box-Muller transform (truncate tails)
          
          const phi = (1 - Math.random()) * 2 * Math.PI;
          const cosPhi = Math.cos(phi);
          const r = Math.sqrt(-2*Math.log(1-Math.random()));
          const standartRnd = cosPhi*r;
          
          const normRnd = this.m + standartRnd * Math.sqrt(this.sigma2);
          
          const maxOrRnd = this.max ? Math.min(this.max , normRnd) : normRnd;
          const maxOrMinOrRnd = this.min ? Math.max(this.min , maxOrRnd) : maxOrRnd;
          return maxOrMinOrRnd;
        
        }
        
        
        // Using cdf and ppf
        // Returns the sample from normalized Gauss between min and max values
        // min is not included, max is included  (couse of Math.random() value range (0, 1] )
        const gauss = gaussian(this.m, this.sigma2);
        
        const uRndMin = this.min ? gauss.cdf(this.min) : 0;
        const uRndMax = this.max ? gauss.cdf(this.max) : 1;
        
        return gauss.ppf(new Distribution({
          type: "uniform", 
          a: uRndMin,
          b: uRndMax,
        }).random());
        
    }
    
  }
}

module.exports = Distribution;