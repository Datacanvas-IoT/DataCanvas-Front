import React, { useState, useEffect } from "react";
import { FaPlus, FaPlusCircle, FaCheck, FaCheckCircle } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import NonSidebarLayout from "../components/layouts/NonSidebarLayout";
import PillButton from "../components/input/PillButton";
import TextBox from "../components/input/TextBox";
import SquareCard from "../components/cards/SquareCard";
import PopupContainer from "../components/PopupContainer";
import Spinner from "../components/Spinner";
import axios from "axios";
import config from "../config";

function Projects() {
  // ---------- Navigation ----------
  const navigate = useNavigate();

  // ---------- Loading state for spinner ----------
  const [loading, setLoading] = useState(false);

  // ---------- States and toggle functions for 2 modals -> Add Project and Project Adding Done ----------
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);

  const toggleAddProjectModal = () => {
    setIsAddProjectOpen(!isAddProjectOpen);
  };

  const [isProjectAddingDoneOpen, setIsProjectAddingDoneOpen] = useState(false);

  const toggleProjectAddingDoneModal = () => {
    if (isProjectAddingDoneOpen) {
      getAllProjetcs();
    }
    setIsProjectAddingDoneOpen(!isProjectAddingDoneOpen);
  };

  const [projects, setProjects] = useState([]); // This fills by the projects from the server
  const [newProjectName, setNewProjectName] = useState(""); // This is for the textbox of Add Project
  const [newProjectDescription, setNewProjectDescription] = useState(""); // This is for the textbox of Add Project
  const [newProjectRealTimeEnabled, setNewProjectRealTimeEnabled] = useState(false); // This is for the checkbox of Add Project
  const [newProjectID, setNewProjectID] = useState(""); // This is for the textbox of Project Adding Done and fills when project successfully added

  const handleProjectNameChange = (e) => {
    setNewProjectName(e.target.value);
  };

  const handleProjectDescriptionChange = (e) => {
    setNewProjectDescription(e.target.value);
  };

  // ---------- API call for getting projects of the user ----------
  const getAllProjetcs = async () => {
    setLoading(true);
    // Get user ID from local storage
    try {
      var userID = localStorage.getItem("uid");
      var token = localStorage.getItem("auth-token");
    } catch (err) {
      toast.error("Your Session Has Expired! Please Login Again!");
      setLoading(false);
      return;
    }

    try {
      // Send an get API request with authorization headers
      const result = await axios.get(
        `${config.REACT_APP_API_URL}/project?user_id=` + userID,
        {
          headers: {
            authorization: token,
          },
        }
      );

      if (result.status === 200) {
        setProjects(result.data);
      }
    } catch (err) {
      switch (err.response.status) {
        // Status -> 401 - Unauthorized, 403 - Bad Request
        case 401:
          toast.error("Your Session Has Expired! Please Login Again!");
          unauthorizedAccess();
          break;
        case 403:
          toast.error("You Are Not Authorized To Add Project!");
          unauthorizedAccess();
          break;
        case 404:
          break;
        default:
          toast.error("Something Went Wrong!");
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------- API call for adding new project ----------
  const handleProjectAdding = async () => {
    if (newProjectName === "" || newProjectName == null || newProjectDescription === "" || newProjectDescription == null) {
      toast.error("Project name and description cannot be empty!");
      return;
    }

    setLoading(true);
    // Get user ID from local storage
    try {
      var userID = localStorage.getItem("uid");
      var token = localStorage.getItem("auth-token");
    } catch (err) {
      toast.error("Your Session Has Expired! Please Login Again!");
      setLoading(false);
      return;
    }

    try {
      // Send an post API request with authorization headers
      const result = await axios.post(
        `${config.REACT_APP_API_URL}/project/`,
        {
          project_name: newProjectName,
          description: newProjectDescription,
          user_id: userID,
          real_time_enabled: newProjectRealTimeEnabled,
        },
        {
          headers: {
            authorization: token,
          },
        }
      );

      if (result.status === 200) {
        setNewProjectID(result.data.project_id);
        toggleAddProjectModal();
        toggleProjectAddingDoneModal();
      }
    } catch (err) {
      switch (err.response.status) {
        // Status -> 401 - Unauthorized, 403 - Bad Request, 400 - Project name and description cannot be empty
        case 401:
          toast.error("Your Session Has Expired! Please Login Again!");
          unauthorizedAccess();
          break;
        case 403:
          toast.error("You Are Not Authorized To Add Project!");
          unauthorizedAccess();
          break;
        case 400:
          toast.error("Project name and description cannot be empty!");
          break;
        default:
          toast.error("Something Went Wrong!");
          break;
      }
    } finally {
      setNewProjectName("");
      setNewProjectDescription("");
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllProjetcs();
  }, []);

  // ---------- Function for unauthorized access ----------
  const unauthorizedAccess = () => {
    localStorage.removeItem("uid");
    localStorage.removeItem("auth-token");
    navigate("/login");
  };

  // ---------- Popup content of Add Project ----------
  const AddProjectCard = () => {
    return (
      <div
        className={`w-full sm:w-[300px] h-[200px] bg-black3 rounded-3xl my-1 sm:my-5 mx-2
                    border border-green relative overflow-hidden text-green
                    transition duration-300 hover:border-gray1 hover:text-gray2 hover:bg-opacity-50 hover:backdrop-blur-md
                    flex flex-col items-center justify-center space-y-4`}
        onClick={toggleAddProjectModal}
      >
        <FaPlus className={`text-5xl `} />
        <h1 className={`text-xl font-bold`}>Start New Project</h1>
      </div>
    );
  };

  return (
    <NonSidebarLayout breadcrumb={''}>
      <div className={`container pt-10 xl:px-32`}>
        <h1 className={`text-xl text-gray2 mx-5`}>Your DataCanvas Projects</h1>
        <div className={`flex-wrap flex justify-center mt-5 mb-48`}>
          <AddProjectCard />
          {projects.map((project) => (
            <SquareCard
              key={project.project_id}
              title={project.project_name}
              subtitle={project.description}
              footer={"Created on " + project.createdAt.substring(0, 10)}
              mx="mx-2"
              onClick={() => {
                localStorage.setItem("project", project.project_name);
                localStorage.setItem("project_id", project.project_id);
                navigate("/overview", {
                  state: { project_id: project.project_id },
                });
              }}
            />
          ))}
        </div>
        <div
          className={`fixed w-full bottom-0 lef-0 right-0 pb-5 flex flex-col items-center backdrop-blur-lg bg-black bg-opacity-30`}
        >
          <hr className="border-t-2 border-gray1 border-opacity-50 mb-2 lg:w-9/12 md:w-10/12 w-full" />
          <span className="lg:w-9/12 md:w-10/12 w-full text-gray1 text-center text-xs md:text-sm mx-5 md:mx-0">
            DataCanvas is you on-the-go IoT project data warehousing,
            visualization and analysis solution. Get started by creating a new
            project or migrating your existing project here.
          </span>
        </div>
      </div>

      {/* popup Container for project adding */}
      <PopupContainer
        isOpen={isAddProjectOpen}
        onClose={() => { }}
        closeFunction={toggleAddProjectModal}
        Icon={FaPlusCircle}
        title="Add New Project"
        closeIconVisible={true}
      >
        <div className="flex flex-col justify-center mt-4">
          <label className="text-gray1 text-sm">Project Name</label>
          <TextBox
            text=""
            type="text"
            placeholder="Project Name"
            maxLength={50}
            textAlign={"left"}
            onChange={handleProjectNameChange}
            value={newProjectName}
          />
        </div>

        <div className="flex flex-col justify-center mt-4">
          <label className="text-gray1 text-sm">Project Description</label>
          <TextBox
            text=""
            type="text"
            placeholder="Project Description"
            maxLength={150}
            textAlign={"left"}
            onChange={handleProjectDescriptionChange}
            value={newProjectDescription}
          />
        </div>

        <div className="flex w-full justify-center items-center mt-8 mb-8">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-green ml-2"
            onChange={() => setNewProjectRealTimeEnabled(!newProjectRealTimeEnabled)}
          />
          <label className="ms-2 text-white text-sm">Real-Time Enabled</label>
        </div>

        <div className="flex flex-col items-center justify-center mt-4">
          <PillButton
            text="Create Project"
            onClick={handleProjectAdding}
            isPopup={true}
            icon={FaPlusCircle}
          />
        </div>
      </PopupContainer>

      {/* popup Container for project adding done - project ID showing */}
      <PopupContainer
        isOpen={isProjectAddingDoneOpen}
        onClose={() => { }}
        closeFunction={toggleProjectAddingDoneModal}
        Icon={FaCheckCircle}
        title="Project Addedd Successfully"
        closeIconVisible={true}
      >
        <div className="flex flex-col justify-center items-center mt-3">
          <label className="text-gray1 text-sm">Project ID</label>
          <input
            type="text"
            value={newProjectID}
            className="w-full bg-black3 border border-gray2 border-opacity-30 rounded-full text-center px-4 py-1 mt-2 text-gray2"
            readOnly
          />
          <span className="text-gray2 text-xs text-center mt-2">
            This project ID should be included in data send requests. Check project settings for MQTT key.
          </span>
        </div>

        <div className="flex flex-col items-center justify-center mt-4">
          <PillButton
            text="Done"
            onClick={toggleProjectAddingDoneModal}
            isPopup={true}
            icon={FaCheck}
          />
        </div>
      </PopupContainer>

      {/* Spinner */}
      <Spinner isVisible={loading} />

      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </NonSidebarLayout>
  );
}

export default Projects;
