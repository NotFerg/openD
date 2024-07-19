import React, { useState, useEffect } from "react";
import logo from "/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { Principal } from "@dfinity/principal";
import { idlFactory as tokenIdlFactory } from "../../../declarations/token2_backend";
import Button from "./Button";
import { openD_backend } from "../../../declarations/openD_backend";
import CURRENT_USER_ID from "..";
import PriceLabel from "./PriceLabel";

function Item(props) {
  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();
  const [sellStatus, setSellStatus] = useState("");
  const [priceLabel,setPriceLabel] = useState("");
  const [shouldDisplay, setShouldDisplay] = useState(true);

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

    if (props.role == "collection") {
      const nftIsListed = await openD_backend.isListed(props.id);

      if (nftIsListed) {
        setOwner("OpenD");
        setBlur({ filter: "blur(5px)" });
        setSellStatus("Listed");
      } else {
        setButton(<Button handleClick={handleSell} text={"Sell"} />);
      }
    } else if (props.role == "discover") {
      const originalOwner = await openD_backend.getOriginalOwner(props.id);
      if (originalOwner != CURRENT_USER_ID.toText()) {
        setButton(<Button handleClick={handleBuy} text={"Buy"} />);
      }

      const price = await openD_backend.getListedNFTPrice(props.id);
      setPriceLabel(<PriceLabel sellPrice={price.toString()} />);
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
    setBlur({ filter: "blur(5px)" });
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

  async function handleBuy() {
    console.log("Buy was triggered");
    setLoaderHidden(false);
    const tokenActor = await Actor.createActor(tokenIdlFactory, {
      agent,
      canisterId: Principal.fromText("bkyz2-fmaaa-aaaaa-qaaaq-cai")
    });

    const sellerId = await openD_backend.getOriginalOwner(props.id);
    const itemPrice = await openD_backend.getListedNFTPrice(props.id);

    const result = await tokenActor.transfer(sellerId, itemPrice);
    if(result == "Success"){
      const transferResult = await openD_backend.completePurchase(props.id,sellerId,CURRENT_USER_ID);
      console.log("purchsae: ",transferResult)
      setLoaderHidden(trrue);
      setShouldDisplay(false);
    }
  };

  return (
    <div style={{display: shouldDisplay ? "inline" : "none"}} className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
        <div className="lds-ellipsis" hidden={loaderHidden}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
          {priceLabel}
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
