// The heights of the last ten American presidents in cm, from Kennedy to Obama
import * as ld from "./mentat/stats/distributions.ts";
import * as mcmc from "./bayesjs/mcmc.ts";

let data = [183, 192, 182, 183, 177, 185, 188, 188, 182, 185];

let params = {
  mu: { type: mcmc.ParameterType.Real },
  sigma: { type: mcmc.ParameterType.Real, lower: 0 },
};

function log_post(state: any, data: any) {
  var log_post = 0;
  // Priors
  log_post += ld.norm(state.mu, 0, 100);
  log_post += ld.unif(state.sigma, 0, 100);
  // Likelihood
  for (var i = 0; i < data.length; i++) {
    log_post += ld.norm(data[i], state.mu, state.sigma);
  }
  return log_post;
} // Initializing the sampler

let sampler = new mcmc.AmwgSampler(params, log_post, data);
// Burning some samples to the MCMC gods and sampling 5000 draws.
sampler.burn(1000);
let samples = sampler.sample(5000);

(window as any).samples = samples;
