"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import { deleteCookie, setCookie } from "cookies-next";
import Link from "next/link";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";


export default function Login() {
  const [error, setError] = useState("");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const initialValue = {
    username: "",
    password: "",
  };
  const [formData, setFormData] = useState(initialValue);

  const handleData = (event) => {
    const id = event.target.id;
    const value = event.target.value;
    setFormData({ ...formData, [id]: value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://10.0.2.43:5000/user/login",
        formData
      );
      console.log("logindata", response);
      if (response.data.success) {
        setCookie("access-token", response.data.token, {
          maxAge: 60 * 60,
        });
        setCookie("refresh-token", response.data.refreshToken, {
          maxAge: 60 * 60 * 7,
        });
        setFormData(initialValue);
        Swal.fire({
          title:"Login Successfully",
          // message:"Logout Successfully",
          icon:"success"
        })
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Login error");
    }
  };

  return (
    <>
     

      <section className={styles.main}>
        <div className={styles.loginContainer}>
          <h2 className={styles.loginTitle}>Login</h2>
          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="username">Username or Email</label>
              <input
                type="text"
                id="username"
                onChange={handleData}
                placeholder="Enter username or Email"
                className={styles.textInput}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter Password"
                  onChange={handleData}
                  className={styles.passwordInput}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className={styles.inputCheckbox}>
              <input type="checkbox" id="remember-me" name="remember-me" />
              <label htmlFor="remember-me">Remember Me</label>
            </div>
            <button
              type="submit"
              className={styles.submitButton}
              onClick={handleSubmit}
            >
              Login
            </button>
            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.footerLinks}>
              <Link href="/forgot">Forgot Password?</Link>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

