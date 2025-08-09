import React, { useState, type ChangeEvent, type FormEvent } from 'react'
import type { ILoginRequest, ISignupRequest } from '../types/auth';
import { login, signup } from '../services/authServices';

const Auth = () => {
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [loginPayload, setLoginPayload] = useState<ILoginRequest>({
        emailId: "mail@site.com",
        password: "khbaef982w3@"
    });

    const [signupPayload, setSignupPayload] = useState<ISignupRequest>({
        name: "dummy",
        emailId: "dummy@gmail.com",
        password: "Dummy@123",
        confirmPassword: "Dummy@123",
        role: "therapist"
    });

    const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        if (isLogin) {
            setLoginPayload(prev => ({
                ...prev,
                [name]: value
            }));
        } else {
            setSignupPayload(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        try {
            if (isLogin) {
                // login(loginPayload);
                console.log(loginPayload)
            } else {
                // signup(signupPayload);
                console.log(signupPayload)
            }
        } catch (error) {

        }
    }

    return (
        <form className="max-w-3xl" onSubmit={handleSubmit}>
            <div className="hero bg-base-200 items-center">
                <div className="hero-content flex-col lg:flex-row-reverse">
                    <div className="text-center lg:text-left">
                        <h1 className="text-5xl font-bold">{isLogin ? "Login" : "Signup"}</h1>
                        <p className="py-6">
                            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.
                        </p>
                    </div>
                    <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
                        <div className="card-body">
                            <div className="fieldset">
                                {
                                    !isLogin && (
                                        <div className="input-group">
                                            <label htmlFor="name">Name</label>
                                            <input
                                                type="text"
                                                className="input"
                                                placeholder="Your name"
                                                name="name"
                                                value={signupPayload.name}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    )
                                }
                                <div className="input-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        className="input"
                                        placeholder="Email"
                                        value={isLogin ? loginPayload.emailId : signupPayload.emailId}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="Password"
                                        value={isLogin ? loginPayload.password : signupPayload.password}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                {
                                    !isLogin && (
                                        <div>
                                            <div className="input-group">
                                                <label htmlFor="confirmPassword">Confirm Password</label>
                                                <input
                                                    type="password"
                                                    className="input"
                                                    placeholder="Retype password"
                                                    name="confirmPassword"
                                                    value={signupPayload.confirmPassword}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="input-group mt-4">
                                                <select
                                                    className="select"
                                                    name="role"
                                                    value={signupPayload.role || ""}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="" disabled>Pick your role</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="patient">Patient</option>
                                                    <option value="therapist">Therapist</option>
                                                </select>
                                            </div>
                                        </div>
                                    )
                                }
                                <div>
                                    <a
                                        className="link link-hover"
                                        onClick={() => setIsLogin(prev => !prev)}
                                    >
                                        {isLogin ? "New user? Signup" : "Already registered? Login"}
                                    </a>
                                </div>
                                <button className="btn btn-neutral mt-4">{isLogin ? "Login" : "Signup"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default Auth;