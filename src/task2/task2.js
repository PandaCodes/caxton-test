function combinations([a, b, c]) {
  const result = {};
  for (let i = 0; i < a.length; i++) {
    const i0 = i;
    const i1 = i0 + 1 === a.length ? 0 : i0 + 1;
    const i2 = i1 + 1 === a.length ? 0 : i1 + 1;
    for (let j = 0; j < b.length; j++) {
      const j0 = j;
      const j1 = j0 + 1 === b.length ? 0 : j0 + 1;
      const j2 = j1 + 1 === b.length ? 0 : j1 + 1;
      for (let k = 0; k < c.length; k++) {
        const k0 = k;
        const k1 = k0 + 1 === c.length ? 0 : k0 + 1;
        const k2 = k1 + 1 === c.length ? 0 : k1 + 1;
        let points = 0;
        if (a[i0] === a[i1] && a[i1] === a[i2]) points += a[i0];
        if (b[j0] === b[j1] && b[j1] === b[j2]) points += b[j0];
        if (c[k0] === c[k1] && c[k1] === c[k2]) points += c[k0];
        if (a[i0] === c[k0] && c[k0] === b[j0]) points += a[i0];
        if (a[i1] === c[k1] && c[k1] === b[j1]) points += a[i1];
        if (a[i2] === c[k2] && c[k2] === b[j2]) points += a[i2];
        if (a[i0] === b[j1] && b[j1] === c[k2]) points += a[i0];
        if (a[i2] === b[j1] && b[j1] === c[k0]) points += a[i2];
        result[points] = result[points] || [];
        result[points].push([i, j, k]);
      }
    }  
  }
  return result;
}

module.exports = combinations;