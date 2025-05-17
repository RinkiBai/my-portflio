import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />  {/* This renders the matched child route element */}
      </main>
      {/* Optionally footer here */}
    </>
  );
}
