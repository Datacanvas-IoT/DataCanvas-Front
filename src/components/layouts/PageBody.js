import React, { } from 'react';

import Topbar from './Topbar';

function PageBody({ children, isSidebarOpen, toggleSidebar, breadcrumb }) {

  return (
    <div className={`w-full lg:w-9/12 xl:w-10/12 ml-auto bg-black text-gray2`}>
      <Topbar searchBarDisplayed={true} sideBarButtonDisplayed={true} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} breadcrumb={breadcrumb} />
      <div className="mt-1 overflow-y-auto h-[calc(100vh-theme(spacing.16))] text-white">
        {children}
      </div>
    </div>
  );
}

export default PageBody;
