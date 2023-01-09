import React from 'react';

import logo from '../assets/logo.png';

const Header = () => {
  return (
    <header className="app--header mt-3 text-center">
      <img className="logo" src={logo} alt="cryptobro-logo"></img>
      <h1>CryptoBro</h1>
      <hr />
    </header>
  )
}

export default Header;
