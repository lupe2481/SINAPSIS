// Quantile of occupied tissue area, independent of the number/density of records.
export function areaThreshold(sorted,percent,progress=1){
 const amount=Math.round(sorted.length*Math.max(0,Math.min(100,percent))/100*Math.max(0,Math.min(1,progress)));
 return amount?sorted[Math.min(sorted.length-1,amount-1)]:-1;
}
