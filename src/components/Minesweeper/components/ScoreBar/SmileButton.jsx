/* eslint-disable react/prop-types */
import '../../Minesweeper.scss';
import { smile, ohh, dead, win } from '../../../../assets/minesweeper/smile';
import { useAchievements } from 'dread-ui';

const SmileButton = ({ reset, status, mousedown }) => {
  function getSmiley() {
    if (status === 'lost') return <img alt='dead' src={dead} />;
    else if (status === 'won') return <img alt='win' src={win} />;
    else if (mousedown) return <img alt='ohh' src={ohh} />;
    return <img alt='smile' src={smile} />;
  }

  const { unlockAchievementById } = useAchievements();

  return (
    <div
      className='mine__face__outer h-[24px] w-[24px] rounded-[2px] border-l border-t border-[rgb(128,128,128)]'
      onClick={(e) => {
        e.preventDefault();
        unlockAchievementById('click_smiley', 'minesweeper');
        reset();
      }}
    >
      <div className='mine__face flex h-full w-full items-center justify-center rounded-[2px] border-2 border-solid bg-[rgb(192,192,192)] outline-none'>
        {getSmiley()}
        <img alt='smile' src={smile} />
      </div>
    </div>
  );
};

export default SmileButton;
