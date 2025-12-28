import React from "react";

const RectangularRowCard = ({ title, subtitle, icon: Icon, onClick }) => {
    return (
        <div className={
            `w-full bg-black3 rounded-lg my-1 sm:my-1 cursor-pointer text-gray2
        border border-gray1 border-opacity-60 relative overflow-hidden
        transition duration-300 hover:border-green hover:border-opacity-50 hover:text-green`
        }
            onClick={onClick}>
            <div className="w-full h-full py-1 pl-6 pr-4 flex flex-col justify-between">
                {/* Content for the title and subtitle */}
                <div className="flex justify-between items-center">
                    <div className="text-md text-gray2 max-w-full truncate mr-3 ">{title}</div>
                    <div className="flex flex-row items-center">
                        <div className="text-gray1 text-sm font-sm overflow-hidden hidden sm:block">
                            {subtitle}
                        </div>
                        {Icon && <Icon className="ml-3 text-3xl" />}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RectangularRowCard;