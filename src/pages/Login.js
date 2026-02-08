import React, { useState, useEffect } from "react";
import { FaUser, FaGoogle, FaGithub } from "react-icons/fa";
import { getAuth, setPersistence, browserSessionPersistence, signInWithEmailAndPassword } from "firebase/auth";
import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';
import ButtonRectangle from "../components/input/ButtonRectangle";
import TextBox from "../components/input/TextBox";
import Spinner from "../components/Spinner";
import axios from "axios";
import config from "../config";


function Login() {
    const auth = getAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")

    useEffect(() => {
        // Remove local storage keys
        localStorage.removeItem('auth-token');
        localStorage.removeItem('uid');
        localStorage.removeItem('email');
    }, []);

    const handleGoogleLogin = () => {
        if (loading) return;
        setLoading(true);

        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
                getAuthToken(user);
            }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                const email = error.customData.email;
                const credential = GoogleAuthProvider.credentialFromError(error);
                console.log(errorCode, errorMessage, email, credential);
                toast.warning('An error occurred.' + errorCode + " : " + errorMessage);
                setLoading(false);
            });
    }


    const handleGithubLogin = () => {
        if (loading) return;
        setLoading(true);

        const provider = new GithubAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
                getAuthToken(user);
            }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                const email = error.customData.email;
                const credential = GithubAuthProvider.credentialFromError(error);
                console.log(errorCode, errorMessage, email, credential);
                toast.warning('An error occurred.' + errorCode + " : " + errorMessage);
                setLoading(false);
            });
    }

    const handleLoginWithEmail = () => {

        if (!email || !password) {
            toast.warning('Please enter email and password.');
            return;
        }

        if (loading) return;
        setLoading(true);

        setPersistence(auth, browserSessionPersistence)
            .then(async () => {
                return signInWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        const user = userCredential.user;
                        if (user.emailVerified === false) {
                            toast.error('Email not verified. Please verify your email. Check your email inbox');
                            setLoading(false);
                            return;
                        }
                        getAuthToken(user);
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        if (errorCode === 'auth/invalid-credential') {
                            toast.warning('Wrong Credentials entered.');
                        } else if (errorCode === 'auth/user-not-found') {
                            toast.warning('User not found.');
                        } else if (errorCode === 'auth/invalid-email') {
                            toast.warning('Invalid email.');
                        } else {
                            toast.error("Something went wrong! " + errorMessage);
                        }
                        setLoading(false);
                    });
            })
            .catch((error) => {
                const errorCode = error.code;
                if (errorCode === 'auth/invalid-credential') {
                    toast.warning('Wrong Credentials entered.');
                } else if (errorCode === 'auth/user-not-found') {
                    toast.warning('User not found.');
                } else if (errorCode === 'auth/invalid-email') {
                    toast.warning('Invalid email.');
                } else {
                    toast.error("Something went wrong! " + errorCode);
                }
                setLoading(false);
            });

    }

    const getAuthToken = async (user) => {
        const accessToken = await user.getIdToken();
        const email = user.email;

        if(!email || !accessToken) {
            console.log("Email or Access Token missing");
            toast.error('Something went wrong!');
            setLoading(false);
            return;
        }

        try {
            const result = await axios.post(`${config.REACT_APP_API_URL}/auth/login`, {
                email: email,
                access_token: accessToken,
            });

            if (result.status === 200) {
                localStorage.setItem('auth-token', result.data.token);
                localStorage.setItem('uid', result.data.user.id);
                localStorage.setItem('email', email);
                toast.success("Login Successful");

                setTimeout(() => {
                    localStorage.removeItem('auth-token');
                    localStorage.removeItem('uid');
                    localStorage.removeItem('email');
                }, 7200000);

                setLoading(false);
                navigate('/projects');
            }
        } catch (error) {
            console.log(error);
            toast.error('Something went wrong!');
            setLoading(false);
        }
    }

    return (
        <div className="relative min-h-screen bg-black">
            <div className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm" style={{ backgroundImage: `url(${process.env.PUBLIC_URL + '/img/projects_back_gray.png'})` }}> </div>
            <div className="flex items-center justify-center relative z-10 h-screen">
                {/* Left Side Section */}
                <div className="w-1/2 hidden lg:flex flex-col items-center justify-center">
                    <img src={process.env.PUBLIC_URL + '/img/logo.png'} alt="Logo" className=" w-40" />
                    <h1 className="text-4xl text-gray2 font-bold mt-4 font-poppins">DataCanvas</h1>
                    <h1 className="text-2xl text-gray1 mt-4 ">IoT Data Management Platform</h1>
                </div>

                {/* Right Side Section */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-3 md:p-8">
                    <div className="border w-full sm:w-2/3 border-gray2 border-opacity-30 rounded-lg bg-black3 bg-opacity-50 backdrop-blur-sm p-2 sm:p-5 md:p-10">
                        <FaUser className="text-6xl text-green mx-auto" />
                        <h1 className="text-2xl text-center text-gray2 font-bold mt-4">Login</h1>
                        <div className="flex flex-col items-center justify-center mt-4">
                            <label className="text-gray1 text-sm">Username</label>
                            <TextBox text="" type="email" placeholder="Email" onChange={(e) => { setEmail(e.target.value) }} value={email} />
                        </div>
                        <div className="flex flex-col items-center justify-center mt-4">
                            <label className="text-gray1 text-sm">Password</label>
                            <TextBox text="" type="password" placeholder="Password" onChange={(e) => { setPassword(e.target.value) }} value={password} />
                        </div>
                        <div className="flex justify-center mt-2">
                            <Link to="/forgotpassword">
                                <span href="#" className="text-center text-gray1 hover:text-green text-sm transition duration-300 ease-in-out">Forgot Password?</span>
                            </Link>
                        </div>
                        <div className="flex flex-col items-center justify-center mt-8">
                            <ButtonRectangle text={loading ? "Please Wait" : "Login"} isPopup={false} onClick={() => { handleLoginWithEmail() }} />
                        </div>

                        <div className="flex justify-center mt-3">
                            <Link to="/signup">
                                <span className="text-center text-gray2 hover:text-green text-sm transition duration-300 ease-in-out">Don't have an account? <span className="font-bold">Sign Up</span></span>
                            </Link>
                        </div>

                        {/* Authentication Providers List */}
                        <div className="border-t border-gray1 border-opacity-30 my-6"></div>
                        <h5 className="text-center text-gray1 text-sm">Or</h5>
                        <div className="flex justify-center items-center mt-6  space-x-4">
                            <div className="w-14 h-14 bg-black3 text-green border border-gray1 border-opacity-30 rounded-full flex justify-center items-center hover:bg-black hover:text-gray2 transition duration-300 ease-in-out" onClick={() => { handleGoogleLogin() }}>
                                <FaGoogle className="text-2xl ml-1" />
                            </div>

                            <div className="w-14 h-14 bg-black3 text-green border border-gray1 border-opacity-30 rounded-full flex justify-center items-center hover:bg-black hover:text-gray2 transition duration-300 ease-in-out" onClick={() => { handleGithubLogin() }}>
                                <FaGithub className="text-2xl" />
                            </div>
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
                theme="dark"
            />

        </div>

    );
}


export default Login;