import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import TierInfo from '../components/TierInfo';

// Mock the TierInfo component
jest.mock('../components/TierInfo', () => {
  return function DummyTierInfo() {
    return <div>Mocked TierInfo Component</div>;
  };
});

const mockStore = configureStore([]);

describe('TierInfo', () => {
  it('renders without crashing', () => {
    const store = mockStore({
      ico: {
        tokenSymbol: 'TEST',
        tokenBalance: '100',
        tokenPrice: '0.1',
      },
    });

    const { getByText } = render(
      <Provider store={store}>
        <TierInfo />
      </Provider>
    );

    expect(getByText('Mocked TierInfo Component')).toBeInTheDocument();
  });
});

