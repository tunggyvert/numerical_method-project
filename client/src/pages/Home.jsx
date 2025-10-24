import React from "react";
import Nav from "../assesories/navbar";

function Home() {
  return (
    <>
      <Nav/>
      <div className="bg-yellow-200 h-screen w-screen flex flex-col items-center justify-center">
        <div className="border border-solid text-align-center p-10 color-black">
          <h1 className="text-black">ใช้ Navigator bar เพื่อใช้ numerical calculator!!</h1>
        </div>
      </div>
    </>
  );
}

export default Home;