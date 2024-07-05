'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css'; // Import your CSS module
import Swal from "sweetalert2";



export default function ResetPassword({email}) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('http://10.0.2.43:5000/user/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({email, password: newPassword }),
            });

            const data = await response.json();

           
            if (data.success==true) {
                Swal.fire({title:"success", icon:"success",text:"Successfully Send"})
                setSuccess(data.message)
                setTimeout(() => {
                    router.push('/');
                }, 2000);
           
         
              }
              setError(data?.error?.message);
        } catch (error) {
            console.error('Password reset error:', error);
            setError(error.message);
        }
    };

    return (
        <>
           

            <section className={styles.main}>
                <div className={styles.loginContainer}>
                    <h2 className={styles.loginTitle}>Reset Password</h2>
                    <form className={styles.loginForm} onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            <label htmlFor='newPassword'>New Password</label>
                            <input
                                type='password'
                                id='newPassword'
                                className={styles.textInput}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor='confirmPassword'>Confirm Password</label>
                            <input
                                type='password'
                                id='confirmPassword'
                                className={styles.textInput}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type='submit' className={styles.submitButton}>Reset Password</button>
                        {error && <p className={styles.error}>{error}</p>}
                        {success && <p className={styles.success}>{success}</p>}
                    </form>
                </div>
            </section>
        </>
    );
}
