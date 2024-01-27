import React from 'react';
import { FaMicrochip, FaDatabase, FaCogs, FaWindowClose } from 'react-icons/fa';
import { MdBarChart, MdDashboard } from 'react-icons/md';

function Sidebar({ isSidebarOpen, active, toggleSidebar }) {

  const SidebarButton = ({ text, icon: Icon, active, onClick }) => {
    return (
      <div className={`flex items-center ${active ? 'bg-gray3' : ''}  px-5 py-2 my-2 rounded-full cursor-pointer
         hover:bg-gray1 transition-all ease-in-out duration-300`}>
        <Icon className="text-xl text-green" />
        <span className="text-sm text-gray2 ml-4">{text}</span>
      </div>
    )
  }

  return (
    <div className={`h-screen lg:w-3/12 xl:w-2/12 w-64 fixed top-0 left-0 bg-black2 text-gray2 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} z-10`}>
      <div className="flex justify-center items-center mt-5">
        {!isSidebarOpen ? '' : <FaWindowClose className="text-2xl text-green mr-3 visible lg:hidden" onClick={() => toggleSidebar()} />}
        <img src={process.env.PUBLIC_URL + '/img/logo.png'} alt="Logo" className=" w-8" />
        <span className="text-xl text-gray2 font-bold font-poppins ml-2">DataCanvas</span>
      </div>

      <div className="mt-8 px-3">
        <SidebarButton text="Overview" icon={MdDashboard} active={(active == 0) ? true : false} />
        <SidebarButton text="Dashboard" icon={MdBarChart} active={(active == 1) ? true : false} />
        <SidebarButton text="Devices" icon={FaMicrochip} active={(active == 2) ? true : false} />
        <SidebarButton text="Data Tables" icon={FaDatabase} active={(active == 3) ? true : false} />
        <SidebarButton text="Settings" icon={FaCogs} active={(active == 4) ? true : false} />
      </div>
    </div>
  );
}

// Default Props
Sidebar.defaultProps = {
  active: 0,
};

export default Sidebar;
