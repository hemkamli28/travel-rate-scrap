"use client";
import { useState } from "react";
import styles from "./forgot.module.css";
import OTP from "@/components/user/Otp/page";
import ResetPassword from "@/components/user/ResetPassword/page";
import Swal from "sweetalert2"; 

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [otpView, setOtpView] = useState(false);
  const [resetView, setResetView] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://10.0.2.43:5000/user/send-email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );


      const data = await response.json();
      console.log("1",data)
      console.log("2",response)

      if (data.success==true) {
        Swal.fire({title:"success", icon:"success",text:"Successfully Send"})
        setMessage(data.message)
        setOtpView(true);
   
 
      }
      console.log(data?.error?.message);
  
      setError(data?.error?.message);
      
    } catch (error) {
      console.error("Password reset error:", error);
      setError(error.message);
    }
  };

  return (
    <>
     
      {!otpView && !resetView && (
        <section className={styles.main}>
          <div className={styles.loginContainer}>
            <h2 className={styles.loginTitle}>Forgot Password</h2>
            <form className={styles.loginForm} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  className={styles.textInput}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className={styles.submitButton}>
                Reset Password
              </button>
              {message && <p className={styles.success}>{message}</p>}
              {error && <p className={styles.error}>{error}</p>}
            </form>
          </div>
        </section>
      )}

      {otpView && !resetView && <OTP  setResetView = {setResetView}  email={email}/>}

      {otpView && resetView && <ResetPassword  email={email}/> }
    </>
  );
}
