import minesweeper_icon from './assets/minesweeper/minesweeper-icon.png';
import { useEffect, useRef, useState } from 'react';
import './App.scss';
import { useDrag } from '@use-gesture/react';
import Icon from './components/Icon';
import Window from './components/Window/Window';
import Minesweeper from './components/Minesweeper/Minesweeper';
import Taskbar from './components/Taskbar/Taskbar';
import { v4 as uuidv4 } from 'uuid';
import { UserMenu, Card, CardContent, useAchievements } from 'dread-ui';

function App() {
  const { unlockAchievementById } = useAchievements();
  const background_ref = useRef(null);
  const [selectionCoords, setSelectionCoords] = useState(null);
  const [selectionSize, setSelectionSize] = useState(null);
  const [focusedApp, setFocusedApp] = useState(null);
  const [apps, setApps] = useState([
    {
      id: uuidv4(),
      coords: [100, 100],
      icon: minesweeper_icon,
      title: 'Minesweeper',
      order: 1,
      minimized: false,
    },
  ]);

  const openApp = () => {
    const newApps = [...apps];
    let id = uuidv4();
    newApps.push({
      id,
      coords: [10, 10],
      icon: minesweeper_icon,
      title: 'Minesweeper',
      order: newApps.reduce((acc, app) => Math.max(acc, app.order), 0) + 1,
      minimized: false,
    });
    unlockAchievementById('open_window', 'minesweeper');
    if (newApps.length >= 2)
      unlockAchievementById('two_windows', 'minesweeper');
    if (newApps.length >= 5)
      unlockAchievementById('five_windows', 'minesweeper');
    setApps(newApps);
    setFocusedApp(id);
  };
  const closeApp = (id) => {
    let next_id = null;
    setApps((prev_apps) => {
      const current_apps_length = prev_apps.length;
      let remaining_apps = prev_apps.filter((app) => app.id !== id);
      if (current_apps_length > remaining_apps.length)
        unlockAchievementById('close_window', 'minesweeper');
      next_id = getHighestOrderOpenId(remaining_apps);
      return remaining_apps;
    });
    requestFocus(next_id);
  };
  const minimizeApp = (id) => {
    let app = apps.find((app) => app.id === id);
    if (!app.minimized) unlockAchievementById('minimize_window', 'minesweeper');
    app.minimized = true;
    setApps([...apps]);
    requestFocus(getHighestOrderOpenId());
  };

  const taskbarWindowClicked = (id) => {
    let app = apps.find((app) => app.id === id);
    if (app.minimized) app.minimized = false;
    else if (focusedApp === id) {
      app.minimized = true;
      unlockAchievementById('minimize_window', 'minesweeper');
    }
    setApps([...apps]);
    if (!app.minimized) requestFocus(id);
    else requestFocus(getHighestOrderOpenId());
  };

  const getHighestOrderOpenId = (candidate_apps) => {
    if (!candidate_apps) candidate_apps = apps;
    let order = candidate_apps
      .filter((app) => !app.minimized)
      .reduce((acc, app) => Math.max(acc, app.order), null);
    return candidate_apps.find((app) => app.order === order)?.id ?? null;
  };

  const requestFocus = (id) => {
    setFocusedApp(id);
    setApps((prev_apps) => {
      const nums = getUniqueNums(
        apps.filter((app) => app.id !== id).map((app) => app.order),
      );
      return prev_apps.map((app) => {
        if (app.order in nums) {
          app.order = nums[app.order];
        } else {
          app.order = Object.keys(nums).length;
        }
        return app;
      });
    });
  };

  const getUniqueNums = (nums) => {
    if (nums.length === 0) return {};
    let ids = {};
    for (let i = 0; i < nums.length; i++) {
      ids[nums[i]] = i;
    }
    return ids;
  };

  const bind = useDrag(
    (e) => {
      if (e.active && e.target === background_ref.current) {
        setFocusedApp(null);
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
    { bounds: background_ref, pointer: { capture: false } },
  );

  useEffect(() => {
    setApps((prev_apps) => {
      const new_apps = [...prev_apps];
      const app = new_apps[0];
      app.coords = [
        Math.max(
          (background_ref.current.offsetWidth - app.ref.current.offsetWidth) /
            2,
          0,
        ),
        Math.max(
          (background_ref.current.offsetHeight - app.ref.current.offsetHeight) /
            2,
          0,
        ),
      ];
      return new_apps;
    });
    requestFocus(getHighestOrderOpenId());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className='flex h-full w-full flex-col'>
      <div
        {...bind()}
        ref={background_ref}
        className='relative w-full flex-1 overflow-hidden'
        style={{
          backgroundImage: `url(https://i.imgur.com/Zk6TR5k.jpg)`,
          backgroundSize: 'cover',
          touchAction: 'none',
        }}
      >
        <Icon
          src={minesweeper_icon}
          name={'Minesweeper'}
          coords={[40, 40]}
          selection={[selectionCoords, selectionSize]}
          onDoubleClick={openApp}
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
        {apps.map((app) => (
          <Window
            key={app.id}
            app={app}
            focusedApp={focusedApp}
            requestFocus={requestFocus}
            background_ref={background_ref}
            closeApp={closeApp}
            setApps={setApps}
            minimizeApp={minimizeApp}
          >
            <Minesweeper closeApp={() => closeApp(app.id)} />
          </Window>
        ))}
        <Card className='absolute right-[40px] top-[40px] rounded-full'>
          <CardContent noHeader className='p-0'>
            <UserMenu />
          </CardContent>
        </Card>
      </div>
      <Taskbar
        apps={apps}
        focusedApp={focusedApp}
        taskbarWindowClicked={taskbarWindowClicked}
      />
    </div>
  );
}

export default App;
