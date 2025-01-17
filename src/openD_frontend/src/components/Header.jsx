import React ,  { useEffect, useState } from "react";
import logo from "/logo.png";
import { BrowserRouter, Link, Switch, Route } from "react-router-dom";
import homeImage from "/home-img.png";
import Minter from "./Minter";
import Gallery from "./Gallery";
import { openD_backend } from "../../../declarations/openD_backend";
import CURRENT_USER_ID from "../index"


function Header() {

  const [userOwnedGallery, setUserOwnedGallery] = useState();
  const [listingGallery, setListingGallery] = useState();

  async function getNFTS(){
    const userNFTIds = await openD_backend.getOwnedNFTs(CURRENT_USER_ID);
    setUserOwnedGallery(<Gallery title = "My NFTS" ids={userNFTIds} role="collection"/>);

    const listedNFTIds = await openD_backend.getListedNFTs();
    console.log(listedNFTIds);
    setListingGallery(<Gallery title="Discover" ids={listedNFTIds} role="discover"/>)
  }

  useEffect(() => {getNFTS()},[])

  return (
    <BrowserRouter forceRefresh={true}>
      <div className="app-root-1">
        <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
          <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
            <div className="header-left-4"></div>
            <img className="header-logo-11" src={logo} />
            <div className="header-vertical-9"></div>
            <Link to= "/">
              <h5 className="Typography-root header-logo-text">OpenD</h5>
            </Link>  
            <div className="header-empty-6"></div>
            <div className="header-space-8"></div>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/discover">Discover</Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/minter">Minter</Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/collection">My NFTS</Link>
            </button>
          </div>
        </header>
      </div>
      
      <Switch>
        <Route exact path="/">
          <img className="bottom-space" src={homeImage} />
        </Route>
        <Route path="/discover">
          {listingGallery}
        </Route>
        <Route path="/minter">
          <Minter />
        </Route>
        <Route path="/collection">
          {userOwnedGallery}
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default Header;
