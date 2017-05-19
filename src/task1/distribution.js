const gaussian = require('gaussian');

module.exports = class Distribution {
  constructor({type, value, pieces, events, lambda, m, sigma2, a, b, min, max}) {
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
        const rndPercent = Math.random();
        let current = 0;
        let done = false;
        let rnd;
        this.pieces.map((p) => {
          current += p.probability;
          if (!done && current > rndPercent) {
            rnd = p.random();
            done = true;
          }
        });
        return rnd;
      case "uniform":
        return this.a + Math.random()*(this.b-this.a);
      case "exponential":
        // Using inverse function
        // Returns the sample from normalized Exponential distribution cutted by max value
        // max is not included 
        const uniformRndMin = this.max ? Math.exp(-this.max * this.lambda) : 0;
        const uniformRnd = uniformRndMin + (1 - uniformRndMin)*Math.random();
        const rndExp = -1/this.lambda * Math.log(uniformRnd);
        
        return rndExp; 
        
        // Truncate tail:
        /*return this.max ? Math.min(this.max, rndExp) : rndExp;
        */
        
      case "normal":
        // Using cdf and ppf
        // Returns the sample from normalized Gauss between min and max values
        // min is not included, max is included  (couse of Math.random() value range (0, 1] )
        const gauss = gaussian(this.m, this.sigma2);
        
        const uRndMin = gauss.cdf(this.min);
        const uRndMax = gauss.cdf(this.max);
        
        return gauss.ppf(new Distribution({
          type: "uniform", 
          a: uRndMin,
          b: uRndMax,
        }).random());
        
        
        // Box-Muller transform (truncate tails)
        /*
        const phi = (1 - Math.random()) * 2 * Math.PI;
        const cosPhi = Math.cos(phi);
        const r = Math.sqrt(-2*Math.log(1-Math.random()));
        const standartRnd = cosPhi*r;
        
        const normRnd = this.m + standartRnd * sigma;
        
        const maxOrRnd = this.max ? Math.min(this.max , normRnd) : normRnd;
        const maxOrMinOrRnd = this.min ? Math.max(this.min , maxOrRnd) : maxOrRnd;
        return maxOrMinOrRnd;
        */
        
    }
    
  }
}