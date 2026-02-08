import React, { useState, useEffect } from 'react';
import { FaSearch, FaRegQuestionCircle, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { VscSignOut } from "react-icons/vsc";
import { useNavigate, useLocation } from 'react-router-dom';
import Spinner from '../Spinner';
import axios from 'axios';
import { toast } from 'react-toastify';
import SearchResults from '../SearchResults';
import { firebaseGetFileURL } from '../../services/storageService';
import config from "../../config";

const Topbar = ({ searchBarDisplayed, sideBarButtonDisplayed, isSidebarOpen, toggleSidebar, breadcrumb }) => {
    // ---------- Navigation ----------
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [projectID, setProjectID] = useState(-1);

    // Function to handle breadcrumb navigation
    const handleBreadcrumbClick = (index, segment) => {
        const project = localStorage.getItem('project');
        const projectId = localStorage.getItem('project_id');
        
        // First segment is always the project name
        if (index === 0) {
            navigate('/overview', { state: { project_id: projectId } });
        } 
        // Handle specific page navigation based on segment name
        else {
            const segmentLower = segment.toLowerCase().trim();
            
            if (segmentLower === 'overview') {
                navigate('/overview', { state: { project_id: projectId } });
            } else if (segmentLower === 'visualizations' || segmentLower === 'dashboard') {
                navigate('/dashboard', { state: { project_id: projectId } });
            } else if (segmentLower === 'analytics') {
                navigate('/analytics', { state: { project_id: projectId } });
            } else if (segmentLower === 'devices') {
                navigate('/devices', { state: { project_id: projectId } });
            } else if (segmentLower === 'data tables') {
                navigate('/datahandler', { state: { project_id: projectId } });
            } else if (segmentLower === 'project settings') {
                navigate('/projectsettings', { state: { project_id: projectId } });
            } else if (segmentLower === 'access tokens') {
                navigate('/accesstoken', { state: { project_id: projectId } });
            } else if (segmentLower === 'user settings') {
                navigate('/usersettings');
            }
            // For table names (e.g., "{tablename} > Configure" or "{tablename} > Dataset")
            // We don't navigate to intermediate segments, only final destinations
        }
    };

    const [profilePicture, setProfilePicture] = useState(process.env.PUBLIC_URL + '/img/sample_user.png');

    useEffect(() => {
        let project_id = localStorage.getItem('project_id');
        try {
            if (project_id) {
                setProjectID(project_id);
                loadProfilePicture();
            }
        } catch (err) {
            console.log("Sidebar-state error", err);
        }
    }, [])

    const loadProfilePicture = async () => {
        if ((profilePicture == '' || profilePicture == process.env.PUBLIC_URL + '/img/sample_user.png') && localStorage.getItem('uid')) {
            try {
                const url = await firebaseGetFileURL('profile_pictures', `${localStorage.getItem('uid')}.jpg`);
                setProfilePicture(url);
            } catch (error) {
                console.log('Error loading profile picture', error);
                setProfilePicture(process.env.PUBLIC_URL + '/img/sample_user.png');
            }
        }
    }

    const [searchBarShown, setSearchBarShown] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState({
        projects: [

        ],
        devices: [

        ],
        datatables: [

        ],
        widgets: [

        ]
    })
    const [searchResultsShown, setSearchResultsShown] = useState(false)
    const toggleSearchResults = () => {
        if (searchResultsShown) {
            setSearchResults({
                projects: [

                ],
                devices: [

                ],
                datatables: [

                ],
                widgets: [

                ]
            })
            setSearchKeyword('')
        }
        setSearchResultsShown(!searchResultsShown);
    }

    /*
        * Implement search function
        * Validate if the search keyword is empty
        * API Endpoint : ${config.REACT_APP_API_URL}/data/get/search?keyword={searchKeyword}&user_id={uid}
        * Method : GET
        * Get uid from localStorage
        * If uid is empty or it is null, do not search and show a toast as Something Went Wrong
        * If searchKeyword is empty, do not search and show a toast as Please enter a keyword to search
        * Response :
        * 200: Success. Console log the results
        * 400: Bad request. Either keyword or user_id is not given
        * 500: Internal Server Error
    */
    const handleSearch = async () => {
        const uid = localStorage.getItem('uid');
        const keyword = searchKeyword.trim();
        //validate if uid is empty
        if (!uid) {
            toast.error('Something Went Wrong');
            return;
        }
        //validate if keyword is empty
        if (searchKeyword === '') {
            toast.error('Please enter a keyword to search');
            return;
        }

        setLoading(true);
        console.log('searching for', keyword, uid);
        try {
            const url = `${config.REACT_APP_API_URL}/data/get/search?keyword=${keyword}&project_id=${projectID}`;
            const response = await axios.get(url,
                {
                    headers: {
                        "authorization": localStorage.getItem('auth-token'),
                    }
                }
            );

            if (response.status == 200) {
                setSearchResults(response.data);
                toggleSearchResults();
            }

            setLoading(false);
        }
        catch (error) {
            console.log(error);
            toast.error('Something went wrong while searching');
            setLoading(false);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('uid');
        localStorage.removeItem('email');
        localStorage.removeItem('project');
        navigate('/login');
    }

    return (
        <>
            {searchBarShown ? (
                <div className="flex w-full items-center justify-end h-20 px-5">
                    <div className={`w-full relative mr-4 ${searchBarShown ? ' opacity-100' : 'opacity-0'} transition-opacity ease-out duration-500`}>
                        <div className="absolute inset-y-0 start-1 flex items-center ps-3.5 pointer-events-none">
                            <FaSearch className="text-green text-lg" />
                        </div>
                        <input
                            type="text"
                            id="input-group-1"
                            className="w-full bg-black3 border border-gray2 border-opacity-30 rounded-full pr-4 ps-12 py-1 text-sm"
                            placeholder="Search Project"
                            value={searchKeyword}
                            onChange={(e) => { setSearchKeyword(e.target.value) }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }} />
                    </div>
                    <FaTimes className="text-2xl text-green mr-4 cursor-pointer hover:text-white transition-all duration-300" onClick={() => setSearchBarShown(false)} />
                </div>
            ) : (
                <div className="flex w-full items-center justify-end sm:justify-between h-20 px-5">
                    <div className='text-gray2 text-sm hidden sm:block truncate mr-3'>
                        {breadcrumb ? (
                            breadcrumb.split(' > ').map((segment, index, array) => (
                                <span key={index}>
                                    {index < array.length - 1 ? (
                                        <>
                                            <span 
                                                className="cursor-pointer hover:text-green transition-colors duration-200"
                                                onClick={() => handleBreadcrumbClick(index, segment)}
                                            >
                                                {segment}
                                            </span>
                                            <span className="mx-2">{'>'}</span>
                                        </>
                                    ) : (
                                        <span className="text-white">{segment}</span>
                                    )}
                                </span>
                            ))
                        ) : null}
                    </div>
                    <div className='flex flex-row justify-center items-center'>
                        {searchBarDisplayed ? (
                            <>
                                <div className={`w-84 relative mr-4 hidden sm:block`}>
                                    <div className="absolute inset-y-0 start-1 flex items-center ps-3.5 pointer-events-none">
                                        <FaSearch className="text-green text-lg" />
                                    </div>
                                    <input
                                        type="text"
                                        id="input-group-1"
                                        className="w-full bg-black3 border border-gray2 border-opacity-30 rounded-full pr-4 ps-12 py-1 text-sm"
                                        placeholder="Search Project"
                                        value={searchKeyword}
                                        onChange={(e) => { setSearchKeyword(e.target.value) }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearch();
                                            }
                                        }}
                                    />
                                </div>
                                <FaSearch className="text-2xl text-green mr-4 cursor-pointer sm:hidden" onClick={() => setSearchBarShown(true)} />
                            </>
                        ) : null}

                        <FaRegQuestionCircle className="text-2xl text-green mr-4 cursor-pointer" />
                        <VscSignOut className="text-2xl text-green mr-4  cursor-pointer"
                            onClick={() => { handleLogout() }} />
                        {!isSidebarOpen && sideBarButtonDisplayed ? (
                            <FaBars className="text-2xl text-green mr-4 cursor-pointer visible lg:hidden" onClick={toggleSidebar} />
                        ) : null}
                        <img src={profilePicture} alt="Logo" className="w-10 h-10 object-cover rounded-full cursor-pointer" onClick={() => navigate('/usersettings')} />
                    </div>
                </div>
            )}
            <SearchResults
                results={searchResults}
                isOpen={searchResultsShown}
                closeFunction={() => toggleSearchResults()}
                keyword={searchKeyword}
                projectID={projectID}
            />
            <Spinner isVisible={loading} />
        </>
    );
}

export default Topbar;

