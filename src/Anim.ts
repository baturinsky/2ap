export default interface Anim {
  update:(number)=>boolean,
  render?:(ctx:any)=>void
};
