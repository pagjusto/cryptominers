import('./src/utils/canyonGeometry.js').then(({ getCanyonTrackPosition }) => {
  console.log('p=0:', getCanyonTrackPosition(0, 720, 528));
  console.log('p=0.25:', getCanyonTrackPosition(0.25, 720, 528));
  console.log('p=0.5:', getCanyonTrackPosition(0.5, 720, 528));
  console.log('p=0.75:', getCanyonTrackPosition(0.75, 720, 528));
  console.log('p=1.0:', getCanyonTrackPosition(1.0, 720, 528));
}).catch(err => console.error(err));
