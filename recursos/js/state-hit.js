// Match the 8 × 4 overview cells, including labels and sparse/empty cohorts.
export function stateAtPosition(x,y,width,height){
 const col=Math.floor((x-width*.29)/(width*.083));
 const row=Math.floor((y-height*.15)/(height*.155));
 return col>=0&&col<8&&row>=0&&row<4?row*8+col+1:null;
}
