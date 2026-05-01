// import { useEffect } from "react";
// import { useLocation, useNavigate } from "react-router";

// export const meta = () => [
//   {title: "ResumeLab | Auth"},
//   {name: "description", content: "Log into your account"},
// ];

// const auth = () => {
//     const location = useLocation();
//     const next = location.search.split('next=')[1];
//     const navigate = useNavigate();
    


//   return (
//     <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
//       <div className="gradient-border shadow-lg">
//         <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
//           <div className="flex flex-col gap-2 text-center items-center">
//             <h1>Welcome</h1>
//             <h2>Log in to Test your Resume</h2>
//           </div>

//           <div>
//             {isLoading ? (
//               <button className="auth-button animate-pulse">
//                 <p>Signing you in...</p>
//               </button>
//             ) : (
//               <>
//                 {auth.isAuthenticated ? (
//                   <button className="auth-button" onClick={auth.signOut}>
//                     <p> Log Out </p>
//                   </button>
//                 ) : (
//                   <button className="auth-button" onClick={auth.signIn}>
//                     <p> Log In </p>
//                   </button>
//                 )}
//               </>
//             )}
//           </div>
//         </section>
//       </div>
//     </main>
//   );
// };

// export default auth;
