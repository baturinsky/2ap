export default interface Animation {
  /** Updates visual state. Returns true if animation is complete*/
  update:(number)=>boolean
  /** Additional renders during the render step*/
  render?:(ctx:any)=>void
  /** Callback when animation is complete - called automatically when update returns true */
  onComplete?: ()=>void
};
