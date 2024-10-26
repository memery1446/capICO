import { Container } from 'react-bootstrap';
import Navbar from 'react-bootstrap/Navbar';
import logo from '../logo.png';

function App() {
  return(
    <Container>
    <Navbar>
      <img alt="logo" 
      src={logo} 
      width="40" 
      height="40" 
      className= "d-inline-block align-top mx-3"
      />
      <Navbar.Brand href='#'>CKOIN ICO Crowdsale</Navbar.Brand>
      </Navbar>
    </Container>
  )
}

export default App;
