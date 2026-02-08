import React, { useState } from "react";
import { FaUser, FaGoogle, FaGithub, FaHandshake } from "react-icons/fa";
import { Link } from 'react-router-dom';
import ButtonRectangle from "../components/input/ButtonRectangle";
import TextBox from "../components/input/TextBox";
import PopupContainer from "../components/PopupContainer";
import Spinner from "../components/Spinner";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import config from "../config";

function SignUp() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [username, setUserName] = useState("");
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");

    const auth = getAuth();

    const API_URL = `${config.REACT_APP_API_URL}/user`

    const handleSignup = (e) => {
        e.preventDefault();
        setLoading(true);
        createUserWithEmailAndPassword(auth, email, password1, username)
            .then(async (userCredential) => {
                const user = userCredential.user;
                if (user) {
                    const accessToken = await user.getIdToken();
                    sendEmailVerification(user)
                        .then(async () => {
                            createNewUser(email, username, 0, accessToken);
                        });
                }
            })
            .catch((error) => {
                switch (error.code) {
                    case "auth/email-already-in-use":
                        toast.error("Email already in use!");
                        break;
                    case "auth/invalid-email":
                        toast.error("Invalid email!");
                        break;
                    case "auth/weak-password":
                        toast.error("Weak password!");
                        break;
                    default:
                        toast.error("Error occured!");
                        break;
                }
                setLoading(false);
            });
    };

    const validateForm = (e) => {
        if (email === "" || password1 === "" || password2 === "") {
            toast.warn("Please fill out all fields!");
            return;
        }
        else if (password1.length < 6) {
            toast.warn("Password must be at least 6 characters!");
            return;
        }
        else if (password1 !== password2) {
            toast.warn("Passwords do not match!");
            return;
        }
        else {
            handleSignup(e);
        }
    };

    const handleGoogleSignup = () => {
        setLoading(true);
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then(async (result) => {
                const user = result.user;
                const displayName = user.displayName;
                const email = user.email;
                const accessToken = await user.getIdToken();
                createNewUser(email, displayName, 1, accessToken);
            })
            .catch((error) => {
                const errorMessage = error.message;
                toast.error(errorMessage);
                setLoading(false);
            });

    }

    const handleGithubSignup = () => {
        setLoading(true);
        const provider = new GithubAuthProvider();
        signInWithPopup(auth, provider)
            .then(async (result) => {
                const user = result.user;
                const accessToken = await user.getIdToken();
                createNewUser(user.email, user.displayName, 2, accessToken);
            })
            .catch((error) => {
                const errorMessage = error.message;
                toast.error(errorMessage);
                setLoading(false);
            });
    }

    const createNewUser = async (email, username, type, accessToken) => { // type -> determine the authentication type, 0 - for Email/Password, 1 - for Google, 2 - for Github 
        if (type != 0) { // When the authentication type is not Email/Password, check if the user already exists because google and github authentication methods do not check if the user already exists
            try {
                const result = await axios.get(API_URL + "?email=" + email);
                if (result.status === 200) {
                    // navigate to the project handling page
                    toast.success("User signed in successfully");
                    return;
                } else {
                    toast.error("Error occured when adding the user");
                    return;
                }
            } catch (error) {
                switch (error.response.status) {
                    case 404:
                        // User does not exist
                        break;
                    default:
                        toast.error("Server error occured when adding the user");
                        setLoading(false);
                        return;
                }
            }
        }

        try {
            const result = await axios.post(API_URL, { email: email, user_name: username, access_token: accessToken })

            if (result.status === 201) {
                if (type === 0) {
                    openModal();
                } else {
                    //navigate to the project handling page
                    toast.success("User added successfully");
                }
            } else {
                toast.error("Error occured when adding the user");
            }
        } catch (error) {
            toast.error("Server error occured when adding the user");
        } finally {
            setLoading(false);
        }
    }

    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => {
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    return (
        <div className="relative min-h-screen bg-black">
            <div className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm" style={{ backgroundImage: `url(${process.env.PUBLIC_URL + '/img/projects_back_gray.png'})` }}></div>

            <div className="flex items-center justify-center relative z-10 h-screen">
                {/* Left Side Section */}
                <div className="w-1/2 hidden lg:flex flex-col items-center justify-center">
                    <img src={process.env.PUBLIC_URL + '/img/logo.png'} alt="Logo" className=" w-40" />
                    <h1 className="text-4xl text-gray2 font-bold mt-4 font-poppins">DataCanvas</h1>
                    <h1 className="text-2xl text-gray1 mt-4 ">IoT Data Manageement Platform</h1>
                </div>

                {/* Right Side Section */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-3 md:p-8">
                    <div className="border w-full sm:w-2/3 border-gray2 border-opacity-30 rounded-lg bg-black3 bg-opacity-50 backdrop-blur-sm p-2 sm:p-5 md:p-10">
                        <FaUser className="text-6xl text-green mx-auto" />
                        <h1 className="text-2xl text-center text-gray2 font-bold mt-4">Signup</h1>
                        <div className="flex flex-col items-center justify-center mt-4">
                            <label className="text-gray1 text-sm">Email</label>
                            <TextBox text="" type="email" placeholder="Email" maxLength={50} onChange={(e) => setEmail(e.target.value)} value={email} />
                        </div>
                        <div className="flex flex-col items-center justify-center mt-4">
                            <label className="text-gray1 text-sm">Password</label>
                            <TextBox text="" type="password" value={password1} placeholder="Password" onChange={(e) => setPassword1(e.target.value)} />
                        </div>
                        <div className="flex flex-col items-center justify-center mt-4">
                            <label className="text-gray1 text-sm">Confirm Password</label>
                            <TextBox text="" type="password" value={password2} placeholder="Re-enter Password" onChange={(e) => setPassword2(e.target.value)} />
                        </div>
                        <div className="flex flex-col items-center justify-center mt-4">
                            <label className="text-gray1 text-sm">How Shall We Call You?</label>
                            <TextBox text="" type="username" value={username} placeholder="Your Name" maxLength={50} onChange={(e) => setUserName(e.target.value)} />
                        </div>

                        <div className="flex flex-col items-center justify-center mt-8">
                            <ButtonRectangle text="Signup" isPopup={false} onClick={validateForm} />
                        </div>
                        <div className="flex justify-center mt-3">
                            <Link to="/login">
                                <span href="#" className="text-center text-gray2 hover:text-green text-sm transition duration-300 ease-in-out">Aleady have an account? <span className="font-bold">Login</span></span>
                            </Link>
                        </div>

                        {/* Authentication Providers List */}
                        <div className="border-t border-gray1 border-opacity-30 my-6"></div>
                        <h5 className="text-center text-gray1 text-sm">Or</h5>
                        <div className="flex justify-center items-center mt-6  space-x-4">
                            <div className="w-14 h-14 bg-black3 text-green border border-gray1 border-opacity-30 rounded-full flex justify-center items-center hover:bg-black hover:text-gray2 transition duration-300 ease-in-out" onClick={handleGoogleSignup}>
                                <FaGoogle className="text-2xl ml-1" />
                            </div>
                            <div className="w-14 h-14 bg-black3 text-green border border-gray1 border-opacity-30 rounded-full flex justify-center items-center hover:bg-black hover:text-gray2 transition duration-300 ease-in-out" onClick={handleGithubSignup}>
                                <FaGithub className="text-2xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enter user name - Popup */}
            <PopupContainer isOpen={isOpen} onClose={() => { }} Icon={FaHandshake} title='Verify Email' >
                <div className="flex flex-col items-center justify-center mt-2 px-3">
                    <label className="text-gray2 text-sm">Verification email sent to {email}</label>

                </div>
                <div className="flex justify-center mt-4 mb-3">
                    <Link to="/login">
                        <ButtonRectangle text="Done" onClick={closeModal} />
                    </Link>

                </div>
            </PopupContainer>

            {/* Spinner */}
            <Spinner isVisible={loading} />

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
        </div>
    );
}


export default SignUp;