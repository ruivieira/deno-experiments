export function range(n: number): Array<number> {
  return Array.from(Array(n).keys());
}

export function rep(s: Array<any>, v: any, k: number = 0) {
  if (typeof k === "undefined") k = 0;
  var n = s[k], ret = Array(n), i;
  if (k === s.length - 1) {
    for (i = n - 2; i >= 0; i -= 2) {
      ret[i + 1] = v;
      ret[i] = v;
    }
    if (i === -1) ret[0] = v;
    return ret;
  }
  for (i = n - 1; i >= 0; i--) ret[i] = rep(s, v, k + 1);
  return ret;
}
