// patterns.js
const PRESETS = {
  "Glider": {w:3,h:3,cells:[[1,0],[2,1],[0,2],[1,2],[2,2]]},
  "Pulsar": {w:13,h:13,cells:[
    // simplified pulsar core (add full coords in practice)
    [2,4],[3,4],[4,4],[8,4],[9,4],[10,4],
    [2,8],[3,8],[4,8],[8,8],[9,8],[10,8],
    [4,2],[4,3],[4,9],[4,10],[8,2],[8,3],[8,9],[8,10]
  ]},
  "Gosper Glider Gun": {w:36,h:9,cells:[
    // coordinates for Gosper glider gun (abbreviated) — paste full list in real use
    [1,5],[2,5],[1,6],[2,6],[13,3],[14,3],[12,4],[16,4],[11,5],[17,5],[11,6],[15,6],[17,6],[18,6],[23,3],[24,3],[23,4],[24,4]
  ]}
};
