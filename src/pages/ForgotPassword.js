import React, { useState } from "react";
import { FaKey } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from "react-router-dom";
import ButtonRectangle from "../components/input/ButtonRectangle";
import TextBox from "../components/input/TextBox";
import PopupContainer from "../components/PopupContainer";
import Spinner from "../components/Spinner";
import axios from 'axios';
import app from "../firebase";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import config from "../config";


function ForgotPassword() {
  const [loading, setLoading] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };
  const [email, setEmail] = useState("");

  const checkEmail = async () => {
    try {

      if (!email) {
        console.error('Email cannot be empty');
        toast.warning('Email cannot be empty')
        return;
      }

      setLoading(true);
      // const response = await axios.get(`${config.REACT_APP_API_URL}/user?email=${email}`);
      const response = await axios.get(`${config.REACT_APP_API_URL}/user?email=` + email);

      if (response.status === 200) {
        authEmail(email);

      }
    } catch (error) {
      switch (error.response.status) {
        case 404:
          console.log('Error 404: User not found');
          toast.error('User not found !');

          break;
        case 500:
          console.log('Error 500: Internet server error');
          toast.error('Error 500: Internet server error')
          break;
        default:
          console.log('Error fetching data: ', error);
          toast.error('Error fetching data:');
      }

      setLoading(false);
    }
  };

  const authEmail = async (email) => {

    try {
      // Send password reset email
      const auth = getAuth(app);
      await sendPasswordResetEmail(auth, email);
      openModal();
      toast.success('Password reset email sent successfully.');
    } catch (error) {
      console.error('Error sending password reset email:', error.message);
      toast.error('Error sending password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL + "/img/projects_back_gray.png"
            })`,
        }}
      ></div>

      <div className="flex items-center justify-center relative z-10 h-screen">
        {/* Left Side Section */}
        <div className="w-1/2 hidden lg:flex flex-col items-center justify-center">
          <img
            src={process.env.PUBLIC_URL + "/img/logo.png"}
            alt="Logo"
            className=" w-40"
          />
          <h1 className="text-4xl text-gray2 font-bold mt-4 font-poppins">
            DataCanvas
          </h1>
          <h1 className="text-2xl text-gray1 mt-4 ">
            IoT Data Manageement Platform
          </h1>
        </div>

        {/* Right Side Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-3 md:p-8">
          <div className="border w-full sm:w-2/3 border-gray2 border-opacity-30 rounded-lg bg-black3 bg-opacity-50 backdrop-blur-sm p-2 sm:p-5 md:p-10">
            <FaKey className="text-6xl text-green mx-auto" />
            <h1 className="text-2xl text-center text-gray2 font-bold mt-4">
              Forgot Password
            </h1>
            <div className="flex flex-col items-center justify-center mt-4">
              <label className="text-gray1 text-sm">Email</label>
              <TextBox
                text=""
                type="email"
                placeholder="Enter Email"
                onChange={(event) => setEmail(event.target.value)}
                value={email}
              />
            </div>
            <div className="flex flex-col items-center justify-center mt-8">
              <ButtonRectangle
                text="Send Password Reset Link"
                isPopup={false}
                onClick={() => {
                  checkEmail();
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Spinner */}
      <Spinner isVisible={loading} />

      {/* Toast Container */}
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark" />

      {/* Password reset link sent to email displaying popup */}
      <PopupContainer isOpen={isOpen} onClose={() => { }} Icon={FaKey} title='Forgot Password?' >
        <div className="flex flex-col items-center justify-center mt-2 px-3">
          <label className="text-gray1 text-sm">Check {email} for password reset link</label>
        </div>
        <div className="flex justify-center mt-4 mb-3">
          <Link to="/login">
            <ButtonRectangle text="Done" onClick={closeModal} />
          </Link>
        </div>
      </PopupContainer>
    </div>
  );
}

export default ForgotPassword;
