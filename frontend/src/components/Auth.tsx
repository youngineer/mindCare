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
        <form className="flex items-center justify-center max-w-3xl" onSubmit={handleSubmit}>
            <div className="hero bg-base-200 min-h-screen">
                <div className="hero-content flex-col lg:flex-row-reverse">
                    <div className="text-center lg:text-left">
                        <h1 className="text-5xl font-bold">Login now!</h1>
                        <p className="py-6">
                            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem
                            quasi. In deleniti eaque aut repudiandae et a id nisi.
                        </p>
                    </div>
                    <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
                        <div className="card-body">
                            <fieldset className="fieldset">
                                {
                                    !isLogin && (
                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend" >Name</legend>
                                            <input
                                                type="text"
                                                className="input"
                                                placeholder="Your name"
                                                name="name"
                                                value={signupPayload.name}
                                                onChange={handleInputChange}
                                            />
                                        </fieldset>
                                    )
                                }
                                <label className="label">Email</label>
                                <input type="email" className="input" placeholder="Email" value={isLogin ? loginPayload.emailId : signupPayload.emailId} />
                                <label className="label">Password</label>
                                <input type="password" className="input" placeholder="Password" value={isLogin ? loginPayload.password : signupPayload.password} />
                                {
                                    !isLogin && (
                                        <div>
                                            <fieldset className="fieldset">
                                                <legend className="fieldset-legend">Confirm Password</legend>
                                                <input
                                                    type="password"
                                                    className="input"
                                                    placeholder="Retype password"
                                                    name="confirmPassword"
                                                    value={isLogin ? loginPayload.password : signupPayload.password}
                                                    onChange={handleInputChange}
                                                />
                                            </fieldset>
                                            <fieldset className="fieldset mt-4">
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
                                            </fieldset>
                                        </div>
                                    )
                                }
                                <div><a className="link link-hover" onClick={() => setIsLogin(prev => !prev)}>{isLogin ? "New user? Signup" : "Already registered? Login"}</a></div>
                                <button className="btn btn-neutral mt-4">{isLogin ? "Login" : "Signup"}</button>
                            </fieldset>
                        </div>
                    </div>
                </div>
            </div>
            {/* <div className="card bg-base-100 w-96 shadow-lg">
                <legend className="fieldset-legend">{isLogin ? "Login" : "Sign Up"}</legend>
                <div className="card-body items-center text-center">
                    {
                        !isLogin && (
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend" >Name</legend>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Your name"
                                    name="name"
                                    value={signupPayload.name}
                                    onChange={handleInputChange}
                                />
                            </fieldset>
                        )
                    }
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend" >Email</legend>
                        <input className="input validator" type="email" onChange={handleInputChange} required placeholder="mail@site.com" value={isLogin ? loginPayload.emailId : signupPayload.emailId}/>
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Password</legend>
                        <input type="password" className="input validator" onChange={handleInputChange} required placeholder="Password"  value={isLogin ? loginPayload.password : signupPayload.password}/>
                    </fieldset>
                    {
                        !isLogin && (
                            <div>
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">Confirm Password</legend>
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="Retype password"
                                        name="confirmPassword"
                                        value={isLogin ? loginPayload.password : signupPayload.password}
                                        onChange={handleInputChange}
                                    />
                                </fieldset>
                                <fieldset className="fieldset mt-4">
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
                                </fieldset>
                            </div>
                        )
                    }
                    <div className="card-actions">
                        <p
                            className='cursor-pointer hover:underline-offset-2'
                            onClick={() => setIsLogin(prev => !prev)}
                        >
                            {!isLogin ? "Already registered? Login" : "New here? Sign Up"}
                        </p>
                        
                    </div>
                    <button className="btn btn-primary" type="submit">Submit</button>
                </div>
            </div> */}
        </form>
    )
}

export default Auth;