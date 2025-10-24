import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppRoute from './assesories/AppRoute'; 
//import Temp from './pages/regression/temp';


function App() {

  return (
    <>
     <AppRoute/>
     {/*<Temp/>*/}
    </>
  )
}

export default App
