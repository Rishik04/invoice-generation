import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
// We don't use zodResolver directly here because we're doing manual validation in `register`
// If you wanted Zod, you would install zod and @hookform/resolvers/zod
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod"; // If using Zod validation

// Import Redux hooks and actions
import { useAppDispatch, useAppSelector } from "@/redux/hooks"; // Adjust path if needed
import { loginUser, registerUser, clearAuthMessages } from "@/redux/slices/authSlice"; // Adjust path if needed

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import styled from "styled-components";
import { useNavigate } from "react-router";

// Define interfaces for form data (matches payloads for Redux thunks)
interface LoginFormInputs {
  email: string;
  password: string;
}

interface RegisterFormInputs {
  name: string;
  username: string;
  email: string;
  password: string;
}

// --- Styled Components Wrapper (unchanged from previous version) ---
const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;

  .image-container {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    max-width: 50%;

    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 768px) {
      display: none;
    }
  }

  .tabs-container {
    width: 100%;
    max-width: 450px;
    margin-left: 20px;

    @media (max-width: 768px) {
      margin-left: 0;
    }
  }

  .card-header {
    text-align: center;
    padding-bottom: 15px;
  }

  .card-title {
    font-size: 1.8em;
    margin-bottom: 5px;
  }

  .card-description {
    color: #666;
  }

  .space-y-1, .space-y-2 {
    margin-bottom: 15px;
  }

  .error-message {
    color: #ef4444; /* Tailwind red-500 */
    margin-top: 10px;
    text-align: center;
    font-size: 0.9em;
  }

  .success-message {
    color: #22c55e; /* Tailwind green-500 */
    margin-top: 10px;
    text-align: center;
    font-size: 0.9em;
  }
`;

// --- DashboardTab Component ---
interface DashboardTabProps {} // Still no specific props needed for this standalone component

const DashboardTab: React.FC<DashboardTabProps> = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // Select relevant state from the Redux store
  const { loading, error, successMessage, isAuthenticated } = useAppSelector((state) => state.auth);

  // --- Login Form with useForm ---
  const {
    register: registerLogin, // Alias to avoid name collision with registerRegister
    handleSubmit: handleLoginSubmit, // Alias for login form's handleSubmit
    formState: { errors: loginErrors }, // Alias for login form's errors
    reset: resetLoginForm, // Alias for login form's reset
  } = useForm<LoginFormInputs>(); // Specify type for login form inputs

  const onSubmitLogin: SubmitHandler<LoginFormInputs> = (data) => {
    // Dispatch the loginUser async thunk with form data
    dispatch(loginUser(data));
    // Optionally reset the form after dispatching
    // resetLoginForm();
  };

  // --- Register Form with useForm ---
  const {
    register: registerRegister, // Alias for registration form's register
    handleSubmit: handleRegisterSubmit, // Alias for registration form's handleSubmit
    formState: { errors: registerErrors }, // Alias for registration form's errors
    reset: resetRegisterForm, // Alias for registration form's reset
  } = useForm<RegisterFormInputs>(); // Specify type for registration form inputs

  const onSubmitRegister: SubmitHandler<RegisterFormInputs> = (data) => {
    // Clear any previous Redux messages (errors/success) before dispatching a new registration attempt
    dispatch(clearAuthMessages());
    // Dispatch the registerUser async thunk with form data
    const resultAction = dispatch(registerUser(data));

    // You can optionally react to the fulfilled action here
    resultAction.then((result) => {
      if (registerUser.fulfilled.match(result)) {
        resetRegisterForm(); // Clear the form only on successful registration
      }
    });
  };

  // Effect to clear Redux messages when component mounts or tab changes
  useEffect(() => {
    dispatch(clearAuthMessages());
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [dispatch,isAuthenticated, navigate]); // Dependency array to run only once on mount and if dispatch changes (rare)

  // Effect to handle redirection or alert on successful login
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, successMessage]); // Depend on isAuthenticated and successMessage

  // Function to handle tab changes, clearing forms and messages
  const handleTabChange = (value: string) => {
    dispatch(clearAuthMessages()); // Clear global Redux messages
    if (value === "login") {
      resetRegisterForm(); // Clear register form if switching to login
    } else {
      resetLoginForm(); // Clear login form if switching to register
    }
  };

  return (
    <Wrapper>
      <div className="image-container">
        <img
          src="https://images.pexels.com/photos/5900226/pexels-photo-5900226.jpeg"
          alt="login illustration"
        />
      </div>
      <div className="tabs-container">
        {/* Pass onValueChange to handle tab switches and clear state */}
        <Tabs defaultValue="login" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          {/* Login Tab Content */}
          <TabsContent value="login">
            <Card>
              <CardHeader className="card-header">
                <CardTitle className="card-title">Login</CardTitle>
                <CardDescription className="card-description">
                  Access your account here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Bind form onSubmit to react-hook-form's handleSubmit */}
                <form onSubmit={handleLoginSubmit(onSubmitLogin)}>
                  <div className="space-y-1">
                    <Label htmlFor="loginEmail">Email</Label>
                    <Input
                      id="loginEmail"
                      type="email"
                      placeholder="name@example.com"
                      // Register input with react-hook-form, add validation rules directly
                      {...registerLogin("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Invalid email address",
                        },
                      })}
                    />
                    {/* Display react-hook-form validation error */}
                    {loginErrors.email && <p className="error-message">{loginErrors.email.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="loginPassword">Password</Label>
                    <Input
                      id="loginPassword"
                      type="password"
                      // Register input with react-hook-form
                      {...registerLogin("password", {
                        required: "Password is required",
                      })}
                    />
                    {/* Display react-hook-form validation error */}
                    {loginErrors.password && <p className="error-message">{loginErrors.password.message}</p>}
                  </div>
                  {/* Display Redux error message (if any) */}
                  {error && <p className="error-message">{error}</p>}
                  {/* Display Redux success message (if any, typically after login) */}
                  {successMessage && isAuthenticated && <p className="success-message">{successMessage}</p>}
                  <CardFooter className="mt-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                      {/* Change button text based on loading state */}
                      {loading ? "Logging in..." : "Login"}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Register Tab Content */}
          <TabsContent value="register">
            <Card>
              <CardHeader className="card-header">
                <CardTitle className="card-title">Register</CardTitle>
                <CardDescription className="card-description">
                  Create a new account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Bind form onSubmit to react-hook-form's handleSubmit */}
                <form onSubmit={handleRegisterSubmit(onSubmitRegister)}>
                  <div className="space-y-1">
                    <Label htmlFor="registerName">Name</Label>
                    <Input
                      id="registerName"
                      type="text"
                      {...registerRegister("name", { required: "Name is required" })}
                    />
                    {registerErrors.name && <p className="error-message">{registerErrors.name.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="registerUsername">Username</Label>
                    <Input
                      id="registerUsername"
                      type="text"
                      {...registerRegister("username", { required: "Username is required" })}
                    />
                    {registerErrors.username && <p className="error-message">{registerErrors.username.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="registerEmail">Email</Label>
                    <Input
                      id="registerEmail"
                      type="email"
                      placeholder="name@example.com"
                      {...registerRegister("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Invalid email address",
                        },
                      })}
                    />
                    {registerErrors.email && <p className="error-message">{registerErrors.email.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="registerPassword">Password</Label>
                    <Input
                      id="registerPassword"
                      type="password"
                      {...registerRegister("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters long",
                        },
                      })}
                    />
                    {registerErrors.password && <p className="error-message">{registerErrors.password.message}</p>}
                  </div>
                  {/* Display Redux error message (if any) */}
                  {error && <p className="error-message">{error}</p>}
                  {/* Display Redux success message for registration */}
                  {successMessage && !error && <p className="success-message">{successMessage}</p>}
                  <CardFooter className="mt-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                      {/* Change button text based on loading state */}
                      {loading ? "Registering..." : "Register"}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Wrapper>
  );
};

export default DashboardTab;