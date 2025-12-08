import React, { useEffect, useState } from 'react';
import { FaMicrochip, FaDatabase, FaCogs, FaWindowClose, FaKey } from 'react-icons/fa';
import { MdBarChart, MdDashboard } from 'react-icons/md';
import { IoMdArrowRoundBack } from "react-icons/io";
import { IoAnalyticsSharp } from "react-icons/io5";
import { TbReportAnalytics } from "react-icons/tb";
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Sidebar({ isSidebarOpen, active, toggleSidebar }) {
  // ---------- Navigation ----------
  const navigate = useNavigate();

  // const { state } = useLocation();

  const [projectID, setProjectID] = useState(-1);

  useEffect(() => {
    let project_id = localStorage.getItem('project_id');
    try {
      setProjectID(project_id);
    } catch (err) {
      console.log("Sidebar-state error", err);
    }
  }, [])

  useEffect(() => {
  }, [projectID])

  const SidebarButton = ({ text, icon: Icon, active, onClick }) => {
    return (
      <div className={`flex items-center ${active ? 'bg-gray3' : ''}  px-5 py-2 my-2 rounded-full cursor-pointer
         hover:bg-gray1 transition-all ease-in-out duration-300`} onClick={onClick}>
        <Icon className="text-xl text-green" />
        <span className="text-sm text-gray2 ml-4">{text}</span>
      </div>
    )
  }

  return (
    <div className={`h-screen lg:w-3/12 xl:w-2/12 w-64 fixed top-0 left-0 bg-black2 text-gray2 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} z-10`}>
      <div className="flex justify-center items-center mt-5 cursor-pointer" onClick={() => { navigate('/overview', { state: { project_id: projectID } }) }}>
        {!isSidebarOpen ? '' : <FaWindowClose className="text-2xl text-green mr-3 visible lg:hidden" onClick={() => toggleSidebar()} />}
        <img src={process.env.PUBLIC_URL + '/img/logo.png'} alt="Logo" className=" w-8" />
        <span className="text-xl text-gray2 font-bold font-poppins ml-2">DataCanvas</span>
      </div>

      <div className="mt-8 px-3">
        <SidebarButton text="Overview" icon={MdDashboard} active={(active == 0) ? true : false} onClick={() => {
          navigate('/overview', { state: { project_id: projectID } });
        }} />
        <SidebarButton text="Visualizations" icon={TbReportAnalytics} active={(active == 1) ? true : false} onClick={() => {
          navigate('/dashboard', { state: { project_id: projectID } });
        }} />
        <SidebarButton text="Analytics" icon={IoAnalyticsSharp} active={(active == 5) ? true : false} onClick={() => {
          navigate('/analytics', { state: { project_id: projectID } });
        }} />
        <SidebarButton text="Devices" icon={FaMicrochip} active={(active == 2) ? true : false} onClick={() => {
          navigate('/devices', { state: { project_id: projectID } });
        }} />
        <SidebarButton text="Data Tables" icon={FaDatabase} active={(active == 3) ? true : false} onClick={() => {
          navigate('/datahandler', { state: { project_id: projectID } });
        }} />
        <SidebarButton text="Settings" icon={FaCogs} active={(active == 4) ? true : false} onClick={() => {
          navigate('/projectsettings', { state: { project_id: projectID } });
        }} />
        <SidebarButton text="Access Token" icon={FaKey} active={(active == 6) ? true : false} onClick={() => {
          navigate('/accesstoken', { state: { project_id: projectID } });
        }} />

        {/* Horizontal Rule */}
        <div className="border-t border-gray1 border-opacity-40 my-4"></div>

        <SidebarButton text="Back to Projects" icon={IoMdArrowRoundBack} active={false} onClick={() => {
          navigate('/projects', { state: { project_id: projectID } });
        }} />
      </div>

    </div>
  );
}

// Default Props
Sidebar.defaultProps = {
  active: 0,
};

export default Sidebar;

