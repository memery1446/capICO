import React from 'react';
import styled from 'styled-components';

const HeaderWrapper = styled.header`
  background-color: #003152;
  color: #ffffff;
  padding: 20px;
  width: 100%;
  text-align: center;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
`;

export default function Header() {
  return (
    <HeaderWrapper>
      <Title>CapICO Crowdsale</Title>
    </HeaderWrapper>
  );
}
