import React from "react";

const InsightCard = ({ title, subtitle, icon: Icon, onClick, textSize, variant }) => {
    const danger = variant === 'danger';
    const containerClasses = `w-full sm:w-[300px] h-[120px] sm:h-[140px] rounded-2xl my-1 sm:my-5 py-2 mx-5 border relative overflow-hidden transition duration-300 ${danger ? 'bg-red bg-opacity-20 border-red hover:border-red' : 'bg-black3 border-gray1 border-opacity-60 hover:border-green'}`;
    const iconClasses = `${danger ? 'text-red' : 'text-green'} text-3xl`;
    return (
        <div className={containerClasses} onClick={onClick}>
            <div className="w-full h-full pl-6 flex flex-col">
                <div className="flex justify-end mr-3 mt-1 ">
                    <Icon className={iconClasses} />
                </div>
                <div className="flex flex-col flex-1 justify-center pb-5">
                    <div className={`text-gray2 ${(textSize === 'lg') ? 'text-3xl sm:text-4xl' : 'text-lg sm:text-xl'} font-bold`}>{title}</div>
                    <div className="text-gray1 text-sm sm:text-lg">{subtitle}</div>
                </div>
            </div>
        </div>
    );
}

InsightCard.defaultProps = {
    textSize: 'lg',
    variant: 'default'
}

export default InsightCard;