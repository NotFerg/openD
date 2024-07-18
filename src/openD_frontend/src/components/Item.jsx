import React, { useState, useEffect } from "react";
import logo from "/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { Principal } from "@dfinity/principal";
import Button from "./Button";
import { openD_backend } from "../../../declarations/openD_backend";

function Item(props) {
  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur,setBlur] = useState();
  const [sellStatus, setSellStatus] = useState("");

  const id = props.id;

  const localhost = "http://localhost:3000";
  const agent = new HttpAgent({ host: localhost });
  // WHEN DEPLOY LIVE REMOVE LINE BELO
  agent.fetchRootKey();
  let NFTActor;

  async function loadNFT() {
    NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id,
    });

    const name = await NFTActor.getName();
    const owner = await NFTActor.getOwner();
    const imageData = await NFTActor.getAsset();
    const imageContent = new Uint8Array(imageData);
    const image = URL.createObjectURL(
      new Blob([imageContent.buffer], { type: "image/png" })
    );
    console.log(image);

    setName(name);
    setOwner(owner.toText());
    setImage(image);

    const nftIsListed = await openD_backend.isListed(props.id);

    if(nftIsListed){
      setOwner("OpenD");
      setBlur({filter: "blur(5px)"});
      setSellStatus("Listed");
    } else{
      setButton(<Button handleClick={handleSell} text={"Sell"} />);
    }
  }

  useEffect(() => {
    loadNFT();
  }, []);

  let price;
  function handleSell() {
    setLoaderHidden(false);
    // console.log("Sell Clicked");
    setPriceInput(
      <input
        placeholder="Price in FERG"
        type="number"
        className="price-input"
        value={price}
        onChange={(e) => (price = e.target.value)}
      />
    );
    setButton(<Button handleClick={sellItem} text={"Confirm"} />);
  }

  async function sellItem() {
    setBlur({filter: "blur(5px)"});
    setLoaderHidden(false);
    // console.log("Confirmed Click");
    const listingResult = await openD_backend.listItem(props.id, Number(price));
    console.log("Listing: ", listingResult);
    if (listingResult == "Success") {
      const openDID = await openD_backend.getOpenDCanisterID();
      const transferResult = await NFTActor.transferOwnership(openDID);
      console.log("transfer: ", transferResult);
      if (transferResult == "Success") {
        setLoaderHidden(true);
        setButton();
        setPriceInput();
        setOwner("OpenD");
        setSellStatus("Listed");
      }
    }
  }

  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
        <div className="lds-ellipsis" hidden = {loaderHidden}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}
            <span className="purple-text"> {sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
