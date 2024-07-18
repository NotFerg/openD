import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import homeImage from "/home-img.png";
import Item from "./Item";
import Minter from "./Minter";

function App() {

  const NFTID = "bkyz2-fmaaa-aaaaa-qaaaq-cai";
  return (
    <div className="App">
      <Header />
      <Minter />
      {/* <Item id={NFTID}/> */}
      {/* <img className="bottom-space" src={homeImage} /> */}
      <Footer />
    </div>
  );
}

export default App;
