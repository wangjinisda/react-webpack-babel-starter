
let currWindow: any = null;

// Test helper method for mocking the window object
export let setWindow = (w: any) => {
  currWindow = w;
};

export let getWindow = () => {
  if (!currWindow) {
    currWindow = (typeof window === 'undefined') ? null : window;
  }
  return currWindow;
};
