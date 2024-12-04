import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { buyTokens } from '../redux/actions';

const Buy = () => {
    const [amount, setAmount] = useState('0');
    const dispatch = useDispatch();
    
    const isWaiting = useSelector(state => state.ui.loading.purchase);
    const { account } = useSelector(state => state.account);
    const { tokenPrice } = useSelector(state => state.ico);

    const buyHandler = async (e) => {
        e.preventDefault();
        try {
            await dispatch(buyTokens(amount));
            setAmount('0'); // Reset on success
        } catch (error) {
            console.error('Buy handler error:', error);
        }
    }

    return (
        <Form onSubmit={buyHandler} style={{ maxWidth: '800px', margin: '50px auto' }}>
            <Form.Group as={Row}>
                <Col>
                    <Form.Control 
                        type="number" 
                        placeholder="Enter amount" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={isWaiting || !account}
                    />
                </Col>
                <Col className='text-center'>
                    {isWaiting ? (
                        <Spinner animation="border" />
                    ) : (
                        <Button 
                            variant="primary" 
                            type="submit" 
                            style={{ width: '100%' }}
                            disabled={!account || amount <= 0}
                        >
                            Buy Tokens
                        </Button>
                    )}
                </Col>
            </Form.Group>

            {amount > 0 && (
                <Row className="mt-2">
                    <Col className="text-muted">
                        Cost: {(amount * tokenPrice).toFixed(4)} ETH
                    </Col>
                </Row>
            )}

            {!account && (
                <Row className="mt-2">
                    <Col className="text-center text-muted">
                        Please connect your wallet to purchase tokens
                    </Col>
                </Row>
            )}
        </Form>
    );
}

export default Buy;


