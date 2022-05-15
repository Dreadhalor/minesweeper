// import logo from './logo.svg';
import bliss from './assets/bliss.jpeg';
import minesweeper_icon from './assets/minesweeper/minesweeper-icon.png';
import { useEffect, useRef, useState } from 'react';
import './App.scss';
import { useDrag } from '@use-gesture/react';
import Icon from './components/Icon';
import Window from './components/Window/Window';
import Minesweeper from './components/Minesweeper/Minesweeper';
import Taskbar from './components/Taskbar/Taskbar';

function App() {
  const [windowCoords, setWindowCoords] = useState([10, 10]);
  const window_ref = useRef(null);
  const background_ref = useRef(null);
  const [selectionCoords, setSelectionCoords] = useState(null);
  const [selectionSize, setSelectionSize] = useState(null);

  const cols = 16,
    cell_size = 16;

  const bind = useDrag(
    (e) => {
      setWindowCoords([
        windowCoords[0] + e.delta[0],
        windowCoords[1] + e.delta[1],
      ]);
    },
    { bounds: background_ref }
  );

  const bind2 = useDrag(
    (e) => {
      if (e.active && e.target === background_ref.current) {
        // get the top left corner
        let top_left = [
          Math.min(e.initial[0], e.xy[0]),
          Math.min(e.initial[1], e.xy[1]),
        ];
        // get the bottom right corner
        let bottom_right = [
          Math.max(e.initial[0], e.xy[0]),
          Math.max(e.initial[1], e.xy[1]),
        ];
        // get the width and height
        let width = bottom_right[0] - top_left[0];
        let height = bottom_right[1] - top_left[1];
        // set the selection size
        setSelectionSize([width, height]);
        // set the selection coordinates
        setSelectionCoords([top_left[0], top_left[1]]);
      } else {
        setSelectionSize(null);
        setSelectionCoords(null);
      }
    },
    { bounds: background_ref }
  );

  useEffect(() => {
    setWindowCoords([
      Math.max(
        (background_ref.current.offsetWidth -
          (window_ref.current.offsetWidth + cols * cell_size)) /
          2,
        0
      ),
      Math.max(
        (background_ref.current.offsetHeight -
          (window_ref.current.offsetHeight + cols * cell_size)) /
          2,
        0
      ),
    ]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className='flex h-full w-full flex-col'>
      <div
        {...bind2()}
        ref={background_ref}
        className='relative w-full flex-1'
        style={{
          backgroundImage: `url(${bliss})`,
          backgroundSize: 'cover',
          touchAction: 'none',
        }}
      >
        <Icon
          src={minesweeper_icon}
          name={'Minesweeper'}
          coords={[40, 40]}
          selection={[selectionCoords, selectionSize]}
        />
        <div
          className='absolute h-10 w-10 border-2 border-blue-400 bg-blue-200 opacity-50'
          style={{
            display: selectionSize ? 'block' : 'none',
            left: selectionCoords ? `${selectionCoords[0]}px` : 0,
            top: selectionCoords ? `${selectionCoords[1]}px` : 0,
            width: selectionSize ? `${selectionSize[0]}px` : 0,
            height: selectionSize ? `${selectionSize[1]}px` : 0,
          }}
        ></div>
        <Window
          ref={window_ref}
          windowCoords={windowCoords}
          bind={bind}
          icon={minesweeper_icon}
          title={'Minesweeper'}
        >
          <Minesweeper />
        </Window>
      </div>
      <Taskbar />
    </div>
  );
}

export default App;