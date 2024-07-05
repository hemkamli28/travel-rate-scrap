'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { deleteCookie } from "cookies-next";
import Swal from "sweetalert2";


export default function Navbar() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/";

  const handleLogout = (event) => {
    deleteCookie('access-token');
    deleteCookie('refresh-token');
    Swal.fire({
      title:"Logout Successfully",
      icon:"success"
    })
  };

  return (
    <div className={`nav-bar ${isLoginPage ? "center-title" : ""}`}>
      <div className="title">Travel Rate Scraping</div>
      {!isLoginPage && (
        <div className="nav-links">
          <Link href="/Schedule" className="nav-link">Schedule</Link>
          <Link href="/history" className="nav-link">History</Link>
          <Link href="/" className="nav-link" onClick={handleLogout}>Logout</Link>
        </div>
      )}
    </div>
  );
}
