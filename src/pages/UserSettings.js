import React, { useState, useEffect, useRef } from "react";
import { FaUpload } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import TextBox from "../components/input/TextBox";
import Spinner from "../components/Spinner";
import axios from "axios";
import NonSidebarLayout from "../components/layouts/NonSidebarLayout";
import CriticalAction from "../components/CriticalAction";
import PillButton from "../components/input/PillButton";
import LoginPopup from "../components/LoginPopup";
import storageService from "../services/storageService";
import { firebaseImageUpload, firebaseGetFileURL } from "../services/storageService";
import config from "../config";

function UserSettings() {
    // navigation hooks
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);


    const fileInputRef = useRef();

    // ---------- Login for proceed with critical actions
    const [isLoginPopupVisible, setIsLoginPopupVisible] = useState(false);
    const [actionType, setActionType] = useState('');
    const [authenticationResult, setAuthenticationResult] = useState(false);


    useEffect(() => {
        if (authenticationResult) {
            setIsLoginPopupVisible(false);
            if (actionType === 1) {
                toast.success('Action Confirmed, Deleting Account! We are sorry to see you go!');
                // handleDeleteAccount(); -> TODO: This function should be implemented
            }
            else if (actionType === 2) {
                toast.success('login Sucessful! You will be redirected to change email!');
                // handleChangeEmail(); TODO: This function should be implemented
            }
        }
    }, [authenticationResult]);

    //user state details
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [userID, setUserID] = useState(-1);
    const [profilePicture, setProfilePicture] = useState(`${process.env.PUBLIC_URL}/img/sample_user.png`);

    useEffect(() => {
        loadUserDetails();
    }, []);

    const handleNameChange = (e) => {
        setName(e.target.value);
    }

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    }

    const handlePasswordReset = () => {
        const auth = getAuth();
        sendPasswordResetEmail(auth, email)
            .then(() => {
                toast.success('Password reset email sent successfully. Check your Mailbox.');
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                toast.error('Error sending password reset email:', errorCode, errorMessage);
            });
    }

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleProfilePictureChange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            toast.error('No file selected.');
            return;
        }
        const fileType = file.type;
        if (fileType !== 'image/jpeg' || fileType !== 'image/png') {
            try {
                const url = await firebaseImageUpload(file, 'profile_pictures', userID);
                setProfilePicture(url);
                toast.success('Profile picture updated successfully!');
            } catch (error) {
                console.error('Error uploading image: ', error);
                toast.error('Error uploading image');
            }
        }
        else {
            toast.error('Invalid file type. Please upload a jpg file');
        }
    }


    // Load user details
    const loadUserDetails = () => {
        setLoading(true);

        // Construct the URL with the email parameter
        const email = localStorage.getItem('email');
        const url = `${config.REACT_APP_API_URL}/user/?email=${email}`;

        // Make the GET request to retrieve the user details
        axios.get(url)
            .then((response) => {
                // Check if the user is found
                if (response.status === 200) {
                    setName(response.data.user_name); // Assuming user_name is the correct field name
                    setEmail(response.data.email);
                    setUserID(response.data.user_id);
                    firebaseGetFileURL('profile_pictures', `${response.data.user_id}.jpg`)
                        .then((url) => {
                            setProfilePicture(url);
                        })
                        .catch((error) => {
                            console.error('Error fetching profile picture:', error);
                        });
                }
            })
            .catch(error => {
                // Handle the error
                switch (error.response.status) {
                    case 400:
                        toast.error('Bad request');
                        break;
                    case 401 || 403:
                        toast.error('Unauthorized');
                        navigate('/login');
                        break;
                    case 404:
                        toast.error('User not found');
                        navigate('/login');
                        break;
                    default:
                        console.error('Error fetching user data:', error);
                        toast.error('Error fetching user data');
                        break;
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }

    // Handle form submission
    const handleSubmit = event => {
        event.preventDefault();
        setLoading(true);

        // Make the PUT request to update the user details
        const requestBody = {
            email: email,
            user_name: name,
        }

        axios.put(`${config.REACT_APP_API_URL}/user`, requestBody)
            .then(response => {
                toast.success('User details updated successfully');
            })
            .catch(error => {
                // Handle the error
                switch (error.response.status) {
                    case 400:
                        toast.error('Bad request');
                        break;
                    case 401 || 403:
                        toast.error('Unauthorized');
                        navigate('/login');
                        break;
                    case 404:
                        toast.error('User not found');
                        navigate('/login');
                        break;
                    default:
                        console.error('Error updating user data:', error);
                        toast.error('Error updating user data');
                        break;
                }
            })
            .finally(() => {
                setLoading(false);
            });

    };

    return (
        <NonSidebarLayout breadcrumb={`${name} > User Settings`}>
            <div className=" text-white mb-20 px-0 sm:px-12 lg:px-12 xl:px-32">
                <div className="flex flex-col justify-center mx-1 sm:mx-4 lg:mx-40 my-4 bg-black3 px-4 md:px-20 rounded-xl">
                    <div className="flex justify-center items-center">
                        <div className="w-40 h-40 bg-cover rounded-full cursor-pointer flex justify-center items-center mt-12"
                            style={{ backgroundImage: `url(${profilePicture})` }}>
                        </div>
                    </div>
                    <div className="flex justify-center items-center mt-5">
                        <PillButton text="Change Profile picture" onClick={handleButtonClick} isPopup={true} icon={FaUpload} />
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/jpg"
                            onChange={(e) => handleProfilePictureChange(e)}
                        />
                    </div>
                    <h1 className="text-center mb-2 mt-4 text-xl">{name}</h1>
                    <div className="text-green text-center my-1">{email}</div>

                    <div className="text-m text-gray2 font-semibold mt-8">General Settings</div>
                    <div className="flex flex-row mt-1">
                        <div className="flex flex-col w-1/4 md:w-1/6">
                            <div className="text-sm md:text-md text-gray1 font-semibold mt-2">Your name</div>
                        </div>
                        <TextBox type="text" value={name}
                            placeholder="John Doe" maxLength={50} textAlign="left"
                            width="w-full" onChange={handleNameChange} />
                    </div>
                    <div className="flex flex-row mt-1">
                        <div className="flex flex-col w-1/4 md:w-1/6">
                            <div className="text-sm md:text-md text-gray1 font-semibold mt-2">Email</div>
                        </div>
                        <TextBox disabled={true} type="text" placeholder="johndoe123@gmail.com" value={email}
                            maxLength={50} textAlign="left" width="w-full" onChange={handleEmailChange} />
                    </div>
                    <div className="flex justify-center mt-8">
                        <PillButton text="Save Changes" onClick={handleSubmit} isPopup={true} icon={FaUpload} />
                    </div>

                    <div className="border-t border-gray1 border-opacity-80 my-8"></div>
                    <div className="text-m text-gray2 font-semibold mt-4">Critical Settings</div>

                    <div className="flex flex-col mt-4">
                        <CriticalAction buttonText={"Change Password"} title={"Change Password"} subtitle={"Change the password of your user account"} buttonColor={"red"} onClick={() => { handlePasswordReset() }} />
                        <CriticalAction title="Delete your account" subtitle="Delete everything from DataCanvas including your account" buttonText={"Delete Account"} buttonColor={"red"} onClick={() => {
                            setActionType(1);
                            setIsLoginPopupVisible(true)
                        }} />
                        <CriticalAction title="Privacy Policy" subtitle="All your data are protected and verified through a strong privacy policy" buttonText={"View Policy"} buttonColor={"green"} onClick={() => { }} />
                    </div>
                    <div className="mt-8"></div>
                </div>
            </div>

            {/* Popup container for login authentication popup */}
            <LoginPopup

                isOpen={isLoginPopupVisible}
                closeFunction={() => setIsLoginPopupVisible(false)}
                setAuthenticationResult={(e) => setAuthenticationResult(e)}
                email={localStorage.getItem('email')}
            />

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
                theme="dark"
            />
            {/* Spinner */}
            <Spinner isVisible={loading} />


        </NonSidebarLayout>



    );
}
export default UserSettings;