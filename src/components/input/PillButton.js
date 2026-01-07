import React from 'react';

const PillButton = ({ text, onClick, icon: Icon, isPopup, color, disabled, className }) => {
  const baseClasses = `w-auto py-1 bg-black3 border ${color == 'red' ? 'border-red' : 'border-green'} text-${color} rounded-full text-center ${isPopup ? 'px-10' : 'px-5 sm:px-10'} 
  hover:bg-black
  hover:text-gray2
  hover:border-gray1
  transition duration-300 ease-in-out
  flex flex-row items-center justify-center"`;
  const buttonClasses = `${baseClasses} ${className || ''}`;

  return (
    <button className={buttonClasses} onClick={onClick} disabled={disabled}>
      <span className='text-sm'>{text}</span>
      {Icon ? <Icon className={`text-sm ml-2`} /> : null}
    </button>
  );
};

// Default props
PillButton.defaultProps = {
  onClick: () => { },
  isPopup: false,
  color: 'green',
  disabled: false,
  className: '',
};

export default PillButton;

