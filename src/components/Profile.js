import React, { useEffect, useState, useCallback } from "react";
import { useHistory } from "react-router";
import { magic, web3 } from "../magic";
import Loading from "./Loading";
import { Card, Row, Col, Layout, Button, notification} from 'antd';
import PetsData from "../pets.json"
import boxer from "../images/boxer.jpeg"
import goldenRetriever from "../images/golden-retriever.jpeg"
import frenchBulldog from "../images/french-bulldog.jpeg"
import scottishTerrier from "../images/scottish-terrier.jpeg"
import {AdoptionABI, AdoptionContractAddress} from "../contract/contract-abi";

const { Header, Content } = Layout;
const { Meta } = Card;

const PetImages = [boxer, goldenRetriever, frenchBulldog, scottishTerrier];

export default function Profile() {
  const [userMetadata, setUserMetadata] = useState();
  const [adopters, setAdopters] = useState([]);
  const history = useHistory();
  const adoptionContract = new web3.eth.Contract(AdoptionABI, AdoptionContractAddress);

  useEffect(() => {
    // On mount, we check if a user is logged in.
    // If so, we'll retrieve the authenticated user's profile.
    magic.user.isLoggedIn().then(magicIsLoggedIn => {
      if (magicIsLoggedIn) {
        magic.user.getMetadata().then(setUserMetadata);
      } else {
        // If no user is logged in, redirect to `/login`
        history.push("/login");
      }
    });
    adoptionContract.methods.getAdopters().call().then(setAdopters);

  }, []);

  /**
   * Perform logout action via Magic.
   */
  const logout = useCallback(() => {
    magic.user.logout().then(() => {
      history.push("/login");
    })
  }, [history]);

  const openNotificationWithIcon = type => {
    notification[type]({
      message: 'Adopt Success!',
    });
  };

  const handlerAdopt = async (petId) => {
    const transactionResult = await adoptionContract.methods.adopt(petId).send({from: userMetadata.publicAddress});



    const adopters = await adoptionContract.methods.getAdopters().call();
    setAdopters(adopters);

    openNotificationWithIcon('success');

    console.log(transactionResult, adopters);
  };


  const PetDescription = (pet) => {
    let adoptButton;

    if(adopters[pet.id] !== '0x0000000000000000000000000000000000000000'){
      adoptButton = <Button block disabled>Adopted</Button>
    }
    else {
      adoptButton = <Button block onClick={() => handlerAdopt(pet.id)}>Adopt</Button>
    }

    if (adopters[pet.id] === userMetadata.publicAddress) {
      adoptButton = <Button block disabled>Adopted by you</Button>
    }

    return (
        <div>
          <strong>Breed</strong>: <span className="pet-breed">{pet.breed}</span><br/>
          <strong>Age</strong>: <span className="pet-age">{pet.age}</span><br/>
          <strong>Location</strong>: <span className="pet-location">{pet.location}</span><br/>
          {adoptButton}
        </div>
    )
  };


  const PetCard = () => {
    return PetsData.map((pet) => {
      return <Col key={pet.id} offset={2} className="gutter-row" span={4}>
        <Card
            hoverable
            style={{ width: 240 }}
            cover={<img alt="example" src={PetImages[pet.picture]} />}
        >
          <Meta title={pet.name} description={PetDescription(pet)} />
        </Card>,
      </Col>
    });
  };

  return userMetadata ? <div>
    <Layout>
      <Header style={{backgroundColor: 'white'}}>
        <Row>
          <Col offset={8} span={5}>
            <strong>Email:</strong> {userMetadata.email}
          </Col>
          <Col span={10}>
            <strong>Public Address:</strong> {userMetadata.publicAddress}
          </Col>
          <Col span={1}>
            <Button onClick={logout}><strong>Logout</strong></Button>
          </Col>
        </Row>
      </Header>
      <Content style={{backgroundColor: 'white'}}>
        <Row gutter={[16, 24]}>
          {PetCard()}
        </Row>
      </Content>
    </Layout>

  </div> : <Loading />;
}

