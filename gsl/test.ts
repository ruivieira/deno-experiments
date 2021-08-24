/**
 * INFO: experiments with `libgsl` and FFI
 */
const libName = `/usr/local/lib/libgsl.dylib`;
const dylib = Deno.dlopen(libName, {
  "gsl_hypot3": { parameters: ["f64", "f64", "f64"], result: "f64" },
});

console.log(dylib.symbols.gsl_hypot3(1, 2, 3));
