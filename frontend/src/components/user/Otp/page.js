'use client'
import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css'; // Import your CSS module
import Swal from "sweetalert2";


export default function OTP({setResetView,email}) {
    const [otp, setOtp] = useState(['', '', '', '']);
    const [error, setError] = useState('');
    const searchParams = useSearchParams();
    // const email = searchParams.get('email');
    const router = useRouter();
    const inputRefs = useRef([]);

    const handleChange = (e, index) => {
        const { value } = e.target;
        if (/^[0-9]$/.test(value) || value === '') {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            if (value !== '' && index < 3) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const fullOtp = otp.join('');

        try {
            const response = await fetch('http://10.0.2.43:5000/user/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: fullOtp }),
            });

            const data = await response.json();
            if (data.success==true) {
          
                Swal.fire({title:"success",icon:"success",message:"Otp verified"})
                setResetView(true)
              }
              Swal.fire({title:"Invalid Otp",icon:"error",message:"Invalid Otp"})
            
        } catch (error) {
            console.error('OTP verification error:', error);
            setError(data.error.message);
        }
    };

    return (
        <>

            <section className={styles.main}>
                <div className={styles.loginContainer}>
                    <h2 className={styles.loginTitle}>Verify OTP</h2>
                    <form className={styles.loginForm} onSubmit={handleSubmit}>
                        <div className={styles.otpInputGroup}>
                            {otp.map((digit, index) => (
                                <input 
                                    key={index}
                                    type='text'
                                    maxLength='1'
                                    className={styles.otpInput}
                                    value={digit}
                                    onChange={(e) => handleChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    required
                                />
                            ))}
                        </div>
                        <button type='submit' className={styles.submitButton}>Verify OTP</button>
                        {error && <p className={styles.error}>{error}</p>}
                    </form>
                </div>
            </section>
        </>
    );
}
